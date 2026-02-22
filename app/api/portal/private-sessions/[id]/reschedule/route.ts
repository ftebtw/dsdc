import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { privateRescheduleProposedTemplate } from '@/lib/email/templates';
import {
  loadPrivateSessionParticipants,
  nameOrEmail,
  sendToCoach,
  sendToStudentAndParents,
  type PrivateSessionWorkflowRow,
} from '@/lib/portal/private-sessions';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const schema = z.object({
  proposedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  proposedStartTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  proposedEndTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  notes: z.string().max(2000).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function normalizeTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta', 'student']);
  if (!session) return jsonError('Unauthorized', 401);

  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid payload.');

  const proposedStartTime = normalizeTime(parsed.data.proposedStartTime);
  const proposedEndTime = normalizeTime(parsed.data.proposedEndTime);
  if (proposedEndTime <= proposedStartTime) {
    return jsonError('Proposed end time must be after start time.');
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const admin = getSupabaseAdminClient();

  const { data: currentRow, error: currentRowError } = await supabase
    .from('private_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (currentRowError) return mergeCookies(supabaseResponse, jsonError(currentRowError.message, 400));
  if (!currentRow) return mergeCookies(supabaseResponse, jsonError('Private session not found.', 404));

  const row = currentRow as PrivateSessionWorkflowRow;
  const isAdmin = session.profile.role === 'admin';
  const isCoachOwner = row.coach_id === session.userId;
  const isStudentOwner = row.student_id === session.userId;
  if (!isAdmin && !isCoachOwner && !isStudentOwner) {
    return mergeCookies(supabaseResponse, jsonError('Not allowed to reschedule this session.', 403));
  }

  if (!['pending', 'coach_accepted', 'rescheduled_by_coach', 'rescheduled_by_student'].includes(row.status)) {
    return mergeCookies(supabaseResponse, jsonError('Session cannot be rescheduled in current status.', 400));
  }

  const proposedByCoachSide = isAdmin || session.profile.role === 'coach' || session.profile.role === 'ta';
  const updates: Record<string, unknown> = {
    proposed_date: parsed.data.proposedDate,
    proposed_start_time: proposedStartTime,
    proposed_end_time: proposedEndTime,
    proposed_by: session.userId,
    status: proposedByCoachSide ? 'rescheduled_by_coach' : 'rescheduled_by_student',
  };

  if (parsed.data.notes?.trim()) {
    if (proposedByCoachSide) {
      updates.coach_notes = parsed.data.notes.trim();
    } else {
      updates.student_notes = parsed.data.notes.trim();
    }
  }

  const { data: updatedData, error: updateError } = await supabase
    .from('private_sessions')
    .update(updates)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));
  if (!updatedData) return mergeCookies(supabaseResponse, jsonError('Unable to update session.', 409));

  const updatedRow = updatedData as PrivateSessionWorkflowRow;
  const participants = await loadPrivateSessionParticipants(admin, updatedRow);
  const proposerName = session.profile.display_name || session.profile.email || 'DSDC';

  if (proposedByCoachSide) {
    await sendToStudentAndParents({
      participants,
      row: updatedRow,
      includePreferenceCheck: true,
      useProposedTime: true,
      pathByRole: {
        student: '/portal/student/booking',
        parent: '/portal/parent/private-sessions',
      },
      buildTemplate: ({ locale, whenText, portalUrl, preferenceUrl }) =>
        privateRescheduleProposedTemplate({
          proposerName,
          proposedWhenText: whenText,
          portalUrl,
          preferenceUrl,
          locale,
        }),
    });
  } else {
    await sendToCoach({
      participants,
      row: updatedRow,
      includePreferenceCheck: true,
      useProposedTime: true,
      pathByRole: {
        coach: '/portal/coach/private-sessions',
        ta: '/portal/coach/private-sessions',
      },
      buildTemplate: ({ locale, whenText, portalUrl, preferenceUrl }) =>
        privateRescheduleProposedTemplate({
          proposerName: nameOrEmail(participants.student, proposerName),
          proposedWhenText: whenText,
          portalUrl,
          preferenceUrl,
          locale,
        }),
    });
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ session: updatedRow }));
}
