export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getTodayClassesForCoach, getTodayPrivateGroupSessionsForCoach } from '@/lib/portal/data';
import {
  getSessionDateForClassTimezone,
  formatClassScheduleDaysForViewer,
  formatSessionRangeForViewer,
} from '@/lib/portal/time';
import { portalT } from '@/lib/portal/parent-i18n';

export default async function CoachDashboardPage() {
  const session = await requireRole(['coach', 'ta']);
  const locale = session.profile.locale === 'zh' ? 'zh' : 'en';
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);

  const supabase = await getSupabaseServerClient();
  const [todayClasses, todayPrivateSessions] = await Promise.all([
    getTodayClassesForCoach(supabase, session.userId),
    getTodayPrivateGroupSessionsForCoach(supabase, session.userId),
  ]);
  const todayDate = new Date().toISOString().slice(0, 10);
  const [{ data: todaySubs }, { data: todayTAs }] = await Promise.all([
    supabase
      .from('sub_requests')
      .select('class_id')
      .eq('accepting_coach_id', session.userId)
      .eq('status', 'accepted')
      .eq('session_date', todayDate),
    supabase
      .from('ta_requests')
      .select('class_id')
      .eq('accepting_ta_id', session.userId)
      .eq('status', 'accepted')
      .eq('session_date', todayDate),
  ]);

  const subbedTodayIds = [
    ...new Set([
      ...(todaySubs ?? []).map((row: any) => row.class_id),
      ...(todayTAs ?? []).map((row: any) => row.class_id),
    ]),
  ].filter((id) => !todayClasses.some((classRow) => classRow.id === id));

  const subbedTodayClasses = subbedTodayIds.length
    ? (((await supabase.from('classes').select('*').in('id', subbedTodayIds)).data ?? []) as typeof todayClasses)
    : ([] as typeof todayClasses);

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

  // De-dupe private group classrooms — multiple sessions today should still
  // share a single check-in row (keyed on class_id + session_date).
  const privateGroupClassIds = [...new Set(todayPrivateSessions.map((row) => row.classId))];
  const privateCheckins = await Promise.all(
    privateGroupClassIds.map(async (classId) => {
      const classTimezone =
        todayPrivateSessions.find((row) => row.classId === classId)?.classTimezone ||
        session.profile.timezone;
      const sessionDate = getSessionDateForClassTimezone(classTimezone);
      const { data } = await supabase
        .from('coach_checkins')
        .select('checked_in_at')
        .eq('coach_id', session.userId)
        .eq('class_id', classId)
        .eq('session_date', sessionDate)
        .maybeSingle();
      return { classId, checkedInAt: data?.checked_in_at ?? null };
    })
  );

  const checkinMap = Object.fromEntries(
    [...checkins, ...privateCheckins].map((row) => [row.classId, row.checkedInAt])
  );

  return (
    <div className="space-y-6">
      <SectionCard
        title={t('portal.coachDashboard.title', 'Coach Dashboard')}
        description={t('portal.coachDashboard.description', "Today's classes and fast actions for check-in and attendance.")}
      >
        {todayClasses.length === 0 && todayPrivateSessions.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {t('portal.coachDashboard.empty', 'No classes scheduled for today.')}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {todayClasses.map((classRow) => (
              <article
                key={classRow.id}
                className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
              >
                <h3 className="font-semibold text-navy-800 dark:text-white">{classRow.name}</h3>
                <p className="text-sm text-charcoal/65 dark:text-navy-300 mt-1">
                  {formatClassScheduleDaysForViewer(
                    classRow.schedule_days,
                    classRow.schedule_day,
                    classRow.schedule_start_time,
                    classRow.schedule_end_time,
                    classRow.timezone,
                    session.profile.timezone
                  )}
                </p>
                <p className="text-sm mt-2">
                  {checkinMap[classRow.id] ? (
                    <span className="text-green-700 dark:text-green-400">
                      {t('portal.coachDashboard.checkedIn', 'Checked in')}
                    </span>
                  ) : (
                    <span className="text-gold-700 dark:text-gold-300">
                      {t('portal.coachDashboard.notCheckedInYet', 'Not checked in yet')}
                    </span>
                  )}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/portal/coach/checkin"
                    className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-sm font-semibold"
                  >
                    {t('portal.coachDashboard.checkIn', 'Check-in')}
                  </Link>
                  <Link
                    href={`/portal/coach/attendance/${classRow.id}`}
                    className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                  >
                    {t('portal.coachDashboard.markAttendance', 'Mark Attendance')}
                  </Link>
                </div>
              </article>
            ))}
            {todayPrivateSessions.map((row) => (
              <article
                key={row.sessionId}
                className="rounded-xl border border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 p-4"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-navy-800 dark:text-white">{row.className}</h3>
                  <span className="text-xs uppercase tracking-wide text-violet-700 dark:text-violet-300">
                    {t('portal.coachDashboard.privateBadge', 'Private')}
                  </span>
                </div>
                <p className="text-sm text-charcoal/65 dark:text-navy-300 mt-1">
                  {(() => {
                    try {
                      return formatSessionRangeForViewer(
                        new Date().toISOString().slice(0, 10),
                        row.startTime,
                        row.endTime,
                        row.sessionTimezone,
                        session.profile.timezone
                      );
                    } catch {
                      return `${row.startTime.slice(0, 5)}-${row.endTime.slice(0, 5)} (${row.sessionTimezone})`;
                    }
                  })()}
                </p>
                <p className="text-sm mt-2">
                  {checkinMap[row.classId] ? (
                    <span className="text-green-700 dark:text-green-400">
                      {t('portal.coachDashboard.checkedIn', 'Checked in')}
                    </span>
                  ) : (
                    <span className="text-gold-700 dark:text-gold-300">
                      {t('portal.coachDashboard.notCheckedInYet', 'Not checked in yet')}
                    </span>
                  )}
                </p>
                {row.zoomLink ? (
                  <p className="text-sm mt-1">
                    <a
                      href={row.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-navy-700 dark:text-navy-200"
                    >
                      {t('portal.coachDashboard.openZoom', 'Open Zoom link')}
                    </a>
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/portal/coach/checkin"
                    className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-sm font-semibold"
                  >
                    {t('portal.coachDashboard.checkIn', 'Check-in')}
                  </Link>
                  <Link
                    href={`/portal/coach/attendance/${row.classId}`}
                    className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                  >
                    {t('portal.coachDashboard.markAttendance', 'Mark Attendance')}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      {subbedTodayClasses.length > 0 ? (
        <SectionCard
          title={t('portal.coachDashboard.subbingToday', "Today's Sub/TA Assignments")}
          description={t('portal.coachDashboard.subbingDesc', 'Classes you are covering today.')}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {subbedTodayClasses.map((classRow) => (
              <article
                key={classRow.id}
                className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4"
              >
                <h3 className="font-semibold text-navy-800 dark:text-white">{classRow.name}</h3>
                <p className="text-sm text-charcoal/65 dark:text-navy-300 mt-1">
                  {formatClassScheduleDaysForViewer(
                    classRow.schedule_days,
                    classRow.schedule_day,
                    classRow.schedule_start_time,
                    classRow.schedule_end_time,
                    classRow.timezone,
                    session.profile.timezone
                  )}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/portal/coach/attendance/${classRow.id}`}
                    className="px-3 py-1.5 rounded-md bg-amber-200 text-navy-900 text-sm font-semibold"
                  >
                    {t('portal.coachDashboard.markAttendance', 'Attendance')}
                  </Link>
                  <Link
                    href={`/portal/coach/resources/${classRow.id}`}
                    className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                  >
                    Resources
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
