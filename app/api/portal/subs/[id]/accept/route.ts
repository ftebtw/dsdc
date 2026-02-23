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
import { shouldSendNotification } from '@/lib/portal/notifications';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isMissingTierAssignmentsTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  return (error as { code?: string }).code === '42P01';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);
  const { id } = await params;

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const admin = getSupabaseAdminClient();

  const { data: requestRow, error: requestError } = await admin
    .from('sub_requests')
    .select('id,class_id,requesting_coach_id,status,session_date')
    .eq('id', id)
    .maybeSingle();
  if (requestError) return mergeCookies(supabaseResponse, jsonError(requestError.message, 400));
  if (!requestRow) return mergeCookies(supabaseResponse, jsonError('Sub request not found.', 404));
  if (requestRow.requesting_coach_id === session.userId) {
    return mergeCookies(supabaseResponse, jsonError('You cannot accept your own request.', 403));
  }

  const [{ data: classRow }, coachTiersResult] = await Promise.all([
    admin.from('classes').select('*').eq('id', requestRow.class_id).maybeSingle(),
    admin.from('coach_tier_assignments').select('tier').eq('coach_id', session.userId),
  ]);
  if (!classRow) return mergeCookies(supabaseResponse, jsonError('Class not found.', 404));

  let coachTiers = (coachTiersResult.data ?? []) as Array<{ tier: string }>;
  if (coachTiersResult.error && isMissingTierAssignmentsTableError(coachTiersResult.error)) {
    const { data: fallbackCoachProfile, error: fallbackCoachProfileError } = await admin
      .from('coach_profiles')
      .select('tier')
      .eq('coach_id', session.userId)
      .maybeSingle();
    if (fallbackCoachProfileError) {
      return mergeCookies(supabaseResponse, jsonError(fallbackCoachProfileError.message, 400));
    }
    coachTiers = fallbackCoachProfile?.tier ? [{ tier: fallbackCoachProfile.tier }] : [];
  }
  const tierSet = new Set(
    coachTiers
      .map((row) => row.tier)
      .filter((tier): tier is string => Boolean(tier))
  );
  if (!tierSet.has(classRow.eligible_sub_tier)) {
    return mergeCookies(supabaseResponse, jsonError('You are not eligible to accept this sub request.', 403));
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
  if (acceptError) return mergeCookies(supabaseResponse, jsonError(acceptError.message, 400));
  if (!acceptedRow) {
    return mergeCookies(supabaseResponse, jsonError('This request has already been accepted or closed.', 409));
  }

  const [requestingCoach, acceptingCoach, enrollments] = await Promise.all([
    admin
      .from('profiles')
      .select('id,email,timezone,role,display_name,notification_preferences')
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
      .select('id,email,timezone,role,notification_preferences')
      .in('id', studentIds)
      .eq('role', 'student')
      ).data ?? []
    : [];
  const typedStudentProfiles = studentProfiles as Array<{
    id: string;
    email: string;
    timezone: string;
    role: string;
    notification_preferences: Record<string, unknown> | null;
  }>;
  const parentLinks = studentIds.length
    ? (
        (
          await admin
            .from('parent_student_links')
            .select('student_id,parent_id')
            .in('student_id', studentIds)
        ).data ?? []
      )
    : [];
  const parentIds = [
    ...new Set(
      (parentLinks as Array<{ student_id: string; parent_id: string }>)
        .map((link) => link.parent_id)
        .filter((value): value is string => Boolean(value))
    ),
  ];
  const parentProfiles = parentIds.length
    ? (
        (
          await admin
            .from('profiles')
            .select('id,email,timezone,role,notification_preferences')
            .in('id', parentIds)
            .eq('role', 'parent')
        ).data ?? []
      )
    : [];
  const typedParentProfiles = parentProfiles as Array<{
    id: string;
    email: string;
    timezone: string;
    role: string;
    notification_preferences: Record<string, unknown> | null;
  }>;
  const parentIdsByStudent = new Map<string, string[]>();
  for (const link of parentLinks as Array<{ student_id: string; parent_id: string }>) {
    const existing = parentIdsByStudent.get(link.student_id) ?? [];
    existing.push(link.parent_id);
    parentIdsByStudent.set(link.student_id, existing);
  }

  const coachPortalUrl = portalPathUrl('/portal/coach/subs');
  const studentPortalUrl = portalPathUrl('/portal/student/classes');
  const parentPortalUrl = portalPathUrl('/portal/parent/classes');

  const toRequester =
    requestingCoach.data?.email &&
    shouldSendNotification(
      requestingCoach.data.notification_preferences as Record<string, unknown> | null,
      'sub_request_alerts',
      true
    )
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

  const recipientProfiles = new Map<
    string,
    {
      id: string;
      email: string;
      timezone: string;
      role: string;
      notification_preferences: Record<string, unknown> | null;
    }
  >();
  for (const student of typedStudentProfiles) {
    if (shouldSendNotification(student.notification_preferences, 'general_updates', true)) {
      recipientProfiles.set(student.id, student);
    }
    for (const parentId of parentIdsByStudent.get(student.id) ?? []) {
      const parent = typedParentProfiles.find((profile) => profile.id === parentId);
      if (!parent) continue;
      if (!shouldSendNotification(parent.notification_preferences, 'general_updates', true)) continue;
      recipientProfiles.set(parent.id, parent);
    }
  }

  const notificationRecipients = [...recipientProfiles.values()];
  const recipientEmails = uniqueEmails(notificationRecipients.map((profile) => profile.email));
  const toStudents = recipientEmails.map((email) => {
    const student = notificationRecipients.find((profile) => profile.email?.toLowerCase() === email);
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
      portalUrl: student?.role === 'parent' ? parentPortalUrl : studentPortalUrl,
      preferenceUrl: profilePreferenceUrl(student?.role),
    });
    return { to: email, ...template };
  });

  await sendPortalEmails([...toRequester, ...toStudents]);

  return mergeCookies(supabaseResponse, NextResponse.json({ request: acceptedRow }));
}
