export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import CoachHomeworkManager from '@/app/portal/_components/CoachHomeworkManager';
import { requireRole } from '@/lib/portal/auth';
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
  const coCoachIds = [...new Set(((coCoachRowsData ?? []) as Array<{ class_id: string }>).map((row) => row.class_id))];
  const { data: coCoachClassesData } = coCoachIds.length
    ? await supabase.from('classes').select('id,name').in('id', coCoachIds).order('name', { ascending: true })
    : { data: [] as Array<{ id: string; name: string }> };
  const coCoachClasses = (coCoachClassesData ?? []) as Array<{ id: string; name: string }>;

  const classOptions = [
    ...new Map(
      [...primaryClasses, ...coCoachClasses].map((classRow) => [classRow.id, classRow] as const)
    ).values(),
  ];
  if (classOptions.length === 0) {
    return (
      <SectionCard
        title={t('portal.coachHomework.pageTitle', 'Homework Review')}
        description={t('portal.coachHomework.pageDescription', 'Review student homework and send grades + feedback.')}
      >
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {t('portal.coachHomework.noClasses', 'No classes found.')}
        </p>
      </SectionCard>
    );
  }

  const classMap = Object.fromEntries(classOptions.map((classRow) => [classRow.id, classRow.name]));
  const classIds = classOptions.map((classRow) => classRow.id);

  const submissionsResult = await (supabase as any)
    .from('homework_submissions')
    .select('*')
    .in('class_id', classIds)
    .order('created_at', { ascending: false });

  if (submissionsResult.error?.code === '42P01') {
    return (
      <SectionCard
        title={t('portal.coachHomework.pageTitle', 'Homework Review')}
        description={t('portal.coachHomework.pageDescription', 'Review student homework and send grades + feedback.')}
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
        title={t('portal.coachHomework.pageTitle', 'Homework Review')}
        description={t('portal.coachHomework.pageDescription', 'Review student homework and send grades + feedback.')}
      >
        <p className="text-sm text-red-700">{submissionsResult.error.message}</p>
      </SectionCard>
    );
  }

  const rows = (submissionsResult.data ?? []) as HomeworkRow[];
  const profileIds = [
    ...new Set(
      rows.flatMap((row) => [row.student_id, row.graded_by]).filter((id): id is string => Boolean(id))
    ),
  ];
  const profileMap = await getProfileMap(supabase, profileIds);

  const mapped = rows.map((row) => ({
    ...row,
    className: classMap[row.class_id] || row.class_id,
    studentName: profileMap[row.student_id]?.display_name || profileMap[row.student_id]?.email || row.student_id,
    studentEmail: profileMap[row.student_id]?.email || row.student_id,
    gradedByName: row.graded_by
      ? profileMap[row.graded_by]?.display_name || profileMap[row.graded_by]?.email || row.graded_by
      : null,
  }));

  return (
    <SectionCard
      title={t('portal.coachHomework.pageTitle', 'Homework Review')}
      description={t('portal.coachHomework.pageDescription', 'Review student homework and send grades + feedback.')}
    >
      <CoachHomeworkManager classes={classOptions} initialSubmissions={mapped} />
    </SectionCard>
  );
}
