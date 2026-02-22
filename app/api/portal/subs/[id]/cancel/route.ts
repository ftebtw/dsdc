import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { sendPortalEmails } from '@/lib/email/send';
import { subCancelledTemplate } from '@/lib/email/templates';
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

  const { data: requestRow, error: requestError } = await admin
    .from('sub_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (requestError) return jsonError(requestError.message, 400);
  if (!requestRow) return jsonError('Sub request not found.', 404);

  if (session.profile.role !== 'admin' && requestRow.requesting_coach_id !== session.userId) {
    return jsonError('Only requesting coach or admin can cancel this request.', 403);
  }

  if (requestRow.status === 'cancelled') {
    return NextResponse.json({ request: requestRow });
  }

  const { data: updatedRow, error: updateError } = await supabase
    .from('sub_requests')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select('*')
    .single();
  if (updateError) return jsonError(updateError.message, 400);

  if (requestRow.status === 'accepted' && requestRow.accepting_coach_id) {
    const [classRow, acceptingCoach] = await Promise.all([
      admin.from('classes').select('*').eq('id', requestRow.class_id).maybeSingle(),
      admin
        .from('profiles')
        .select('id,email,timezone,role')
        .eq('id', requestRow.accepting_coach_id)
        .maybeSingle(),
    ]);
    if (classRow.data && acceptingCoach.data?.email) {
      const whenText = sessionRangeForRecipient({
        sessionDate: requestRow.session_date,
        startTime: classRow.data.schedule_start_time,
        endTime: classRow.data.schedule_end_time,
        sourceTimezone: classRow.data.timezone,
        recipientTimezone: acceptingCoach.data.timezone,
      });
      const template = subCancelledTemplate({
        className: classRow.data.name,
        whenText,
        portalUrl: portalPathUrl('/portal/coach/subs'),
        preferenceUrl: profilePreferenceUrl(acceptingCoach.data.role),
      });
      await sendPortalEmails([{ to: acceptingCoach.data.email, ...template }]);
    }
  }

  return NextResponse.json({ request: updatedRow });
}
