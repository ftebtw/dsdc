import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { sendPortalEmails } from '@/lib/email/send';
import { privateConfirmedTemplate } from '@/lib/email/templates';
import { shouldSendNotification } from '@/lib/portal/notifications';
import { portalPathUrl, profilePreferenceUrl, sessionRangeForRecipient } from '@/lib/portal/phase-c';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient } from '@/lib/supabase/route';

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

  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);
  const admin = getSupabaseAdminClient();

  const { data: requestRow, error: rowError } = await supabase
    .from('private_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (rowError) return jsonError(rowError.message, 400);
  if (!requestRow) return jsonError('Private session not found.', 404);

  if (session.profile.role !== 'admin' && requestRow.coach_id !== session.userId) {
    return jsonError('Not allowed to confirm this session.', 403);
  }
  if (requestRow.status !== 'pending') {
    return jsonError('Only pending sessions can be confirmed.', 400);
  }

  const { data: updatedRow, error: updateError } = await supabase
    .from('private_sessions')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      cancelled_at: null,
      cancelled_by: null,
    })
    .eq('id', id)
    .eq('status', 'pending')
    .select('*')
    .maybeSingle();
  if (updateError) return jsonError(updateError.message, 400);
  if (!updatedRow) return jsonError('Session is no longer pending.', 409);

  const [studentProfile, coachProfile] = await Promise.all([
    admin
      .from('profiles')
      .select('id,email,timezone,role,notification_preferences')
      .eq('id', updatedRow.student_id)
      .maybeSingle(),
    admin
      .from('profiles')
      .select('display_name,email')
      .eq('id', updatedRow.coach_id)
      .maybeSingle(),
  ]);
  if (
    studentProfile.data?.email &&
    shouldSendNotification(
      studentProfile.data.notification_preferences as Record<string, unknown> | null,
      'private_session_alerts',
      true
    )
  ) {
    const whenText = sessionRangeForRecipient({
      sessionDate: updatedRow.requested_date,
      startTime: updatedRow.requested_start_time,
      endTime: updatedRow.requested_end_time,
      sourceTimezone: updatedRow.timezone,
      recipientTimezone: studentProfile.data.timezone,
    });
    const template = privateConfirmedTemplate({
      coachName: coachProfile.data?.display_name || coachProfile.data?.email || 'Coach',
      whenText,
      portalUrl: portalPathUrl('/portal/student/booking'),
      preferenceUrl: profilePreferenceUrl(studentProfile.data.role),
    });
    await sendPortalEmails([{ to: studentProfile.data.email, ...template }]);
  }

  return NextResponse.json({ session: updatedRow });
}
