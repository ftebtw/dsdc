export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getTodayClassesForCoach } from '@/lib/portal/data';
import { getSessionDateForClassTimezone, formatClassScheduleForViewer } from '@/lib/portal/time';

export default async function CoachDashboardPage() {
  const session = await requireRole(['coach', 'ta']);
  const supabase = await getSupabaseServerClient();
  const todayClasses = await getTodayClassesForCoach(supabase, session.userId);

  const checkins = await Promise.all(
    todayClasses.map(async (classRow) => {
      const sessionDate = getSessionDateForClassTimezone(classRow.timezone);
      const { data } = await supabase
        .from('coach_checkins')
        .select('checked_in_at')
        .eq('coach_id', session.userId)
        .eq('class_id', classRow.id)
        .eq('session_date', sessionDate)
        .maybeSingle();
      return { classId: classRow.id, checkedInAt: data?.checked_in_at ?? null };
    })
  );

  const checkinMap = Object.fromEntries(checkins.map((row) => [row.classId, row.checkedInAt]));

  return (
    <div className="space-y-6">
      <SectionCard
        title="Coach Dashboard"
        description="Today’s classes and fast actions for check-in and attendance."
      >
        {todayClasses.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">No classes scheduled for today.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {todayClasses.map((classRow) => (
              <article
                key={classRow.id}
                className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
              >
                <h3 className="font-semibold text-navy-800 dark:text-white">{classRow.name}</h3>
                <p className="text-sm text-charcoal/65 dark:text-navy-300 mt-1">
                  {formatClassScheduleForViewer(
                    classRow.schedule_day,
                    classRow.schedule_start_time,
                    classRow.schedule_end_time,
                    classRow.timezone,
                    session.profile.timezone
                  )}
                </p>
                <p className="text-sm mt-2">
                  {checkinMap[classRow.id] ? (
                    <span className="text-green-700 dark:text-green-400">Checked in</span>
                  ) : (
                    <span className="text-gold-700 dark:text-gold-300">Not checked in yet</span>
                  )}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/portal/coach/checkin"
                    className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-sm font-semibold"
                  >
                    Check-in
                  </Link>
                  <Link
                    href={`/portal/coach/attendance/${classRow.id}`}
                    className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                  >
                    Mark Attendance
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
