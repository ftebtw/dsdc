import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { sendPortalEmails } from '@/lib/email/send';
import { taAcceptedTemplate } from '@/lib/email/templates';
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
  const session = await requireApiRole(request, ['coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);
  const { id } = await params;

  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);
  const admin = getSupabaseAdminClient();

  const { data: requestRow, error: requestError } = await admin
    .from('ta_requests')
    .select('id,class_id,requesting_coach_id,status,session_date')
    .eq('id', id)
    .maybeSingle();
  if (requestError) return jsonError(requestError.message, 400);
  if (!requestRow) return jsonError('TA request not found.', 404);
  if (requestRow.requesting_coach_id === session.userId) {
    return jsonError('You cannot accept your own TA request.', 403);
  }

  const { data: taProfile } = await admin
    .from('coach_profiles')
    .select('is_ta')
    .eq('coach_id', session.userId)
    .maybeSingle();
  if (!taProfile?.is_ta) return jsonError('Only TA profiles can accept TA requests.', 403);

  const { data: acceptedRow, error: acceptError } = await supabase
    .from('ta_requests')
    .update({
      status: 'accepted',
      accepting_ta_id: session.userId,
      accepted_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'open')
    .select('*')
    .maybeSingle();
  if (acceptError) return jsonError(acceptError.message, 400);
  if (!acceptedRow) {
    return jsonError('This TA request has already been accepted or closed.', 409);
  }

  const [classRow, requestingCoach, acceptingTa] = await Promise.all([
    admin.from('classes').select('*').eq('id', requestRow.class_id).maybeSingle(),
    admin
      .from('profiles')
      .select('id,email,timezone,role,display_name,notification_preferences')
      .eq('id', requestRow.requesting_coach_id)
      .maybeSingle(),
    admin
      .from('profiles')
      .select('id,email,display_name')
      .eq('id', session.userId)
      .maybeSingle(),
  ]);

  if (
    classRow.data &&
    requestingCoach.data?.email &&
    shouldSendNotification(
      requestingCoach.data.notification_preferences as Record<string, unknown> | null,
      'ta_request_alerts',
      true
    )
  ) {
    const whenText = sessionRangeForRecipient({
      sessionDate: requestRow.session_date,
      startTime: classRow.data.schedule_start_time,
      endTime: classRow.data.schedule_end_time,
      sourceTimezone: classRow.data.timezone,
      recipientTimezone: requestingCoach.data.timezone,
    });
    const template = taAcceptedTemplate({
      className: classRow.data.name,
      whenText,
      acceptingTa: acceptingTa.data?.display_name || acceptingTa.data?.email || 'TA',
      portalUrl: portalPathUrl('/portal/coach/subs'),
      preferenceUrl: profilePreferenceUrl(requestingCoach.data.role),
    });
    await sendPortalEmails([{ to: requestingCoach.data.email, ...template }]);
  }

  return NextResponse.json({ request: acceptedRow });
}
