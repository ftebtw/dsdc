import { NextRequest, NextResponse } from 'next/server';
import { sendPortalEmail } from '@/lib/email/send';
import {
  classResourcePostedTemplate,
  homeworkAssignmentPostedTemplate,
  homeworkGradedTemplate,
} from '@/lib/email/templates';
import { isCronAuthorized } from '@/lib/portal/cron';
import { shouldSendAndRecord, shouldSendNotification } from '@/lib/portal/notifications';
import { portalPathUrl, profilePreferenceUrl } from '@/lib/portal/phase-c';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

// Looks back 7 days for resources/homework and 14 for grading so this cron
// can recover from outages but never spams about stale content. New items
// posted after this feature shipped get a notification on the next run.
const RESOURCE_LOOKBACK_DAYS = 7;
const ASSIGNMENT_LOOKBACK_DAYS = 7;
const GRADED_LOOKBACK_DAYS = 14;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

type ProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  notification_preferences: Record<string, unknown> | null;
};

type ClassRow = {
  id: string;
  name: string;
  coach_id: string;
  is_private_session_group: boolean | null;
  archived_at: string | null;
};

type Recipient = {
  profile: ProfileRow;
  studentName?: string;
};

async function fetchRecipientsForClass(
  admin: any,
  classId: string,
  profileById: Map<string, ProfileRow>,
  parentsByStudent: Map<string, string[]>
): Promise<Recipient[]> {
  const { data: enrollments } = await admin
    .from('enrollments')
    .select('student_id,status')
    .eq('class_id', classId)
    .eq('status', 'active');

  const studentIds = ((enrollments ?? []) as Array<{ student_id: string }>).map((row) => row.student_id);
  const recipients: Recipient[] = [];

  for (const studentId of studentIds) {
    const studentProfile = profileById.get(studentId);
    const studentName = studentProfile?.display_name || studentProfile?.email || 'Student';
    if (studentProfile) {
      recipients.push({ profile: studentProfile, studentName });
    }
    const parentIds = parentsByStudent.get(studentId) ?? [];
    for (const parentId of parentIds) {
      const parentProfile = profileById.get(parentId);
      if (parentProfile) {
        recipients.push({ profile: parentProfile, studentName });
      }
    }
  }
  // Dedupe by profile id — a parent linked to multiple enrolled students in
  // the same class only gets one email per item.
  const seen = new Set<string>();
  return recipients.filter((entry) => {
    if (seen.has(entry.profile.id)) return false;
    seen.add(entry.profile.id);
    return true;
  });
}

