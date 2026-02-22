import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { sendPortalEmails } from '@/lib/email/send';
import { subAcceptedTemplate, subStudentNoticeTemplate } from '@/lib/email/templates';
import {
  portalPathUrl,
  profilePreferenceUrl,
  sessionRangeForRecipient,
  uniqueEmails,
} from '@/lib/portal/phase-c';
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
    .from('sub_requests')
    .select('id,class_id,requesting_coach_id,status,session_date')
    .eq('id', id)
    .maybeSingle();
  if (requestError) return jsonError(requestError.message, 400);
  if (!requestRow) return jsonError('Sub request not found.', 404);
  if (requestRow.requesting_coach_id === session.userId) {
    return jsonError('You cannot accept your own request.', 403);
  }

  const [{ data: classRow }, { data: coachProfile }] = await Promise.all([
    admin.from('classes').select('*').eq('id', requestRow.class_id).maybeSingle(),
    admin.from('coach_profiles').select('tier').eq('coach_id', session.userId).maybeSingle(),
  ]);
  if (!classRow) return jsonError('Class not found.', 404);
  if (!coachProfile || coachProfile.tier !== classRow.eligible_sub_tier) {
    return jsonError('You are not eligible to accept this sub request.', 403);
  }

  const { data: acceptedRow, error: acceptError } = await supabase
    .from('sub_requests')
    .update({
      status: 'accepted',
      accepting_coach_id: session.userId,
      accepted_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'open')
    .select('*')
    .maybeSingle();
  if (acceptError) return jsonError(acceptError.message, 400);
  if (!acceptedRow) {
    return jsonError('This request has already been accepted or closed.', 409);
  }

  const [requestingCoach, acceptingCoach, enrollments] = await Promise.all([
    admin
      .from('profiles')
      .select('id,email,timezone,role,display_name')
      .eq('id', requestRow.requesting_coach_id)
      .maybeSingle(),
    admin
      .from('profiles')
      .select('id,email,timezone,role,display_name')
      .eq('id', session.userId)
      .maybeSingle(),
    admin
      .from('enrollments')
      .select('student_id')
      .eq('class_id', classRow.id)
      .eq('status', 'active'),
  ]);

  const enrollmentRows = (enrollments.data ?? []) as Array<{ student_id: string }>;
  const studentIds = enrollmentRows.map((row) => row.student_id);
  const studentProfiles = studentIds.length
    ? (
        await admin
          .from('profiles')
          .select('id,email,timezone,role')
          .in('id', studentIds)
          .eq('role', 'student')
      ).data ?? []
    : [];
  const typedStudentProfiles = studentProfiles as Array<{
    id: string;
    email: string;
    timezone: string;
    role: string;
  }>;

  const coachPortalUrl = portalPathUrl('/portal/coach/subs');
  const studentPortalUrl = portalPathUrl('/portal/student/classes');

  const toRequester = requestingCoach.data?.email
    ? (() => {
        const whenText = sessionRangeForRecipient({
          sessionDate: requestRow.session_date,
          startTime: classRow.schedule_start_time,
          endTime: classRow.schedule_end_time,
          sourceTimezone: classRow.timezone,
          recipientTimezone: requestingCoach.data?.timezone,
        });
        const template = subAcceptedTemplate({
          className: classRow.name,
          whenText,
          acceptingCoach: acceptingCoach.data?.display_name || acceptingCoach.data?.email || 'Coach',
          portalUrl: coachPortalUrl,
          preferenceUrl: profilePreferenceUrl(requestingCoach.data?.role),
        });
        return [{ to: requestingCoach.data.email, ...template }];
      })()
    : [];

  const studentEmails = uniqueEmails(typedStudentProfiles.map((profile) => profile.email));
  const toStudents = studentEmails.map((email) => {
    const student = typedStudentProfiles.find((profile) => profile.email?.toLowerCase() === email);
    const whenText = sessionRangeForRecipient({
      sessionDate: requestRow.session_date,
      startTime: classRow.schedule_start_time,
      endTime: classRow.schedule_end_time,
      sourceTimezone: classRow.timezone,
      recipientTimezone: student?.timezone,
    });
    const template = subStudentNoticeTemplate({
      className: classRow.name,
      whenText,
      subCoach: acceptingCoach.data?.display_name || acceptingCoach.data?.email || 'Coach',
      portalUrl: studentPortalUrl,
      preferenceUrl: profilePreferenceUrl(student?.role),
    });
    return { to: email, ...template };
  });

  await sendPortalEmails([...toRequester, ...toStudents]);

  return NextResponse.json({ request: acceptedRow });
}
