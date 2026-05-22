export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import EnrollmentRequiredBanner from '@/app/portal/_components/EnrollmentRequiredBanner';
import StudentHomeworkManager from '@/app/portal/_components/StudentHomeworkManager';
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

export default async function StudentHomeworkPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const session = await requireRole(['student']);
  const locale = (session.profile.locale === 'zh' ? 'zh' : 'en') as 'en' | 'zh';
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const enrollmentRows = ((await supabase
    .from('enrollments')
    .select('class_id,status')
    .eq('student_id', session.userId)
    .in('status', ['active', 'completed'])).data ?? []) as Array<{ class_id: string; status: string }>;
  const classIds = enrollmentRows.map((row) => row.class_id);

  if (classIds.length === 0) {
    return (
      <SectionCard
        title={t('portal.studentHomework.pageTitle', 'Homework')}
        description={t('portal.studentHomework.pageDescription', 'View assignments from your coach and submit your work.')}
      >
        <EnrollmentRequiredBanner role="student" locale={locale} />
      </SectionCard>
    );
  }

  const { data: classesData } = await supabase
    .from('classes')
    .select('id,name')
    .in('id', classIds)
    .order('name', { ascending: true });
  const allClasses = (classesData ?? []) as Array<{ id: string; name: string }>;
  const classMap = Object.fromEntries(allClasses.map((classRow) => [classRow.id, classRow.name]));
  const activeClassIdSet = new Set(
    enrollmentRows.filter((row) => row.status === 'active').map((row) => row.class_id)
  );
  const submissionClasses = allClasses.filter((classRow) => activeClassIdSet.has(classRow.id));
  const selectedClassId =
    params.classId && allClasses.some((classRow) => classRow.id === params.classId) ? params.classId : '';

  const [assignmentsResult, submissionsResult] = await Promise.all([
    (supabase as any)
      .from('homework_assignments')
      .select('*')
      .in('class_id', classIds)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false }),
    (supabase as any)
      .from('homework_submissions')
      .select('*')
      .eq('student_id', session.userId)
      .order('created_at', { ascending: false }),
  ]);

  if (submissionsResult.error?.code === '42P01') {
    return (
      <SectionCard
        title={t('portal.studentHomework.pageTitle', 'Homework')}
        description={t('portal.studentHomework.pageDescription', 'View assignments from your coach and submit your work.')}
      >
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          Homework feature is not available yet.
        </p>
      </SectionCard>
    );
  }
  if (submissionsResult.error) {
    return (
      <SectionCard
        title={t('portal.studentHomework.pageTitle', 'Homework')}
        description={t('portal.studentHomework.pageDescription', 'View assignments from your coach and submit your work.')}
      >
        <p className="text-sm text-red-700">{submissionsResult.error.message}</p>
      </SectionCard>
    );
  }

  const assignments = (assignmentsResult.data ?? []) as AssignmentRow[];
  const submissions = (submissionsResult.data ?? []) as SubmissionRow[];
  const graderIds = [...new Set(submissions.map((row) => row.graded_by).filter((id): id is string => Boolean(id)))];
  const graders = await getProfileMap(supabase, graderIds);

  const filteredAssignments = selectedClassId
    ? assignments.filter((a) => a.class_id === selectedClassId)
    : assignments;
  const filteredSubmissions = selectedClassId
    ? submissions.filter((s) => s.class_id === selectedClassId)
    : submissions;

  return (
    <SectionCard
      title={t('portal.studentHomework.pageTitle', 'Homework')}
      description={t('portal.studentHomework.pageDescription', 'View assignments from your coach and submit your work.')}
    >
      <form method="get" className="grid sm:grid-cols-3 gap-3 mb-4">
        <select
          name="classId"
          defaultValue={selectedClassId}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">{t('portal.student.attendance.allClasses', 'All classes')}</option>
          {allClasses.map((classRow) => (
            <option key={classRow.id} value={classRow.id}>
              {classRow.name}
            </option>
          ))}
        </select>
        <button className="justify-self-start px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
          {t('portal.student.attendance.load', 'Load')}
        </button>
      </form>

      <StudentHomeworkManager
        classes={submissionClasses}
        assignments={filteredAssignments.map((row) => ({
          ...row,
          className: classMap[row.class_id] || row.class_id,
        }))}
        initialSubmissions={filteredSubmissions.map((row) => ({
          ...row,
          className: classMap[row.class_id] || row.class_id,
          gradedByName: row.graded_by
            ? graders[row.graded_by]?.display_name || graders[row.graded_by]?.email || row.graded_by
            : null,
        }))}
      />
    </SectionCard>
  );
}
