import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { sendPortalEmails } from '@/lib/email/send';
import { privateCancelledTemplate } from '@/lib/email/templates';
import {
  portalPathUrl,
  profilePreferenceUrl,
  sessionRangeForRecipient,
  uniqueEmails,
} from '@/lib/portal/phase-c';
import { shouldSendNotification } from '@/lib/portal/notifications';
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

  const { data: requestRow, error: rowError } = await supabase
    .from('private_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (rowError) return mergeCookies(supabaseResponse, jsonError(rowError.message, 400));
  if (!requestRow) return mergeCookies(supabaseResponse, jsonError('Private session not found.', 404));

  const isAdmin = session.profile.role === 'admin';
  const isCoachOwner = requestRow.coach_id === session.userId;
  const isStudentOwner = requestRow.student_id === session.userId;
  if (!isAdmin && !isCoachOwner && !isStudentOwner) {
    return mergeCookies(supabaseResponse, jsonError('Not allowed to cancel this session.', 403));
  }
  if (isStudentOwner && requestRow.status !== 'pending') {
    return mergeCookies(supabaseResponse, jsonError('Students can only cancel pending sessions.', 403));
  }
  if (requestRow.status === 'cancelled') return mergeCookies(supabaseResponse, NextResponse.json({ session: requestRow }));

  const { data: updatedRow, error: updateError } = await supabase
    .from('private_sessions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: session.userId,
    })
    .eq('id', id)
    .select('*')
    .single();
  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));

  const { data: people } = await admin
    .from('profiles')
    .select('id,email,timezone,role,display_name,notification_preferences')
    .in('id', [updatedRow.student_id, updatedRow.coach_id, session.userId]);
  const typedPeople = (people ?? []) as Array<{
    id: string;
    email: string;
    timezone: string;
    role: string;
    display_name: string | null;
    notification_preferences: Record<string, unknown> | null;
  }>;
  const peopleMap = new Map(typedPeople.map((person) => [person.id, person]));
  const cancelledBy = peopleMap.get(session.userId);
  const recipients = [peopleMap.get(updatedRow.student_id), peopleMap.get(updatedRow.coach_id)]
    .filter(
      (person): person is NonNullable<typeof person> =>
        Boolean(person) &&
        shouldSendNotification(
          (person as NonNullable<typeof person>).notification_preferences,
          'private_session_alerts',
          true
        )
    );
  const emails = uniqueEmails(recipients.map((person) => person?.email));

  const payloads = emails.map((email) => {
    const recipient = recipients.find((person) => person?.email?.toLowerCase() === email);
    const whenText = sessionRangeForRecipient({
      sessionDate: updatedRow.requested_date,
      startTime: updatedRow.requested_start_time,
      endTime: updatedRow.requested_end_time,
      sourceTimezone: updatedRow.timezone,
      recipientTimezone: recipient?.timezone,
    });
    const template = privateCancelledTemplate({
      whenText,
      cancelledBy: cancelledBy?.display_name || cancelledBy?.email || session.userId,
      portalUrl:
        recipient?.role === 'coach' || recipient?.role === 'ta'
          ? portalPathUrl('/portal/coach/private-sessions')
          : portalPathUrl('/portal/student/booking'),
      preferenceUrl: profilePreferenceUrl(recipient?.role),
    });
    return { to: email, ...template };
  });
  await sendPortalEmails(payloads);

  return mergeCookies(supabaseResponse, NextResponse.json({ session: updatedRow }));
}
