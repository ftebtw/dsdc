export const dynamic = 'force-dynamic';

import Link from 'next/link';
import EnrollmentRequiredBanner from '@/app/portal/_components/EnrollmentRequiredBanner';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getActiveTerm, getProfileMap } from '@/lib/portal/data';
import { classTypeLabel, getClassTypeLabel } from '@/lib/portal/labels';
import { portalT } from '@/lib/portal/parent-i18n';
import { formatClassScheduleForViewer, formatSessionRangeForViewer } from '@/lib/portal/time';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const scheduleDayOrder: Record<string, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7,
};

function compareBySchedule(left: Record<string, any>, right: Record<string, any>) {
  const dayDiff = (scheduleDayOrder[left.schedule_day] ?? 99) - (scheduleDayOrder[right.schedule_day] ?? 99);
  if (dayDiff !== 0) return dayDiff;
  return String(left.schedule_start_time ?? '').localeCompare(String(right.schedule_start_time ?? ''));
}

export default async function StudentClassesPage() {
  const session = await requireRole(['student']);
  const locale = (session.profile.locale === 'zh' ? 'zh' : 'en') as 'en' | 'zh';
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const supabase = await getSupabaseServerClient();
  const activeTerm = await getActiveTerm(supabase);

  const quickLinks = (
    <SectionCard
      title={t('portal.student.classes.quickLinks', 'Quick Links')}
      description={t('portal.student.classes.quickLinksDesc', 'Use these pages to manage your term.')}
    >
      <div className="flex flex-wrap gap-2">
        <Link href="/portal/student/enroll" className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
          {t('portal.student.classes.enrollClasses', 'Enroll in Classes')}
        </Link>
        <Link href="/portal/student/attendance" className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
          {t('portal.nav.student.attendance', 'Attendance')}
        </Link>
        <Link href="/portal/student/resources" className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
          {t('portal.nav.student.resources', 'Resources')}
        </Link>
        <Link href="/portal/student/absent" className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
          {t('portal.student.classes.reportAbsence', 'Report Absence')}
        </Link>
        <Link href="/portal/student/credits" className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
          {t('portal.student.classes.classCredits', 'Class Credits')}
        </Link>
      </div>
    </SectionCard>
  );

  const { data: enrollmentRowsData } = await supabase
    .from('enrollments')
    .select('class_id,status')
    .eq('student_id', session.userId)
    .in('status', ['active', 'completed']);
  const enrollmentRows = (enrollmentRowsData ?? []) as Array<Record<string, any>>;
  const classIds = enrollmentRows.map((row: any) => row.class_id);

  if (classIds.length === 0) {
    return (
      <div className="space-y-6">
        <SectionCard
          title={t('portal.student.classes.title', 'My Classes')}
          description={
            activeTerm
              ? `${activeTerm.name} ${t('portal.student.classes.description', 'term schedule and Zoom access.')}`
              : t('portal.student.classes.noTerm', 'No active term is configured right now.')
          }
        >
          <EnrollmentRequiredBanner role="student" locale={session.profile.locale === "zh" ? "zh" : "en"} />
        </SectionCard>
        {quickLinks}
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const [{ data: classesData }, { data: subRequestsData }, { data: taRequestsData }] =
    await Promise.all([
      supabase
        .from('classes')
        .select('*')
        .in('id', classIds)
        .order('schedule_day'),
      supabase
        .from('sub_requests')
        .select('class_id,accepting_coach_id,session_date,status')
        .in('class_id', classIds)
        .eq('status', 'accepted')
        .gte('session_date', today)
        .order('session_date', { ascending: true }),
      supabase
        .from('ta_requests')
        .select('class_id,accepting_ta_id,session_date,status')
        .in('class_id', classIds)
        .eq('status', 'accepted')
        .gte('session_date', today)
        .order('session_date', { ascending: true }),
    ]);

  const classes = (classesData ?? []) as Array<Record<string, any>>;
  const termIds = [...new Set(classes.map((row: any) => row.term_id).filter(Boolean))];
  const terms = termIds.length
    ? (((await supabase.from('terms').select('id,name,start_date,end_date,is_active').in('id', termIds)).data ?? []) as Array<Record<string, any>>)
    : ([] as Array<Record<string, any>>);
  const termMap = Object.fromEntries(terms.map((term) => [term.id, term]));
  const subRequests = (subRequestsData ?? []) as Array<Record<string, any>>;
  const taRequests = (taRequestsData ?? []) as Array<Record<string, any>>;
  const coachIds = [...new Set(classes.map((classRow: any) => classRow.coach_id))];
  const subCoachIds = [...new Set(subRequests.map((row: any) => row.accepting_coach_id).filter(Boolean))];
  const taIds = [...new Set(taRequests.map((row: any) => row.accepting_ta_id).filter(Boolean))];
  const peopleIds = [...new Set([...coachIds, ...subCoachIds, ...taIds].filter(Boolean))];
  const profileMap = await getProfileMap(supabase, peopleIds);
  const missingPeopleIds = peopleIds.filter((id) => !profileMap[id]);
  if (missingPeopleIds.length) {
    const admin = getSupabaseAdminClient();
    const [{ data: coachRows }, { data: profileRows }] = await Promise.all([
      admin.from('coach_profiles').select('coach_id').in('coach_id', missingPeopleIds),
      admin.from('profiles').select('id,display_name,email').in('id', missingPeopleIds),
    ]);
    const coachIdSet = new Set((coachRows ?? []).map((row: { coach_id: string }) => row.coach_id));
    for (const profile of (profileRows ?? []) as Array<{ id: string; display_name: string | null; email: string }>) {
      if (coachIdSet.has(profile.id)) {
        profileMap[profile.id] = profile as any;
      }
    }
  }
  const nextSubByClass = new Map<string, any>();
  for (const subRequest of subRequests) {
    if (!nextSubByClass.has(subRequest.class_id)) {
      nextSubByClass.set(subRequest.class_id, subRequest);
    }
  }
  const nextTaByClass = new Map<string, any>();
  for (const taRequest of taRequests) {
    if (!nextTaByClass.has(taRequest.class_id)) {
      nextTaByClass.set(taRequest.class_id, taRequest);
    }
  }

  const enrollmentStatusByClass = new Map<string, string>();
  for (const enrollment of enrollmentRows) {
    enrollmentStatusByClass.set(enrollment.class_id, enrollment.status);
  }

  const classRows = classes.map((classRow: any) => ({
    ...classRow,
    enrollment_status: enrollmentStatusByClass.get(classRow.id) ?? 'active',
    term: termMap[classRow.term_id] ?? null,
  }));

  const privateGroupClasses = classRows
    .filter((classRow: any) => classRow.is_private_session_group && classRow.enrollment_status === 'active')
    .sort((left: any, right: any) => String(left.name ?? '').localeCompare(String(right.name ?? '')));

  // Fetch upcoming sessions for the student's private groups so we can show the next meeting.
  const privateGroupIds = privateGroupClasses.map((row: any) => row.id);
  const upcomingSessionsByGroup = new Map<string, Array<Record<string, any>>>();
  if (privateGroupIds.length > 0) {
    const { data: groupSessionsData } = await supabase
      .from('private_sessions')
      .select('id,class_id,requested_date,requested_start_time,requested_end_time,timezone,zoom_link,status')
      .in('class_id', privateGroupIds)
      .gte('requested_date', today)
      .order('requested_date', { ascending: true })
      .order('requested_start_time', { ascending: true });
    for (const row of (groupSessionsData ?? []) as Array<Record<string, any>>) {
      const bucket = upcomingSessionsByGroup.get(row.class_id) ?? [];
      bucket.push(row);
      upcomingSessionsByGroup.set(row.class_id, bucket);
    }
  }

  const currentClasses = classRows
    .filter(
      (classRow: any) =>
        !classRow.is_private_session_group &&
        classRow.term?.is_active &&
        classRow.enrollment_status === 'active'
    )
    .sort(compareBySchedule);

  const pastClasses = classRows
    .filter((classRow: any) => !classRow.is_private_session_group && classRow.term && !classRow.term.is_active)
    .sort((left: any, right: any) => {
      const termDiff =
        new Date(right.term.start_date || right.term.end_date || 0).getTime() -
        new Date(left.term.start_date || left.term.end_date || 0).getTime();
      if (termDiff !== 0) return termDiff;
      return compareBySchedule(left, right);
    });

  const renderPrivateGroupCard = (classRow: any) => {
    const coach = profileMap[classRow.coach_id];
    const upcoming = upcomingSessionsByGroup.get(classRow.id) ?? [];
    const next = upcoming[0];
    return (
      <article
        key={classRow.id}
        className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
      >
        <h3 className="font-semibold text-navy-800 dark:text-white">{classRow.name}</h3>
        {classRow.description ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">{classRow.description}</p>
        ) : null}
        <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
          {t('portal.student.classes.coach', 'Coach')}:{' '}
          {coach?.display_name || coach?.email || t('portal.student.classes.coachFallback', 'DSDC Coach')}
        </p>
        {next ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-2">
            <span className="font-medium">{t('portal.student.classes.nextSession', 'Next session')}:</span>{' '}
            {(() => {
              try {
                return formatSessionRangeForViewer(
                  next.requested_date,
                  next.requested_start_time,
                  next.requested_end_time,
                  next.timezone,
                  session.profile.timezone
                );
              } catch {
                return `${next.requested_date} ${String(next.requested_start_time).slice(0, 5)}-${String(next.requested_end_time).slice(0, 5)}`;
              }
            })()}
            {upcoming.length > 1 ? ` (+${upcoming.length - 1} more)` : ''}
          </p>
        ) : (
          <p className="text-sm text-charcoal/65 dark:text-navy-300 mt-2 italic">
            {t('portal.student.classes.noUpcomingSessions', 'No upcoming sessions scheduled.')}
          </p>
        )}
        {next?.zoom_link ? (
          <p className="text-sm mt-1">
            {t('portal.student.classes.zoom', 'Zoom Link')}:{' '}
            <a
              href={next.zoom_link}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-navy-700 dark:text-navy-200"
            >
              {t('portal.student.classes.openLink', 'Open Link')}
            </a>
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/portal/student/attendance?classId=${encodeURIComponent(classRow.id)}`}
            className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
          >
            {t('portal.student.classes.viewAttendance', 'View Attendance')}
          </Link>
          <Link
            href={`/portal/student/resources?classId=${encodeURIComponent(classRow.id)}`}
            className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
          >
            {t('portal.student.classes.viewResources', 'View Resources')}
          </Link>
          <Link
            href={`/portal/student/homework?classId=${encodeURIComponent(classRow.id)}`}
            className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
          >
            {t('portal.student.classes.viewHomework', 'View Homework')}
          </Link>
        </div>
      </article>
    );
  };

  const renderClassCard = (classRow: any, isPast: boolean) => {
    const coach = profileMap[classRow.coach_id];
    const nextSub = nextSubByClass.get(classRow.id);
    const nextTa = nextTaByClass.get(classRow.id);

    return (
      <article
        key={classRow.id}
        className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
      >
        <h3 className="font-semibold text-navy-800 dark:text-white">{classRow.name}</h3>
        <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
          {getClassTypeLabel(classRow.type, locale)} -{' '}
          {formatClassScheduleForViewer(
            classRow.schedule_day,
            classRow.schedule_start_time,
            classRow.schedule_end_time,
            classRow.timezone,
            session.profile.timezone
          )}
        </p>
        <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
          {t('portal.student.classes.termLabel', 'Term')}:{' '}
          {classRow.term?.name || t('portal.student.classes.noTermLabel', 'Unassigned term')}
        </p>
        <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
          {t('portal.student.classes.coach', 'Coach')}:{' '}
          {coach?.display_name || coach?.email || t('portal.student.classes.coachFallback', 'DSDC Coach')}
        </p>
        <p className="text-sm mt-1">
          {classRow.zoom_link ? (
            <>
              {t('portal.student.classes.zoom', 'Zoom Link')}:{' '}
              <a
                href={classRow.zoom_link}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-navy-700 dark:text-navy-200"
              >
                {t('portal.student.classes.openLink', 'Open Link')}
              </a>
            </>
          ) : (
            <span className="text-charcoal/50 dark:text-navy-400 italic">
              {t('portal.student.classes.zoomUnavailable', 'Zoom link not yet available')}
            </span>
          )}
        </p>
        {!isPast && nextSub ? (
          <p className="mt-2 text-sm rounded-md bg-gold-100 text-navy-900 px-2 py-1 inline-block">
            {t('portal.student.classes.substituteCoachOn', 'Substitute coach on')} {nextSub.session_date}:{' '}
            {profileMap[nextSub.accepting_coach_id]?.display_name ||
              profileMap[nextSub.accepting_coach_id]?.email ||
              t('portal.student.classes.subFallback', 'Coach')}
          </p>
        ) : null}
        {!isPast && nextTa ? (
          <p className="mt-2 text-sm rounded-md bg-blue-100 text-navy-900 px-2 py-1 inline-block">
            {t('portal.student.classes.taOn', 'TA on')} {nextTa.session_date}:{' '}
            {profileMap[nextTa.accepting_ta_id]?.display_name ||
              profileMap[nextTa.accepting_ta_id]?.email ||
              t('portal.student.classes.taFallback', 'TA')}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/portal/student/attendance?term=${encodeURIComponent(classRow.term_id)}&classId=${encodeURIComponent(classRow.id)}`}
            className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
          >
            {t('portal.student.classes.viewAttendance', 'View Attendance')}
          </Link>
          <Link
            href={`/portal/student/resources?classId=${encodeURIComponent(classRow.id)}`}
            className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
          >
            {t('portal.student.classes.viewResources', 'View Resources')}
          </Link>
          <Link
            href={`/portal/student/homework?classId=${encodeURIComponent(classRow.id)}`}
            className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
          >
            {t('portal.student.classes.viewHomework', 'View Homework')}
          </Link>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title={t('portal.student.classes.title', 'My Classes')}
        description={
          activeTerm
            ? `${activeTerm.name} ${t('portal.student.classes.description', 'term schedule and Zoom access.')}`
            : t('portal.student.classes.noTerm', 'No active term is configured right now.')
        }
      >
        {currentClasses.length === 0 && pastClasses.length === 0 && privateGroupClasses.length === 0 ? (
          <EnrollmentRequiredBanner role="student" locale={session.profile.locale === "zh" ? "zh" : "en"} />
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold text-navy-800 dark:text-white">
              {t('portal.student.classes.currentEnrollments', 'Current Enrollments')}
            </h3>
            {currentClasses.length === 0 ? (
              <p className="text-sm text-charcoal/70 dark:text-navy-300">
                {t('portal.student.classes.noCurrentEnrollments', 'No active enrollments in the current term.')}
              </p>
            ) : (
              <div className="space-y-4">{currentClasses.map((classRow: any) => renderClassCard(classRow, false))}</div>
            )}

            {privateGroupClasses.length > 0 ? (
              <div className="pt-4 border-t border-warm-200 dark:border-navy-700 space-y-4">
                <h3 className="font-semibold text-navy-800 dark:text-white">
                  {t('portal.student.classes.privateGroups', 'Private Coaching Groups')}
                </h3>
                <div className="space-y-4">{privateGroupClasses.map(renderPrivateGroupCard)}</div>
              </div>
            ) : null}

            {pastClasses.length > 0 ? (
              <div className="pt-4 border-t border-warm-200 dark:border-navy-700 space-y-4">
                <h3 className="font-semibold text-navy-800 dark:text-white">
                  {t('portal.student.classes.pastEnrollments', 'Past Enrollments')}
                </h3>
                <div className="space-y-4">{pastClasses.map((classRow: any) => renderClassCard(classRow, true))}</div>
              </div>
            ) : null}
          </div>
        )}
      </SectionCard>

      {quickLinks}
    </div>
  );
}
