import { redirect } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getActiveTerm, getProfileMap } from '@/lib/portal/data';
import { classTypeLabel, formatClassSchedule } from '@/lib/portal/labels';
import { getParentSelection } from '@/lib/portal/parent';
import { parentT } from '@/lib/portal/parent-i18n';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function ParentClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const session = await requireRole(['parent']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const locale = session.profile.locale === 'zh' ? 'zh' : 'en';

  const { linkedStudents, selectedStudentId, selectedStudent } = await getParentSelection(
    supabase,
    session.userId,
    params.student
  );

  if (!linkedStudents.length) {
    return (
      <SectionCard title={parentT(locale, 'portal.parent.classes.title', "My Student's Classes")}>
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {parentT(locale, 'portal.parent.common.noLinkedStudents', 'No students linked to your account yet.')}
        </p>
      </SectionCard>
    );
  }

  if (!selectedStudentId || params.student !== selectedStudentId) {
    redirect(`/portal/parent/classes?student=${selectedStudentId}`);
  }

  const activeTerm = await getActiveTerm(supabase);
  if (!activeTerm) {
    return (
      <SectionCard title={parentT(locale, 'portal.parent.classes.title', "My Student's Classes")}>
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {parentT(locale, 'portal.parent.common.noActiveTerm', 'No active term is configured.')}
        </p>
      </SectionCard>
    );
  }

  const enrollments = ((await supabase
    .from('enrollments')
    .select('class_id,status')
    .eq('student_id', selectedStudentId)
    .eq('status', 'active')).data ?? []) as any[];
  const classIds = enrollments.map((row: any) => row.class_id);
  const classes = classIds.length
    ? (((await supabase
        .from('classes')
        .select('*')
        .in('id', classIds)
        .eq('term_id', activeTerm.id)
        .order('schedule_day')).data ?? []) as any[])
    : ([] as any[]);

  const coachMap = await getProfileMap(
    supabase,
    [...new Set(classes.map((classRow: any) => classRow.coach_id))]
  );

  return (
    <SectionCard
      title={parentT(locale, 'portal.parent.classes.title', "My Student's Classes")}
      description={`${parentT(locale, 'portal.parent.selectedStudent', 'Selected student')}: ${
        selectedStudent?.display_name || selectedStudent?.email || selectedStudentId
      }`}
    >
      {classes.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {parentT(locale, 'portal.parent.common.noActiveEnrollments', 'No active enrollments.')}
        </p>
      ) : (
        <div className="space-y-4">
          {classes.map((classRow: any) => (
            <article
              key={classRow.id}
              className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
            >
              <h3 className="font-semibold text-navy-800 dark:text-white">{classRow.name}</h3>
              <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
                {classTypeLabel[classRow.type as keyof typeof classTypeLabel] || classRow.type} -{' '}
                {formatClassSchedule(classRow.schedule_day, classRow.schedule_start_time, classRow.schedule_end_time)} (
                {classRow.timezone})
              </p>
              <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
                {parentT(locale, 'portal.parent.common.coachLabel', 'Coach')}:{' '}
                {coachMap[classRow.coach_id]?.display_name || coachMap[classRow.coach_id]?.email || classRow.coach_id}
              </p>
              {classRow.zoom_link ? (
                <p className="text-sm mt-1">
                  {parentT(locale, 'portal.parent.common.zoomLabel', 'Zoom')}:{' '}
                  <a href={classRow.zoom_link} target="_blank" rel="noopener noreferrer" className="underline text-navy-700 dark:text-navy-200">
                    {parentT(locale, 'portal.parent.common.openLink', 'Open Link')}
                  </a>
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
