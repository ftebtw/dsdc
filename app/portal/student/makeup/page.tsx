import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getActiveTerm } from '@/lib/portal/data';
import { classTypeLabel, formatClassSchedule } from '@/lib/portal/labels';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function StudentMakeupPage() {
  const session = await requireRole(['student']);
  const supabase = await getSupabaseServerClient();
  const activeTerm = await getActiveTerm(supabase);

  if (!activeTerm) {
    return (
      <SectionCard title="Make-up Classes" description="No active term is available.">
        <p className="text-sm text-charcoal/70 dark:text-navy-300">Please check again when a term is active.</p>
      </SectionCard>
    );
  }

  const enrollments = ((await supabase
    .from('enrollments')
    .select('class_id,status')
    .eq('student_id', session.userId)
    .eq('status', 'active')).data ?? []) as any[];
  const classIds = enrollments.map((row: any) => row.class_id);

  const classes = classIds.length
    ? (((await supabase
        .from('classes')
        .select('*')
        .in('id', classIds)
        .eq('term_id', activeTerm.id)).data ?? []) as any[])
    : ([] as any[]);

  const absences = classIds.length
    ? (((await supabase
        .from('student_absences')
        .select('*')
        .eq('student_id', session.userId)
        .in('class_id', classIds)
        .order('session_date', { ascending: false })).data ?? []) as any[])
    : ([] as any[]);

  const classesByType = new Map<string, any[]>();
  for (const classRow of classes) {
    const list = classesByType.get(classRow.type) ?? [];
    list.push(classRow);
    classesByType.set(classRow.type, list);
  }
  const classMap = Object.fromEntries(classes.map((classRow: any) => [classRow.id, classRow]));

  return (
    <SectionCard
      title="Make-up Classes"
      description="If your class type has alternate weekly sessions, use this page to find make-up options."
    >
      <div className="space-y-4">
        {absences.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">No absence records found for this term.</p>
        ) : null}
        {absences.map((absence: any) => {
          const missedClass = classMap[absence.class_id];
          if (!missedClass) return null;

          const alternatives = (classesByType.get(missedClass.type) ?? []).filter(
            (classRow: any) => classRow.id !== missedClass.id
          );

          return (
            <article
              key={absence.id}
              className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
            >
              <p className="font-medium text-navy-800 dark:text-white">
                Missed {missedClass.name} on {absence.session_date}
              </p>
              <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
                {classTypeLabel[missedClass.type as keyof typeof classTypeLabel] || missedClass.type}
              </p>
              {alternatives.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-navy-700 dark:text-navy-200">Available alternatives</p>
                  {alternatives.map((classRow: any) => (
                    <p key={classRow.id} className="text-sm text-charcoal/80 dark:text-navy-200">
                      {classRow.name} - {formatClassSchedule(classRow.schedule_day, classRow.schedule_start_time, classRow.schedule_end_time)} (
                      {classRow.timezone})
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-charcoal/80 dark:text-navy-200">
                  This class runs once per week. Recording will be posted in Resources.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </SectionCard>
  );
}
