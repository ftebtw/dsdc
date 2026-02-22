import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getClassesForCoachInActiveTerm, getProfileMap } from '@/lib/portal/data';
import { classTypeLabel, formatClassSchedule } from '@/lib/portal/labels';

export default async function CoachClassesPage() {
  const session = await requireRole(['coach', 'ta']);
  const supabase = await getSupabaseServerClient();
  const classes = await getClassesForCoachInActiveTerm(supabase, session.userId);

  const classIds = classes.map((classRow) => classRow.id);
  const { data: enrollmentsData } = classIds.length
    ? await supabase
        .from('enrollments')
        .select('class_id,student_id,status')
        .in('class_id', classIds)
        .eq('status', 'active')
    : { data: [] as Array<{ class_id: string; student_id: string; status: string }> };
  const enrollments = (enrollmentsData ?? []) as any[];

  const studentIds = [...new Set(enrollments.map((row: any) => row.student_id))];
  const profileMap = await getProfileMap(supabase, studentIds);

  const enrollmentsByClass = new Map<string, string[]>();
  for (const enrollment of enrollments) {
    const existing = enrollmentsByClass.get(enrollment.class_id) ?? [];
    existing.push(enrollment.student_id);
    enrollmentsByClass.set(enrollment.class_id, existing);
  }

  return (
    <SectionCard title="My Classes" description="Active-term classes assigned to you.">
      {classes.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">No active-term classes assigned.</p>
      ) : (
        <div className="space-y-4">
          {classes.map((classRow) => {
            const studentIdsForClass = enrollmentsByClass.get(classRow.id) ?? [];
            return (
              <article
                key={classRow.id}
                className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-navy-800 dark:text-white">{classRow.name}</h3>
                    <p className="text-sm text-charcoal/65 dark:text-navy-300 mt-1">
                      {classTypeLabel[classRow.type as keyof typeof classTypeLabel] || String(classRow.type)} •{' '}
                      {formatClassSchedule(
                        classRow.schedule_day,
                        classRow.schedule_start_time,
                        classRow.schedule_end_time
                      )}{' '}
                      ({classRow.timezone})
                    </p>
                    {classRow.zoom_link ? (
                      <p className="text-sm mt-1">
                        Zoom:{' '}
                        <a
                          className="underline text-navy-700 dark:text-navy-200"
                          href={classRow.zoom_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Link
                        </a>
                      </p>
                    ) : null}
                    <p className="text-sm mt-2">
                      {studentIdsForClass.length} enrolled student
                      {studentIdsForClass.length === 1 ? '' : 's'}
                    </p>
                    {studentIdsForClass.length > 0 ? (
                      <p className="text-xs text-charcoal/70 dark:text-navy-300 mt-2">
                        {studentIdsForClass
                          .map((studentId) => profileMap[studentId]?.display_name || profileMap[studentId]?.email || studentId)
                          .join(', ')}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/portal/coach/attendance/${classRow.id}`}
                      className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                    >
                      Attendance
                    </Link>
                    <Link
                      href={`/portal/coach/resources/${classRow.id}`}
                      className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-sm font-semibold"
                    >
                      Resources
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
