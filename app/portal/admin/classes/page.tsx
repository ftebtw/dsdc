export const dynamic = 'force-dynamic';

import Link from 'next/link';
import CancelClassButton from '@/app/portal/_components/CancelClassButton';
import ConfirmDeleteButton from '@/app/portal/_components/ConfirmDeleteButton';
import FlashBanners from '@/app/portal/_components/FlashBanners';
import SectionCard from '@/app/portal/_components/SectionCard';
import TimezoneSelectNative from '@/app/portal/_components/TimezoneSelectNative';
import { requireRole } from '@/lib/portal/auth';
import { classTypeLabel } from '@/lib/portal/labels';
import { getProfileMap } from '@/lib/portal/data';
import { formatClassScheduleDaysForViewer } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import { createClass, updateClass, deleteClass, cloneClassesToTerm, archiveClass, unarchiveClass } from './actions';
import PrivateGroupRename from './PrivateGroupRename';

const classTypes: Database['public']['Enums']['class_type'][] = [
  'novice_debate',
  'intermediate_debate',
  'advanced_debate',
  'public_speaking',
  'wsc',
];

const scheduleDays: Database['public']['Enums']['schedule_day'][] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];

const tiers: Database['public']['Enums']['coach_tier'][] = ['junior', 'senior', 'wsc'];

