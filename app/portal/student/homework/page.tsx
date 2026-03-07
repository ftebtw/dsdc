export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import EnrollmentRequiredBanner from '@/app/portal/_components/EnrollmentRequiredBanner';
import StudentHomeworkManager from '@/app/portal/_components/StudentHomeworkManager';
import { requireRole } from '@/lib/portal/auth';
import { hasActiveEnrollment } from '@/lib/portal/enrollment-status';
import { getProfileMap } from '@/lib/portal/data';
import { portalT } from '@/lib/portal/parent-i18n';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type HomeworkRow = {
  id: string;
  class_id: string;
  student_id: string;
  title: string;
  notes: string | null;
  file_path: string | null;
  file_name: string | null;
  external_url: string | null;
  grade: string | null;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
  created_at: string;
};

export default async function StudentHomeworkPage() {
  const session = await requireRole(['student']);
  const locale = (session.profile.locale === 'zh' ? 'zh' : 'en') as 'en' | 'zh';
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const supabase = await getSupabaseServerClient();

  const enrolled = await hasActiveEnrollment(supabase as any, session.userId);
  if (!enrolled) {
    return (
      <SectionCard
        title={t('portal.studentHomework.pageTitle', 'Homework')}
        description={t('portal.studentHomework.pageDescription', 'Submit homework and receive coach feedback.')}
      >
        <EnrollmentRequiredBanner role="student" locale={locale} />
      </SectionCard>
    );
  }

  const { data: enrollmentsData } = await supabase
    .from('enrollments')
    .select('class_id')
    .eq('student_id', session.userId)
    .eq('status', 'active');
  const classIds = ((enrollmentsData ?? []) as Array<{ class_id: string }>).map((row) => row.class_id);
  const { data: classesData } = classIds.length
    ? await supabase.from('classes').select('id,name').in('id', classIds).order('name', { ascending: true })
    : { data: [] as Array<{ id: string; name: string }> };
  const classes = (classesData ?? []) as Array<{ id: string; name: string }>;
  const classMap = Object.fromEntries(classes.map((classRow) => [classRow.id, classRow.name]));

  const submissionsResult = await (supabase as any)
    .from('homework_submissions')
    .select('*')
    .eq('student_id', session.userId)
    .order('created_at', { ascending: false });

  if (submissionsResult.error?.code === '42P01') {
    return (
      <SectionCard
        title={t('portal.studentHomework.pageTitle', 'Homework')}
        description={t('portal.studentHomework.pageDescription', 'Submit homework and receive coach feedback.')}
      >
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          Homework feature is not available yet. Please run migration `0038_homework_submissions.sql`.
        </p>
      </SectionCard>
    );
  }
  if (submissionsResult.error) {
    return (
      <SectionCard
        title={t('portal.studentHomework.pageTitle', 'Homework')}
        description={t('portal.studentHomework.pageDescription', 'Submit homework and receive coach feedback.')}
      >
        <p className="text-sm text-red-700">
          {submissionsResult.error.message}
        </p>
      </SectionCard>
    );
  }

  const rows = (submissionsResult.data ?? []) as HomeworkRow[];
  const graderIds = [...new Set(rows.map((row) => row.graded_by).filter((id): id is string => Boolean(id)))];
  const graders = await getProfileMap(supabase, graderIds);

  const mapped = rows.map((row) => ({
    ...row,
    className: classMap[row.class_id] || row.class_id,
    gradedByName: row.graded_by
      ? graders[row.graded_by]?.display_name || graders[row.graded_by]?.email || row.graded_by
      : null,
  }));

  return (
    <SectionCard
      title={t('portal.studentHomework.pageTitle', 'Homework')}
      description={t('portal.studentHomework.pageDescription', 'Submit homework and receive coach feedback.')}
    >
      <StudentHomeworkManager classes={classes} initialSubmissions={mapped} />
    </SectionCard>
  );
}
