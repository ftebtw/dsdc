import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { privateCoachAcceptedTemplate } from '@/lib/email/templates';
import {
  loadPrivateSessionParticipants,
  nameOrEmail,
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
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
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
  if (!isAdmin && !isCoachOwner) {
    return mergeCookies(supabaseResponse, jsonError('Not allowed to accept this session.', 403));
  }

  if (row.status !== 'pending' && row.status !== 'rescheduled_by_student') {
    return mergeCookies(
      supabaseResponse,
      jsonError('Only pending or student-rescheduled sessions can be accepted.', 400)
    );
  }

  const updates: Record<string, unknown> = {
    status: 'coach_accepted',
    cancelled_at: null,
    cancelled_by: null,
  };

  if (row.status === 'rescheduled_by_student') {
    updates.requested_date = row.proposed_date || row.requested_date;
    updates.requested_start_time = row.proposed_start_time || row.requested_start_time;
    updates.requested_end_time = row.proposed_end_time || row.requested_end_time;
    updates.proposed_date = null;
    updates.proposed_start_time = null;
    updates.proposed_end_time = null;
    updates.proposed_by = null;
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
  const coachName = nameOrEmail(participants.coach, 'Coach');
  const studentName = nameOrEmail(participants.student, 'Student');

  await sendToStudentAndParents({
    participants,
    row: updatedRow,
    includePreferenceCheck: true,
    pathByRole: {
      student: '/portal/student/booking',
      parent: '/portal/parent/private-sessions',
    },
    buildTemplate: ({ locale, whenText, portalUrl, preferenceUrl }) =>
      privateCoachAcceptedTemplate({
        coachName,
        studentName,
        whenText,
        portalUrl,
        preferenceUrl,
        locale,
      }),
  });

  return mergeCookies(supabaseResponse, NextResponse.json({ session: updatedRow }));
}
