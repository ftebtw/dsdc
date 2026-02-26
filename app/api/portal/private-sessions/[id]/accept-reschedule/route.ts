import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { privateRescheduleAcceptedTemplate } from '@/lib/email/templates';
import {
  loadPrivateSessionParticipants,
  sendToCoach,
  sendToStudentAndParents,
  type PrivateSessionWorkflowRow,
} from '@/lib/portal/private-sessions';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta', 'student']);
  if (!session) return jsonError('Unauthorized', 401);

  const { id } = await params;
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

  if (row.status !== 'rescheduled_by_coach' && row.status !== 'rescheduled_by_student') {
    return mergeCookies(supabaseResponse, jsonError('This session has no pending reschedule proposal.', 400));
  }

  if (!isAdmin && row.proposed_by && row.proposed_by === session.userId) {
    return mergeCookies(supabaseResponse, jsonError('The proposer cannot accept their own proposal.', 403));
  }

  if (!isAdmin) {
    if (row.status === 'rescheduled_by_coach' && !isStudentOwner) {
      return mergeCookies(supabaseResponse, jsonError('Only the student can accept this proposal.', 403));
    }
    if (row.status === 'rescheduled_by_student' && !isCoachOwner) {
      return mergeCookies(supabaseResponse, jsonError('Only the coach can accept this proposal.', 403));
    }
  }

  const { data: updatedData, error: updateError } = await supabase
    .from('private_sessions')
    .update({
      requested_date: row.proposed_date || row.requested_date,
      requested_start_time: row.proposed_start_time || row.requested_start_time,
      requested_end_time: row.proposed_end_time || row.requested_end_time,
      proposed_date: null,
      proposed_start_time: null,
      proposed_end_time: null,
      proposed_by: null,
      status: 'coach_accepted',
    })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));
  if (!updatedData) return mergeCookies(supabaseResponse, jsonError('Unable to update session.', 409));

  const updatedRow = updatedData as PrivateSessionWorkflowRow;
  const participants = await loadPrivateSessionParticipants(admin, updatedRow);

  await sendToStudentAndParents({
    participants,
    row: updatedRow,
    includePreferenceCheck: true,
    pathByRole: {
      student: '/portal/student/booking',
      parent: '/portal/parent/private-sessions',
    },
    buildTemplate: ({ locale, whenText, portalUrl, preferenceUrl }) =>
      privateRescheduleAcceptedTemplate({
        whenText,
        portalUrl,
        preferenceUrl,
        locale,
      }),
  });

  await sendToCoach({
    participants,
    row: updatedRow,
    includePreferenceCheck: true,
    pathByRole: {
      coach: '/portal/coach/private-sessions',
      ta: '/portal/coach/private-sessions',
    },
    buildTemplate: ({ locale, whenText, portalUrl, preferenceUrl }) =>
      privateRescheduleAcceptedTemplate({
        whenText,
        portalUrl,
        preferenceUrl,
        locale,
      }),
  });

  return mergeCookies(supabaseResponse, NextResponse.json({ session: updatedRow }));
}
