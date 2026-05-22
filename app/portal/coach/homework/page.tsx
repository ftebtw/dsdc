export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import CoachHomeworkManager from '@/app/portal/_components/CoachHomeworkManager';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { portalT } from '@/lib/portal/parent-i18n';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type AssignmentRow = {
  id: string;
  class_id: string;
  posted_by: string;
  title: string;
  description: string | null;
  external_urls: string[];
  file_path: string | null;
  file_name: string | null;
  due_date: string | null;
  publish_at: string;
  created_at: string;
};

type SubmissionRow = {
  id: string;
  class_id: string;
  assignment_id: string | null;
  student_id: string;
  title: string;
  notes: string | null;
  file_path: string | null;
  file_name: string | null;
  external_url: string | null;
  external_urls: string[] | null;
  due_date: string | null;
  grade: string | null;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
  created_at: string;
};

type EnrollmentRow = {
  class_id: string;
  student_id: string;
  status: string;
};

export default async function CoachHomeworkPage() {
  const session = await requireRole(['coach', 'ta']);
  const locale = session.profile.locale === 'zh' ? 'zh' : 'en';
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const supabase = await getSupabaseServerClient();

  const { data: primaryClassesData } = await supabase
    .from('classes')
    .select('id,name')
    .eq('coach_id', session.userId)
    .order('name', { ascending: true });
  const primaryClasses = (primaryClassesData ?? []) as Array<{ id: string; name: string }>;

  const { data: coCoachRowsData } = await supabase
    .from('class_coaches')
    .select('class_id')
    .eq('coach_id', session.userId);
  const coCoachIds = [
    ...new Set(((coCoachRowsData ?? []) as Array<{ class_id: string }>).map((row) => row.class_id)),
  ];
  const { data: coCoachClassesData } = coCoachIds.length
    ? await supabase.from('classes').select('id,name').in('id', coCoachIds).order('name', { ascending: true })
    : { data: [] as Array<{ id: string; name: string }> };
  const coCoachClasses = (coCoachClassesData ?? []) as Array<{ id: string; name: string }>;

  const [{ data: subRowsData }, { data: taRowsData }] = await Promise.all([
    (supabase as any)
      .from('sub_requests')
      .select('class_id')
      .eq('accepting_coach_id', session.userId)
      .eq('status', 'accepted'),
    (supabase as any)
      .from('ta_requests')
      .select('class_id')
      .eq('accepting_ta_id', session.userId)
      .eq('status', 'accepted'),
  ]);
  const subClassIds = [
    ...new Set([
      ...((subRowsData ?? []) as Array<{ class_id: string }>).map((row) => row.class_id),
      ...((taRowsData ?? []) as Array<{ class_id: string }>).map((row) => row.class_id),
    ]),
  ];
  const { data: subClassesData } = subClassIds.length
    ? await supabase.from('classes').select('id,name').in('id', subClassIds).order('name', { ascending: true })
    : { data: [] as Array<{ id: string; name: string }> };
  const subClasses = (subClassesData ?? []) as Array<{ id: string; name: string }>;

  const classOptions = [
    ...new Map(
      [...primaryClasses, ...coCoachClasses, ...subClasses].map((classRow) => [classRow.id, classRow] as const)
    ).values(),
  ];

  if (classOptions.length === 0) {
    return (
      <SectionCard
        title={t('portal.coachHomework.pageTitle', 'Homework')}
        description={t(
          'portal.coachHomework.pageDescription',
          'Post assignments, track submissions, and send grades.'
        )}
      >
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {t('portal.coachHomework.noClasses', 'No classes found.')}
        </p>
      </SectionCard>
    );
  }

  const classMap = Object.fromEntries(classOptions.map((classRow) => [classRow.id, classRow.name]));
  const classIds = classOptions.map((classRow) => classRow.id);

  const [assignmentsResult, enrollmentsResult, submissionsResult] = await Promise.all([
    (supabase as any)
      .from('homework_assignments')
      .select('*')
      .in('class_id', classIds)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('enrollments')
      .select('class_id, student_id, status')
      .in('class_id', classIds)
      .in('status', ['active', 'completed']),
    (supabase as any)
      .from('homework_submissions')
      .select('*')
      .in('class_id', classIds)
      .order('created_at', { ascending: false }),
  ]);

  if (submissionsResult.error?.code === '42P01') {
    return (
      <SectionCard
        title={t('portal.coachHomework.pageTitle', 'Homework')}
        description={t(
          'portal.coachHomework.pageDescription',
          'Post assignments, track submissions, and send grades.'
        )}
      >
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          Homework feature is not available yet. Please run migration `0055_homework_assignments.sql`.
        </p>
      </SectionCard>
    );
  }
  if (submissionsResult.error) {
    return (
      <SectionCard
        title={t('portal.coachHomework.pageTitle', 'Homework')}
        description={t(
          'portal.coachHomework.pageDescription',
          'Post assignments, track submissions, and send grades.'
        )}
      >
        <p className="text-sm text-red-700">{submissionsResult.error.message}</p>
      </SectionCard>
    );
  }

  const assignments = (assignmentsResult.data ?? []) as AssignmentRow[];
  const enrollments = ((enrollmentsResult.data ?? []) as EnrollmentRow[]).filter((row) =>
    classIds.includes(row.class_id)
  );
  const submissions = (submissionsResult.data ?? []) as SubmissionRow[];

  const studentIds = [
    ...new Set([
      ...enrollments.map((row) => row.student_id),
      ...submissions.map((row) => row.student_id),
      ...submissions.map((row) => row.graded_by).filter((id): id is string => Boolean(id)),
    ]),
  ];
  const profileMap = await getProfileMap(supabase, studentIds);

  const enrolledByClass = new Map<string, string[]>();
  for (const row of enrollments) {
    const list = enrolledByClass.get(row.class_id) ?? [];
    if (!list.includes(row.student_id)) list.push(row.student_id);
    enrolledByClass.set(row.class_id, list);
  }

  return (
    <SectionCard
      title={t('portal.coachHomework.pageTitle', 'Homework')}
      description={t(
        'portal.coachHomework.pageDescription',
        'Post assignments, track submissions, and send grades.'
      )}
    >
      <CoachHomeworkManager
        classes={classOptions}
        initialAssignments={assignments.map((row) => ({
          ...row,
          className: classMap[row.class_id] || row.class_id,
        }))}
        initialSubmissions={submissions.map((row) => ({
          ...row,
          className: classMap[row.class_id] || row.class_id,
          studentName:
            profileMap[row.student_id]?.display_name || profileMap[row.student_id]?.email || row.student_id,
          studentEmail: profileMap[row.student_id]?.email || row.student_id,
          gradedByName: row.graded_by
            ? profileMap[row.graded_by]?.display_name || profileMap[row.graded_by]?.email || row.graded_by
            : null,
        }))}
        enrolledByClass={Object.fromEntries(
          Array.from(enrolledByClass.entries()).map(([classId, ids]) => [
            classId,
            ids.map((studentId) => ({
              studentId,
              studentName:
                profileMap[studentId]?.display_name || profileMap[studentId]?.email || studentId,
              studentEmail: profileMap[studentId]?.email || studentId,
            })),
          ])
        )}
      />
    </SectionCard>
  );
}
