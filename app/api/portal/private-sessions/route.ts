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
  studentNotes: z.string().max(2000).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
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
  const session = await requireApiRole(request, ['student']);
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

  const { data: createdRow, error: createError } = await supabase
    .from('private_sessions')
    .insert({
      student_id: session.userId,
      coach_id: slot.coach_id,
      availability_id: slot.id,
      requested_date: slot.available_date,
      requested_start_time: slot.start_time,
      requested_end_time: slot.end_time,
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
      .eq('id', session.userId)
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
      startTime: slot.start_time,
      endTime: slot.end_time,
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

