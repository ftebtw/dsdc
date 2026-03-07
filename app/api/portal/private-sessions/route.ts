import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { sendPortalEmails } from '@/lib/email/send';
import { privateRequestedTemplate } from '@/lib/email/templates';
import { shouldSendNotification } from '@/lib/portal/notifications';
import { portalPathUrl, profilePreferenceUrl, sessionRangeForRecipient } from '@/lib/portal/phase-c';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const createSchema = z.object({
  availabilityId: z.string().uuid(),
  requestedStartTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  requestedEndTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  studentNotes: z.string().max(2000).optional(),
  studentId: z.string().uuid().optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function normalizeTime(value: string): string {
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed.slice(0, 5);
  return trimmed.slice(0, 5);
}

function toMinutes(value: string): number | null {
  const normalized = normalizeTime(value);
  const match = normalized.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function toTimeWithSeconds(value: string): string {
  return `${normalizeTime(value)}:00`;
}

export async function GET(request: NextRequest) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta', 'student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const coachId = searchParams.get('coachId');
  const studentId = searchParams.get('studentId');

  let query = supabase.from('private_sessions').select('*').order('requested_date', { ascending: true });
  if (status) query = query.eq('status', status);
  if (session.profile.role === 'admin') {
    if (coachId) query = query.eq('coach_id', coachId);
    if (studentId) query = query.eq('student_id', studentId);
  }

  const { data, error } = await query;
  if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 400));
  return mergeCookies(supabaseResponse, NextResponse.json({ sessions: data ?? [] }));
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const body = createSchema.safeParse(await request.json());
  if (!body.success) return jsonError('Invalid payload.');

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const admin = getSupabaseAdminClient();

  const { data: slot, error: slotError } = await supabase
    .from('coach_availability')
    .select('*')
    .eq('id', body.data.availabilityId)
    .eq('is_private', true)
    .maybeSingle();
  if (slotError) return mergeCookies(supabaseResponse, jsonError(slotError.message, 400));
  if (!slot) return mergeCookies(supabaseResponse, jsonError('Availability slot not found.', 404));
  const today = new Date().toISOString().slice(0, 10);
  if (slot.available_date < today) return mergeCookies(supabaseResponse, jsonError('Cannot request past availability slots.', 400));

  const slotStart = normalizeTime(slot.start_time);
  const slotEnd = normalizeTime(slot.end_time);
  const requestedStart = body.data.requestedStartTime ? normalizeTime(body.data.requestedStartTime) : slotStart;
  const requestedEnd = body.data.requestedEndTime ? normalizeTime(body.data.requestedEndTime) : slotEnd;

  const slotStartMinutes = toMinutes(slotStart);
  const slotEndMinutes = toMinutes(slotEnd);
  const requestedStartMinutes = toMinutes(requestedStart);
  const requestedEndMinutes = toMinutes(requestedEnd);
  if (
    slotStartMinutes === null ||
    slotEndMinutes === null ||
    requestedStartMinutes === null ||
    requestedEndMinutes === null
  ) {
    return mergeCookies(supabaseResponse, jsonError('Invalid session time format.', 400));
  }

  if (requestedStartMinutes < slotStartMinutes || requestedEndMinutes > slotEndMinutes) {
    return mergeCookies(
      supabaseResponse,
      jsonError('Requested time must be within the selected availability window.', 400)
    );
  }
  if (requestedEndMinutes <= requestedStartMinutes) {
    return mergeCookies(
      supabaseResponse,
      jsonError('Requested end time must be later than start time.', 400)
    );
  }

  const durationMinutes = requestedEndMinutes - requestedStartMinutes;
  if (requestedStartMinutes % 60 !== 0 || requestedEndMinutes % 60 !== 0) {
    return mergeCookies(
      supabaseResponse,
      jsonError('Private sessions must start and end on the hour.', 400)
    );
  }
  if (durationMinutes < 60 || durationMinutes % 60 !== 0) {
    return mergeCookies(
      supabaseResponse,
      jsonError('Private sessions must be in 1-hour increments (minimum 1 hour).', 400)
    );
  }

  let bookingStudentId = session.userId;

  if (body.data.studentId && session.profile.role === 'parent') {
    const { data: link } = await admin
      .from('parent_student_links')
      .select('id')
      .eq('parent_id', session.userId)
      .eq('student_id', body.data.studentId)
      .maybeSingle();

    if (!link) {
      return mergeCookies(supabaseResponse, jsonError('Student is not linked to your account.', 403));
    }

    bookingStudentId = body.data.studentId;
  }

  const { data: createdRow, error: createError } = await supabase
    .from('private_sessions')
    .insert({
      student_id: bookingStudentId,
      coach_id: slot.coach_id,
      availability_id: slot.id,
      requested_date: slot.available_date,
      requested_start_time: toTimeWithSeconds(requestedStart),
      requested_end_time: toTimeWithSeconds(requestedEnd),
      timezone: slot.timezone,
      status: 'pending',
      student_notes: body.data.studentNotes || null,
    })
    .select('*')
    .single();
  if (createError) return mergeCookies(supabaseResponse, jsonError(createError.message, 400));

  const [studentProfile, coachProfile] = await Promise.all([
    admin
      .from('profiles')
      .select('id,email,display_name')
      .eq('id', bookingStudentId)
      .maybeSingle(),
    admin
      .from('profiles')
      .select('id,email,timezone,role,notification_preferences')
      .eq('id', slot.coach_id)
      .maybeSingle(),
  ]);

  if (
    coachProfile.data?.email &&
    shouldSendNotification(
      coachProfile.data.notification_preferences as Record<string, unknown> | null,
      'private_session_alerts',
      true
    )
  ) {
    const whenText = sessionRangeForRecipient({
      sessionDate: slot.available_date,
      startTime: requestedStart,
      endTime: requestedEnd,
      sourceTimezone: slot.timezone,
      recipientTimezone: coachProfile.data.timezone,
    });
    const template = privateRequestedTemplate({
      studentName: studentProfile.data?.display_name || studentProfile.data?.email || 'Student',
      whenText,
      notes: body.data.studentNotes || null,
      portalUrl: portalPathUrl('/portal/coach/private-sessions'),
      preferenceUrl: profilePreferenceUrl(coachProfile.data.role),
    });
    await sendPortalEmails([{ to: coachProfile.data.email, ...template }]);
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ session: createdRow }));
}