function formatTierLabel(tier: string): string {
  if (tier === 'wsc') return 'WSC';
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function formatCoachTier(
  coach: { coach_id: string; tier: Database['public']['Enums']['coach_tier'] | null; is_ta: boolean },
  tiersByCoach: Map<string, string[]>
) {
  const assignedTiers = tiersByCoach.get(coach.coach_id) ?? [];
  const formattedAssignments = assignedTiers
    .map((tier) => formatTierLabel(tier))
    .join(', ');

  if (coach.is_ta) {
    return 'TA';
  }
  if (formattedAssignments) {
    return formattedAssignments;
  }
  return coach.tier ? coach.tier : 'Coach';
}

export default async function AdminClassesPage({
  searchParams,
}: {
  searchParams: Promise<{
    term?: string;
    created?: string;
    saved?: string;
    deleted?: string;
    cloned?: string;
    archived?: string;
    unarchived?: string;
    show_archived?: string;
    error?: string;
  }>;
}) {
  const session = await requireRole(['admin']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const [{ data: termsData }, { data: coachProfilesData }, { data: tierAssignmentsData }, { data: allClassesData }, { data: classCoachesData }] = await Promise.all([
    supabase.from('terms').select('*').order('start_date', { ascending: false }),
    supabase.from('coach_profiles').select('coach_id,tier,is_ta'),
    supabase.from('coach_tier_assignments').select('coach_id,tier'),
    supabase.from('classes').select('id,term_id'),
    supabase.from('class_coaches').select('class_id,coach_id'),
  ]);
  const terms = (termsData ?? []) as Array<Record<string, any>>;
  const coachProfiles = (coachProfilesData ?? []) as Array<Record<string, any>>;
  const allClasses = (allClassesData ?? []) as Array<{ id: string; term_id: string }>;
  const tiersByCoach = new Map<string, string[]>();
  for (const row of (tierAssignmentsData ?? []) as Array<{ coach_id: string; tier: string }>) {
    const list = tiersByCoach.get(row.coach_id) ?? [];
    list.push(row.tier);
    tiersByCoach.set(row.coach_id, list);
  }
  const classCountByTerm = new Map<string, number>();
  for (const cls of allClasses) {
    classCountByTerm.set(cls.term_id, (classCountByTerm.get(cls.term_id) ?? 0) + 1);
  }
  const classCoachesMap = new Map<string, string[]>();
  for (const row of (classCoachesData ?? []) as Array<{ class_id: string; coach_id: string }>) {
    const list = classCoachesMap.get(row.class_id) ?? [];
    list.push(row.coach_id);
    classCoachesMap.set(row.class_id, list);
  }

  // Term is now purely an optional filter — no more "default active term"
  // behaviour. When no `term` param is provided, every non-private-group
  // class shows up.
  const selectedTermId = params.term ?? '';
  const filterByTerm = selectedTermId !== '';

  const showArchived = params.show_archived === '1';

  let classesQuery = supabase
    .from('classes')
    .select('*')
    .eq('is_private_session_group', false)
    .order('name');
  if (filterByTerm) classesQuery = classesQuery.eq('term_id', selectedTermId);
  if (!showArchived) classesQuery = classesQuery.is('archived_at', null);

  const classes = ((await classesQuery).data ?? []) as Array<Record<string, any>>;

  // Private session group classrooms (no term, no schedule). Respect the same
  // show_archived toggle.
  let privateGroupsQuery = supabase
    .from('classes')
    .select('*')
    .eq('is_private_session_group', true)
    .order('name');
  if (!showArchived) privateGroupsQuery = privateGroupsQuery.is('archived_at', null);
  const privateGroups = ((await privateGroupsQuery).data ?? []) as Array<Record<string, any>>;

  const coachIds = coachProfiles.map((row: any) => row.coach_id);
  const coachMap = await getProfileMap(supabase, coachIds);

  const allClassIdsForEnrollments = [
    ...classes.map((classRow) => classRow.id),
    ...privateGroups.map((classRow) => classRow.id),
  ];
  const classIds = classes.map((classRow) => classRow.id);
  const enrollments = allClassIdsForEnrollments.length
    ? (((await supabase
        .from('enrollments')
        .select('class_id,student_id,status')
        .in('class_id', allClassIdsForEnrollments)
        .eq('status', 'active')).data ?? []) as Array<Record<string, any>>)
    : ([] as Array<Record<string, any>>);
  const studentMap = await getProfileMap(
    supabase,
    [...new Set(enrollments.map((row) => row.student_id))]
  );

  const enrollmentsByClass = new Map<string, string[]>();
  for (const enrollment of enrollments) {
    const list = enrollmentsByClass.get(enrollment.class_id) ?? [];
    list.push(enrollment.student_id);
    enrollmentsByClass.set(enrollment.class_id, list);
  }

  return (
    <div className="space-y-6">
      <FlashBanners
        searchParams={params}
        successMessages={{
          created: 'Class created.',
          saved: 'Class saved.',
          deleted: 'Class deleted.',
          cloned: 'Classes cloned to target term.',
          archived: 'Class archived. It still appears for enrolled students under Past Classes.',
          unarchived: 'Class restored.',
        }}
        errorMessages={{
          missing_record: 'Class not found.',
          save_failed: 'Could not save the class. Please try again.',
          delete_failed: 'Could not delete the class. It may still have related enrollments or attendance.',
          invalid_clone: 'Pick a different source and target term.',
          target_term_not_empty: 'The target term already has classes; clone aborted.',
          source_term_empty: 'The source term has no classes to clone.',
          clone_failed: 'Cloning classes failed. Please try again.',
          archive_failed: 'Could not archive the class. Please try again.',
          unarchive_failed: 'Could not restore the class. Please try again.',
          schedule_days_required: 'Pick at least one day of the week for the class.',
          term_or_dates_required: 'Pick a term, or provide a start date and end date.',
          invalid_date_range: 'End date must be on or after the start date.',
        }}
      />
      <SectionCard
        title="Classes"
        description="Create classes with custom schedules. Term is optional — leave it off for camps, workshops, and one-offs."
      >
        <form method="get" className="flex flex-wrap items-center gap-3 mb-4">
          {terms.length > 0 ? (
            <>
              <label className="text-sm text-navy-700 dark:text-navy-200">Filter by term</label>
              <select
                name="term"
                defaultValue={selectedTermId}
                className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
              >
                <option value="">All classes</option>
                {terms.map((term: any) => (
                  <option key={term.id} value={term.id}>
                    {term.name} {term.is_active ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </>
          ) : null}
          <label className="flex items-center gap-1.5 text-sm text-navy-700 dark:text-navy-200">
            <input type="checkbox" name="show_archived" value="1" defaultChecked={showArchived} />
            Show archived
          </label>
          <button className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
            Load
          </button>
        </form>

        <form action={createClass} className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
          <input
            required
            name="name"
            placeholder="Class name"
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <select
            name="type"
            defaultValue="novice_debate"
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            {classTypes.map((type) => (
              <option key={type} value={type}>
                {classTypeLabel[type]}
              </option>
            ))}
          </select>
          <select
            name="coach_id"
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            {coachProfiles.map((coach: any) => (
              <option key={coach.coach_id} value={coach.coach_id}>
                {coachMap[coach.coach_id]?.display_name || coachMap[coach.coach_id]?.email || coach.coach_id} (
                {formatCoachTier(coach, tiersByCoach)})
              </option>
            ))}
          </select>
          {terms.length > 0 ? (
            <select
              name="term_id"
              defaultValue={selectedTermId}
              className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            >
              <option value="">No term (use start/end dates)</option>
              {terms.map((term: any) => (
                <option key={term.id} value={term.id}>
                  Term: {term.name} {term.is_active ? '(Active)' : ''}
                </option>
              ))}
            </select>
          ) : (
            <input type="hidden" name="term_id" value="" />
          )}
          <fieldset className="col-span-full">
            <legend className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300 mb-1">
              Additional Coaches (optional)
            </legend>
            <div className="flex flex-wrap gap-2">
              {coachProfiles.map((coach: any) => (
                <label key={coach.coach_id} className="flex items-center gap-1 text-sm">
                  <input type="checkbox" name="co_coach_ids" value={coach.coach_id} />
                  {coachMap[coach.coach_id]?.display_name || coachMap[coach.coach_id]?.email || coach.coach_id}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="col-span-full grid md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-700 dark:text-navy-200 mb-1">
                Start date
              </label>
              <input
                type="date"
                name="start_date"
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-700 dark:text-navy-200 mb-1">
                End date
              </label>
              <input
                type="date"
                name="end_date"
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-700 dark:text-navy-200 mb-1">
                Start time
              </label>
              <input
                required
                type="time"
                name="schedule_start_time"
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-700 dark:text-navy-200 mb-1">
                End time
              </label>
              <input
                required
                type="time"
                name="schedule_end_time"
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
              />
            </div>
          </div>
          <fieldset className="col-span-full">
            <legend className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300 mb-1">
              Days of the week (weekly)
            </legend>
            <div className="flex flex-wrap gap-3">
              {scheduleDays.map((day) => (
                <label
                  key={day}
                  className="flex items-center gap-1.5 text-sm text-navy-700 dark:text-navy-200"
                >
                  <input type="checkbox" name="schedule_days" value={day} />
                  {day.toUpperCase()}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-charcoal/55 dark:text-navy-400">
              Pick one or more days. Sessions repeat weekly on each selected day between the start and end date (or the term window).
            </p>
          </fieldset>
          <TimezoneSelectNative
            name="timezone"
            defaultValue="America/Vancouver"
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <input
            name="zoom_link"
            placeholder="Zoom link"
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <input
            name="max_students"
            type="number"
            min={1}
            defaultValue={12}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <select
            name="eligible_sub_tier"
            defaultValue="junior"
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            {tiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
          <input
            name="description"
            placeholder="Description (optional)"
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 md:col-span-2"
          />
          <input
            name="custom_price_cad"
            type="number"
            min={0}
            step={1}
            placeholder="Custom price CAD (optional)"
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold justify-self-start"
          >
            Create Class
          </button>
        </form>
      </SectionCard>

      {terms.length >= 2 ? (
        <SectionCard title="Clone Classes" description="Copy all classes from one term to another.">
          <form action={cloneClassesToTerm} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-700 dark:text-navy-200 mb-1">
                Copy from
              </label>
              <select
                name="source_term_id"
                required
                className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm"
              >
                {terms.map((term: any) => (
                  <option key={term.id} value={term.id}>
                    {term.name} ({term.start_date} - {term.end_date}) ({classCountByTerm.get(term.id) ?? 0}{' '}
                    classes)
                  </option>
                ))}
              </select>
            </div>
            <div className="text-lg text-charcoal/40">{"->"}</div>
            <div>
              <label className="block text-xs font-medium text-navy-700 dark:text-navy-200 mb-1">
                Copy to
              </label>
              <select
                name="target_term_id"
                required
                className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm"
              >
                {terms.map((term: any) => (
                  <option key={term.id} value={term.id}>
                    {term.name} ({term.start_date} - {term.end_date}) ({classCountByTerm.get(term.id) ?? 0}{' '}
                    classes)
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-navy-800 text-white px-4 py-2 text-sm font-semibold hover:bg-navy-700 dark:bg-gold-300 dark:text-navy-900 dark:hover:bg-gold-200"
            >
              Clone Classes
            </button>
          </form>
          <p className="mt-2 text-xs text-charcoal/50 dark:text-navy-400">
            Copies name, type, coach, schedule, and settings. Only works if the target term has no classes yet.
          </p>
        </SectionCard>
      ) : null}

      <SectionCard title="Class List" description="Edit, delete, and review class enrollment.">
        <div className="space-y-4">
          {classes.map((classRow) => {
            const studentIds = enrollmentsByClass.get(classRow.id) ?? [];
            return (
              <form
                key={classRow.id}
                action={updateClass}
                className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4 grid lg:grid-cols-4 gap-3"
              >
                <input type="hidden" name="id" value={classRow.id} />
                <input
                  name="name"
                  defaultValue={classRow.name}
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                />
                <select
                  name="type"
                  defaultValue={classRow.type}
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                >
                  {classTypes.map((type) => (
                    <option key={type} value={type}>
                      {classTypeLabel[type]}
                    </option>
                  ))}
                </select>
                <select
                  name="coach_id"
                  defaultValue={classRow.coach_id}
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                >
                  {coachProfiles.map((coach: any) => (
                    <option key={coach.coach_id} value={coach.coach_id}>
                      {coachMap[coach.coach_id]?.display_name || coachMap[coach.coach_id]?.email || coach.coach_id} (
                      {formatCoachTier(coach, tiersByCoach)})
                    </option>
                  ))}
                </select>
                <fieldset className="lg:col-span-4">
                  <legend className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300 mb-1">
                    Additional Coaches
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {coachProfiles.map((coach: any) => (
                      <label key={coach.coach_id} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          name="co_coach_ids"
                          value={coach.coach_id}
                          defaultChecked={(classCoachesMap.get(classRow.id) ?? []).includes(coach.coach_id)}
                        />
                        {coachMap[coach.coach_id]?.display_name || coachMap[coach.coach_id]?.email || coach.coach_id}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <TimezoneSelectNative
                  name="timezone"
                  defaultValue={classRow.timezone}
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                />
                <select
                  name="term_id"
                  defaultValue={classRow.term_id ?? ''}
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                >
                  <option value="">No term (use start/end dates)</option>
                  {terms.map((term: any) => (
                    <option key={term.id} value={term.id}>
                      Term: {term.name}
                    </option>
                  ))}
                </select>
                <input
                  name="schedule_start_time"
                  type="time"
                  defaultValue={classRow.schedule_start_time ?? ''}
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                />
                <input
                  name="schedule_end_time"
                  type="time"
                  defaultValue={classRow.schedule_end_time ?? ''}
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                />
                <input
                  name="start_date"
                  type="date"
                  defaultValue={classRow.start_date ?? ''}
                  placeholder="Start date"
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                />
                <input
                  name="end_date"
                  type="date"
                  defaultValue={classRow.end_date ?? ''}
                  placeholder="End date"
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                />
                <fieldset className="lg:col-span-4">
                  <legend className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300 mb-1">
                    Days of the week
                  </legend>
                  <div className="flex flex-wrap gap-3">
                    {scheduleDays.map((day) => {
                      const rowDays: string[] = Array.isArray(classRow.schedule_days)
                        ? (classRow.schedule_days as string[])
                        : classRow.schedule_day
                          ? [classRow.schedule_day as string]
                          : [];
                      return (
                        <label
                          key={day}
                          className="flex items-center gap-1.5 text-sm text-navy-700 dark:text-navy-200"
                        >
                          <input
                            type="checkbox"
                            name="schedule_days"
                            value={day}
                            defaultChecked={rowDays.includes(day)}
                          />
                          {day.toUpperCase()}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <input
                  name="max_students"
                  type="number"
                  min={1}
                  defaultValue={classRow.max_students}
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                />
                <input
                  name="zoom_link"
                  defaultValue={classRow.zoom_link || ''}
                  placeholder="Zoom link"
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                />
                <select
                  name="eligible_sub_tier"
                  defaultValue={classRow.eligible_sub_tier}
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                >
                  {tiers.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
                <input
                  name="description"
                  defaultValue={classRow.description || ''}
                  placeholder="Description"
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 lg:col-span-2"
                />
                <input
                  name="custom_price_cad"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={classRow.custom_price_cad ?? ''}
                  placeholder="Custom price CAD (optional)"
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                />
                <div className="lg:col-span-4 text-sm text-charcoal/75 dark:text-navy-300">
                  Schedule:{' '}
                  {formatClassScheduleDaysForViewer(
                    classRow.schedule_days,
                    classRow.schedule_day,
                    classRow.schedule_start_time,
                    classRow.schedule_end_time,
                    classRow.timezone,
                    session.profile.timezone
                  )}
                  {' • '}
                  {studentIds.length} enrolled •{' '}
                  {studentIds.length ? (
                    studentIds
                      .map((id) => studentMap[id]?.display_name || studentMap[id]?.email || id)
                      .join(', ')
                  ) : (
                    'No students'
                  )}
                </div>
                {(classCoachesMap.get(classRow.id) ?? []).length > 0 ? (
                  <p className="lg:col-span-4 text-xs text-charcoal/50 dark:text-navy-400">
                    +{' '}
                    {(classCoachesMap.get(classRow.id) ?? [])
                      .map((id: string) => coachMap[id]?.display_name || coachMap[id]?.email || id)
                      .join(', ')}
                  </p>
                ) : null}
                {classRow.archived_at ? (
                  <p className="lg:col-span-4 text-xs text-violet-700 dark:text-violet-300">
                    Archived on {new Date(classRow.archived_at).toLocaleDateString()}. Hidden from this list by default;
                    still visible to enrolled students under Past Classes.
                  </p>
                ) : null}
                <input
                  type="hidden"
                  name="redirect_to"
                  value={`/portal/admin/classes${
                    filterByTerm
                      ? `?term=${encodeURIComponent(selectedTermId)}${showArchived ? '&show_archived=1' : ''}`
                      : showArchived
                        ? '?show_archived=1'
                        : ''
                  }`}
                />
                <div className="lg:col-span-4 flex flex-wrap items-center gap-2">
                  <button type="submit" className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-sm font-semibold">
                    Save
                  </button>
                  <CancelClassButton
                    classId={classRow.id}
                    className={classRow.name}
                    scheduleDay={classRow.schedule_day}
                  />
                  {classRow.archived_at ? (
                    <button
                      type="submit"
                      formAction={unarchiveClass}
                      className="px-3 py-1.5 rounded-md border border-violet-400 bg-violet-50 dark:border-violet-700 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 text-sm"
                    >
                      Unarchive
                    </button>
                  ) : (
                    <button
                      type="submit"
                      formAction={archiveClass}
                      className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                    >
                      Archive
                    </button>
                  )}
                  <ConfirmDeleteButton
                    action={deleteClass}
                    hiddenFields={{ id: classRow.id }}
                    confirmMessage={`Delete "${classRow.name}"? This removes the class permanently and does NOT notify students. Use "Cancel Session" instead if the class is temporarily cancelled.`}
                  >
                    Delete
                  </ConfirmDeleteButton>
                  <Link
                    href={`/portal/admin/students?classId=${classRow.id}`}
                    className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                  >
                    View Students
                  </Link>
                  <Link
                    href={`/portal/admin/classes/${classRow.id}`}
                    className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </form>
            );
          })}
          {classes.length === 0 ? (
            <p className="text-sm text-charcoal/70 dark:text-navy-300">
              {filterByTerm ? 'No classes in this term.' : 'No classes yet. Create one above.'}
            </p>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        title="Private Coaching Groups"
        description="Ongoing private session group classrooms. Not tied to a term. Archive when the arrangement ends — resources and attendance remain accessible to enrolled students under Past Classes."
      >
        <div className="space-y-4">
          {privateGroups.map((group) => {
            const studentIds = enrollmentsByClass.get(group.id) ?? [];
            const coachName =
              coachMap[group.coach_id]?.display_name ||
              coachMap[group.coach_id]?.email ||
              group.coach_id;
            const isArchived = Boolean(group.archived_at);
            const groupRedirectTo = `/portal/admin/classes${showArchived ? '?show_archived=1' : ''}`;
            return (
              <div
                key={group.id}
                className={`rounded-xl border p-4 space-y-2 ${
                  isArchived
                    ? 'border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <PrivateGroupRename
                      groupId={group.id}
                      name={group.name}
                      description={group.description ?? null}
                      redirectTo={groupRedirectTo}
                    />
                    <p className="text-sm text-charcoal/65 dark:text-navy-300 mt-1">
                      Coach: {coachName}
                    </p>
                    <p className="text-sm text-charcoal/65 dark:text-navy-300 mt-1">
                      {studentIds.length} enrolled student{studentIds.length === 1 ? '' : 's'}
                      {studentIds.length > 0 ? (
                        <span className="text-charcoal/55 dark:text-navy-400">
                          {' '}
                          —{' '}
                          {studentIds
                            .map((id) => studentMap[id]?.display_name || studentMap[id]?.email || id)
                            .join(', ')}
                        </span>
                      ) : null}
                    </p>
                    {isArchived ? (
                      <p className="text-xs text-violet-700 dark:text-violet-300 mt-1">
                        Archived on {new Date(group.archived_at).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={isArchived ? unarchiveClass : archiveClass}>
                      <input type="hidden" name="id" value={group.id} />
                      <input type="hidden" name="redirect_to" value={groupRedirectTo} />
                      {isArchived ? (
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-md border border-violet-400 bg-white dark:border-violet-700 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 text-sm"
                        >
                          Unarchive
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                        >
                          Archive
                        </button>
                      )}
                    </form>
                    <Link
                      href={`/portal/admin/classes/${group.id}`}
                      className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
          {privateGroups.length === 0 ? (
            <p className="text-sm text-charcoal/70 dark:text-navy-300">
              {showArchived
                ? 'No private coaching groups (archived included).'
                : 'No active private coaching groups. Create one via the Create Private Session page.'}
            </p>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}

