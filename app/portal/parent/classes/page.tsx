export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getActiveTerm, getProfileMap } from '@/lib/portal/data';
import { classTypeLabel, getClassTypeLabel } from '@/lib/portal/labels';
import { getParentSelection } from '@/lib/portal/parent';
import { parentT } from '@/lib/portal/parent-i18n';
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
        <a href="/portal/parent/dashboard" className="mt-3 inline-block text-sm font-medium text-navy-700 dark:text-gold-300 underline">
          {parentT(locale, 'portal.parent.common.goToDashboard', 'Go to Dashboard to link a student')}
        </a>
      </SectionCard>
    );
  }

  if (!selectedStudentId || params.student !== selectedStudentId) {
    redirect(`/portal/parent/classes?student=${selectedStudentId}`);
  }

  const activeTerm = await getActiveTerm(supabase);

  const enrollments = ((await supabase
    .from('enrollments')
    .select('class_id,status')
    .eq('student_id', selectedStudentId)
    .in('status', ['active', 'completed'])).data ?? []) as Array<Record<string, any>>;
  const classIds = enrollments.map((row: any) => row.class_id);
  const classes = classIds.length
    ? (((await supabase.from('classes').select('*').in('id', classIds).order('schedule_day')).data ?? []) as Array<Record<string, any>>)
    : ([] as Array<Record<string, any>>);

  const termIds = [...new Set(classes.map((classRow: any) => classRow.term_id).filter(Boolean))];
  const terms = termIds.length
    ? (((await supabase.from('terms').select('id,name,start_date,end_date,is_active').in('id', termIds)).data ?? []) as Array<Record<string, any>>)
    : ([] as Array<Record<string, any>>);
  const termMap = Object.fromEntries(terms.map((term) => [term.id, term]));

  const classCoachIds = [...new Set(classes.map((classRow: any) => classRow.coach_id).filter(Boolean))];
  const today = new Date().toISOString().slice(0, 10);
  const classIdsForSubs = classes.map((classRow: any) => classRow.id);
  const subRequests = classIdsForSubs.length
    ? (((await supabase
        .from('sub_requests')
        .select('class_id,accepting_coach_id,session_date,status')
        .in('class_id', classIdsForSubs)
        .eq('status', 'accepted')
        .gte('session_date', today)
        .order('session_date', { ascending: true })).data ?? []) as Array<Record<string, any>>)
    : ([] as Array<Record<string, any>>);
  const taRequests = classIdsForSubs.length
    ? (((await supabase
        .from('ta_requests')
        .select('class_id,accepting_ta_id,session_date,status')
        .in('class_id', classIdsForSubs)
        .eq('status', 'accepted')
        .gte('session_date', today)
        .order('session_date', { ascending: true })).data ?? []) as Array<Record<string, any>>)
    : ([] as Array<Record<string, any>>);
  const nextSubByClass = new Map<string, any>();
  for (const row of subRequests) if (!nextSubByClass.has(row.class_id)) nextSubByClass.set(row.class_id, row);
  const nextTaByClass = new Map<string, any>();
  for (const row of taRequests) if (!nextTaByClass.has(row.class_id)) nextTaByClass.set(row.class_id, row);
  const peopleIds = [
    ...classCoachIds,
    ...subRequests.map((row: any) => row.accepting_coach_id).filter(Boolean),
    ...taRequests.map((row: any) => row.accepting_ta_id).filter(Boolean),
  ];
  const subPeople = await getProfileMap(supabase, peopleIds);
  const missingPersonIds = [...new Set(peopleIds.filter((id) => Boolean(id) && !subPeople[id]))];
  if (missingPersonIds.length) {
    const admin = getSupabaseAdminClient();
    const [{ data: coachRows }, { data: profileRows }] = await Promise.all([
      admin.from('coach_profiles').select('coach_id').in('coach_id', missingPersonIds),
      admin.from('profiles').select('id,display_name,email').in('id', missingPersonIds),
    ]);
    const coachIdSet = new Set((coachRows ?? []).map((row: { coach_id: string }) => row.coach_id));
    for (const profile of (profileRows ?? []) as Array<{ id: string; display_name: string | null; email: string }>) {
      if (coachIdSet.has(profile.id)) {
        subPeople[profile.id] = profile as any;
      }
    }
  }

  const enrollmentStatusByClass = new Map<string, string>();
  for (const enrollment of enrollments) {
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

  // Fetch upcoming sessions for these private groups (scoped to the selected student so a
  // parent doesn't see sibling-only sessions in a shared group).
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
          {parentT(locale, 'portal.parent.common.coachLabel', 'Coach')}:{' '}
          {subPeople[classRow.coach_id]?.display_name ||
            subPeople[classRow.coach_id]?.email ||
            parentT(locale, 'portal.parent.common.coachFallback', 'DSDC Coach')}
        </p>
        {next ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-2">
            <span className="font-medium">{parentT(locale, 'portal.parent.classes.nextSession', 'Next session')}:</span>{' '}
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
            {parentT(locale, 'portal.parent.classes.noUpcomingSessions', 'No upcoming sessions scheduled.')}
          </p>
        )}
        {next?.zoom_link ? (
          <p className="text-sm mt-1">
            {parentT(locale, 'portal.parent.common.zoomLabel', 'Zoom')}:{' '}
            <a
              href={next.zoom_link}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-navy-700 dark:text-navy-200"
            >
              {parentT(locale, 'portal.parent.common.joinClass', 'Join Class')}
            </a>
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`/portal/parent/attendance?student=${encodeURIComponent(selectedStudentId)}&classId=${encodeURIComponent(classRow.id)}`}
            className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
          >
            {parentT(locale, 'portal.parent.classes.viewAttendance', 'View Attendance')}
          </a>
          <a
            href={`/portal/parent/resources?student=${encodeURIComponent(selectedStudentId)}&classId=${encodeURIComponent(classRow.id)}`}
            className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
          >
            {parentT(locale, 'portal.parent.classes.viewResources', 'View Resources')}
          </a>
        </div>
      </article>
    );
  };

  const renderClassCard = (classRow: any, isPast: boolean) => (
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
        {parentT(locale, 'portal.parent.classes.termLabel', 'Term')}:{' '}
        {classRow.term?.name || parentT(locale, 'portal.parent.classes.noTermLabel', 'Unassigned term')}
      </p>
      <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
        {parentT(locale, 'portal.parent.common.coachLabel', 'Coach')}:{' '}
        {subPeople[classRow.coach_id]?.display_name ||
          subPeople[classRow.coach_id]?.email ||
          parentT(locale, 'portal.parent.common.coachFallback', 'DSDC Coach')}
      </p>
      {!isPast && nextSubByClass.get(classRow.id) ? (
        <p className="mt-2 text-sm rounded-md bg-gold-100 text-navy-900 px-2 py-1 inline-block">
          {parentT(locale, 'portal.parent.common.subLabel', 'Sub')}:{' '}
          {subPeople[nextSubByClass.get(classRow.id).accepting_coach_id]?.display_name ||
            subPeople[nextSubByClass.get(classRow.id).accepting_coach_id]?.email ||
            parentT(locale, 'portal.parent.common.subFallback', 'Coach')}{' '}
          {parentT(locale, 'portal.parent.common.onDate', 'on')} {nextSubByClass.get(classRow.id).session_date}
        </p>
      ) : null}
      {!isPast && nextTaByClass.get(classRow.id) ? (
        <p className="mt-2 text-sm rounded-md bg-blue-100 text-navy-900 px-2 py-1 inline-block">
          {parentT(locale, 'portal.parent.common.taLabel', 'TA')}:{' '}
          {subPeople[nextTaByClass.get(classRow.id).accepting_ta_id]?.display_name ||
            subPeople[nextTaByClass.get(classRow.id).accepting_ta_id]?.email ||
            parentT(locale, 'portal.parent.common.taFallback', 'TA')}{' '}
          {parentT(locale, 'portal.parent.common.onDate', 'on')} {nextTaByClass.get(classRow.id).session_date}
        </p>
      ) : null}
      <p className="text-sm mt-1">
        {classRow.zoom_link ? (
          <>
            {parentT(locale, 'portal.parent.common.zoomLabel', 'Zoom')}:{' '}
            <a href={classRow.zoom_link} target="_blank" rel="noopener noreferrer" className="underline text-navy-700 dark:text-navy-200">
              {parentT(locale, 'portal.parent.common.joinClass', 'Join Class')}
            </a>
          </>
        ) : (
          <span className="text-charcoal/50 dark:text-navy-400 italic">
            {parentT(locale, 'portal.parent.common.zoomUnavailable', 'Zoom link not yet available')}
          </span>
        )}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={`/portal/parent/attendance?student=${encodeURIComponent(selectedStudentId)}&term=${encodeURIComponent(classRow.term_id)}&classId=${encodeURIComponent(classRow.id)}`}
          className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
        >
          {parentT(locale, 'portal.parent.classes.viewAttendance', 'View Attendance')}
        </a>
        <a
          href={`/portal/parent/resources?student=${encodeURIComponent(selectedStudentId)}&classId=${encodeURIComponent(classRow.id)}`}
          className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
        >
          {parentT(locale, 'portal.parent.classes.viewResources', 'View Resources')}
        </a>
      </div>
    </article>
  );

  return (
    <SectionCard
      title={parentT(locale, 'portal.parent.classes.title', "My Student's Classes")}
      description={
        activeTerm
          ? `${parentT(locale, 'portal.parent.selectedStudent', 'Selected student')}: ${
              selectedStudent?.display_name || selectedStudent?.email || selectedStudentId
            } - ${activeTerm.name}`
          : `${parentT(locale, 'portal.parent.selectedStudent', 'Selected student')}: ${
              selectedStudent?.display_name || selectedStudent?.email || selectedStudentId
            }`
      }
    >
      {currentClasses.length === 0 && pastClasses.length === 0 && privateGroupClasses.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {parentT(locale, 'portal.parent.common.noActiveEnrollments', 'No active enrollments.')}
        </p>
      ) : (
        <div className="space-y-4">
          <h3 className="font-semibold text-navy-800 dark:text-white">
            {parentT(locale, 'portal.parent.classes.currentEnrollments', 'Current Enrollments')}
          </h3>
          {currentClasses.length === 0 ? (
            <p className="text-sm text-charcoal/70 dark:text-navy-300">
              {parentT(locale, 'portal.parent.classes.noCurrentEnrollments', 'No active enrollments in the current term.')}
            </p>
          ) : (
            <div className="space-y-4">{currentClasses.map((classRow: any) => renderClassCard(classRow, false))}</div>
          )}

          {privateGroupClasses.length > 0 ? (
            <div className="pt-4 border-t border-warm-200 dark:border-navy-700 space-y-4">
              <h3 className="font-semibold text-navy-800 dark:text-white">
                {parentT(locale, 'portal.parent.classes.privateGroups', 'Private Coaching Groups')}
              </h3>
              <div className="space-y-4">{privateGroupClasses.map(renderPrivateGroupCard)}</div>
            </div>
          ) : null}

          {pastClasses.length > 0 ? (
            <div className="pt-4 border-t border-warm-200 dark:border-navy-700 space-y-4">
              <h3 className="font-semibold text-navy-800 dark:text-white">
                {parentT(locale, 'portal.parent.classes.pastEnrollments', 'Past Enrollments')}
              </h3>
              <div className="space-y-4">{pastClasses.map((classRow: any) => renderClassCard(classRow, true))}</div>
            </div>
          ) : null}
        </div>
      )}
    </SectionCard>
  );
}