async function getProfilesAndLinks(
  admin: any,
  classIds: string[]
): Promise<{
  profileById: Map<string, ProfileRow>;
  parentsByStudent: Map<string, string[]>;
}> {
  // Pull all enrolled students for the given classes (plus their parents).
  const { data: enrollments } = await admin
    .from('enrollments')
    .select('student_id,class_id,status')
    .in('class_id', classIds)
    .eq('status', 'active');

  const studentIds = [
    ...new Set(((enrollments ?? []) as Array<{ student_id: string }>).map((row) => row.student_id)),
  ];

  let parentLinks: Array<{ parent_id: string; student_id: string }> = [];
  if (studentIds.length > 0) {
    const { data: parentLinksData } = await admin
      .from('parent_student_links')
      .select('parent_id,student_id')
      .in('student_id', studentIds);
    parentLinks = (parentLinksData ?? []) as Array<{ parent_id: string; student_id: string }>;
  }

  const parentIds = [...new Set(parentLinks.map((row) => row.parent_id))];
  const recipientIds = [...new Set([...studentIds, ...parentIds])];

  const profileById = new Map<string, ProfileRow>();
  if (recipientIds.length > 0) {
    const { data: profiles } = await admin
      .from('profiles')
      .select('id,email,display_name,role,notification_preferences')
      .in('id', recipientIds);
    for (const profile of (profiles ?? []) as ProfileRow[]) {
      profileById.set(profile.id, profile);
    }
  }

  const parentsByStudent = new Map<string, string[]>();
  for (const link of parentLinks) {
    const list = parentsByStudent.get(link.student_id) ?? [];
    list.push(link.parent_id);
    parentsByStudent.set(link.student_id, list);
  }

  return { profileById, parentsByStudent };
}

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) return jsonError('Unauthorized', 401);

  const admin = getSupabaseAdminClient();
  const nowIso = new Date().toISOString();

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  // ---- 1. Resources: posted/published in the lookback window ------------
  const { data: resourcesData } = await admin
    .from('resources')
    .select('id,title,type,class_id,posted_by,publish_at,created_at')
    .not('class_id', 'is', null)
    .lte('publish_at', nowIso)
    .gte('publish_at', isoDaysAgo(RESOURCE_LOOKBACK_DAYS));

  const resources = (resourcesData ?? []) as Array<{
    id: string;
    title: string;
    type: string | null;
    class_id: string;
    posted_by: string;
    publish_at: string;
    created_at: string;
  }>;

  // ---- 2. Homework assignments: same lookback ---------------------------
  const { data: assignmentsData } = await admin
    .from('homework_assignments')
    .select('id,title,description,due_date,class_id,posted_by,publish_at')
    .lte('publish_at', nowIso)
    .gte('publish_at', isoDaysAgo(ASSIGNMENT_LOOKBACK_DAYS));

  const assignments = (assignmentsData ?? []) as Array<{
    id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    class_id: string;
    posted_by: string;
    publish_at: string;
  }>;

  // ---- 3. Homework submissions: recently graded -------------------------
  const { data: submissionsData } = await admin
    .from('homework_submissions')
    .select('id,title,class_id,student_id,grade,feedback,graded_at,graded_by')
    .not('graded_at', 'is', null)
    .gte('graded_at', isoDaysAgo(GRADED_LOOKBACK_DAYS));

  const submissions = (submissionsData ?? []) as Array<{
    id: string;
    title: string;
    class_id: string;
    student_id: string;
    grade: string | null;
    feedback: string | null;
    graded_at: string;
    graded_by: string | null;
  }>;

  const allClassIds = [
    ...new Set([
      ...resources.map((r) => r.class_id),
      ...assignments.map((a) => a.class_id),
      ...submissions.map((s) => s.class_id),
    ]),
  ];

  if (allClassIds.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0, failed: 0, reason: 'nothing_to_notify' });
  }

  const { data: classesData } = await admin
    .from('classes')
    .select('id,name,coach_id,is_private_session_group,archived_at')
    .in('id', allClassIds);
  const classes = (classesData ?? []) as ClassRow[];
  const classById = new Map(classes.map((c) => [c.id, c]));

  // Skip archived classes entirely.
  const activeClassIds = classes.filter((c) => !c.archived_at).map((c) => c.id);

  const coachIds = [...new Set(classes.map((c) => c.coach_id))];
  const { data: coachProfilesData } = await admin
    .from('profiles')
    .select('id,display_name,email')
    .in('id', coachIds);
  const coachById = new Map(
    ((coachProfilesData ?? []) as Array<{ id: string; display_name: string | null; email: string }>).map(
      (c) => [c.id, c]
    )
  );

  const { profileById, parentsByStudent } = await getProfilesAndLinks(admin, activeClassIds);

  async function sendOne(input: {
    recipient: Recipient;
    notificationType: 'class_resource_posted' | 'homework_assignment_posted' | 'homework_graded';
    referenceId: string;
    preferenceKey: 'class_resource_alerts' | 'class_homework_alerts' | 'homework_graded_alerts';
    subject: string;
    html: string;
    text: string;
  }) {
    const recipient = input.recipient;

    if (!shouldSendNotification(recipient.profile.notification_preferences, input.preferenceKey, true)) {
      skipped += 1;
      return;
    }

    // Atomic dedupe — if a log row already exists, this returns false.
    const ok = await shouldSendAndRecord(
      admin,
      recipient.profile.id,
      input.notificationType,
      input.referenceId
    );
    if (!ok) {
      skipped += 1;
      return;
    }

    const result = await sendPortalEmail({
      to: recipient.profile.email,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    if (result.ok) {
      sent += 1;
    } else {
      failed += 1;
      console.error('[class-content-alerts] send failed', {
        recipientId: recipient.profile.id,
        type: input.notificationType,
        ref: input.referenceId,
        error: result.error,
      });
    }
  }

  // ---- Send resource notifications --------------------------------------
  for (const resource of resources) {
    const klass = classById.get(resource.class_id);
    if (!klass || klass.archived_at) continue;
    const recipients = await fetchRecipientsForClass(admin, resource.class_id, profileById, parentsByStudent);
    const coach = coachById.get(resource.posted_by) || coachById.get(klass.coach_id);
    const postedBy = coach?.display_name || coach?.email || 'A DSDC coach';

    for (const recipient of recipients) {
      const portalPath =
        recipient.profile.role === 'parent'
          ? `/portal/parent/resources?classId=${encodeURIComponent(resource.class_id)}`
          : `/portal/student/resources?classId=${encodeURIComponent(resource.class_id)}`;
      const template = classResourcePostedTemplate({
        recipientName: recipient.profile.display_name || recipient.profile.email,
        recipientRole: recipient.profile.role === 'parent' ? 'parent' : 'student',
        studentName: recipient.studentName,
        className: klass.name,
        resourceTitle: resource.title,
        resourceType: resource.type,
        postedBy,
        portalUrl: portalPathUrl(portalPath),
        preferenceUrl: profilePreferenceUrl(recipient.profile.role),
      });
      await sendOne({
        recipient,
        notificationType: 'class_resource_posted',
        referenceId: resource.id,
        preferenceKey: 'class_resource_alerts',
        ...template,
      });
    }
  }

  // ---- Send homework assignment notifications ---------------------------
  for (const assignment of assignments) {
    const klass = classById.get(assignment.class_id);
    if (!klass || klass.archived_at) continue;
    const recipients = await fetchRecipientsForClass(admin, assignment.class_id, profileById, parentsByStudent);
    const coach = coachById.get(assignment.posted_by) || coachById.get(klass.coach_id);
    const postedBy = coach?.display_name || coach?.email || 'A DSDC coach';

    for (const recipient of recipients) {
      const portalPath =
        recipient.profile.role === 'parent'
          ? `/portal/parent/resources?classId=${encodeURIComponent(assignment.class_id)}#homework`
          : `/portal/student/homework?classId=${encodeURIComponent(assignment.class_id)}`;
      const template = homeworkAssignmentPostedTemplate({
        recipientName: recipient.profile.display_name || recipient.profile.email,
        recipientRole: recipient.profile.role === 'parent' ? 'parent' : 'student',
        studentName: recipient.studentName,
        className: klass.name,
        assignmentTitle: assignment.title,
        description: assignment.description,
        dueDate: assignment.due_date,
        postedBy,
        portalUrl: portalPathUrl(portalPath),
        preferenceUrl: profilePreferenceUrl(recipient.profile.role),
      });
      await sendOne({
        recipient,
        notificationType: 'homework_assignment_posted',
        referenceId: assignment.id,
        preferenceKey: 'class_homework_alerts',
        ...template,
      });
    }
  }

  // ---- Send homework graded notifications -------------------------------
  for (const submission of submissions) {
    const klass = classById.get(submission.class_id);
    if (!klass || klass.archived_at) continue;
    const studentProfile = profileById.get(submission.student_id);
    if (!studentProfile) continue;
    const studentName = studentProfile.display_name || studentProfile.email;

    const recipients: Recipient[] = [{ profile: studentProfile, studentName }];
    const parentIds = parentsByStudent.get(submission.student_id) ?? [];
    for (const parentId of parentIds) {
      const parentProfile = profileById.get(parentId);
      if (parentProfile) recipients.push({ profile: parentProfile, studentName });
    }

    const grader =
      submission.graded_by != null ? coachById.get(submission.graded_by) || null : null;
    const coachOfClass = coachById.get(klass.coach_id);
    const gradedBy = grader?.display_name || grader?.email || coachOfClass?.display_name || 'A DSDC coach';

    for (const recipient of recipients) {
      const portalPath =
        recipient.profile.role === 'parent'
          ? `/portal/parent/resources?classId=${encodeURIComponent(submission.class_id)}#homework`
          : `/portal/student/homework?classId=${encodeURIComponent(submission.class_id)}`;
      const template = homeworkGradedTemplate({
        recipientName: recipient.profile.display_name || recipient.profile.email,
        recipientRole: recipient.profile.role === 'parent' ? 'parent' : 'student',
        studentName,
        className: klass.name,
        submissionTitle: submission.title,
        grade: submission.grade,
        feedback: submission.feedback,
        gradedBy,
        portalUrl: portalPathUrl(portalPath),
        preferenceUrl: profilePreferenceUrl(recipient.profile.role),
      });
      await sendOne({
        recipient,
        notificationType: 'homework_graded',
        referenceId: submission.id,
        preferenceKey: 'homework_graded_alerts',
        ...template,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    failed,
    items: {
      resources: resources.length,
      assignments: assignments.length,
      submissions: submissions.length,
    },
  });
}
