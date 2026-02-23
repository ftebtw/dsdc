import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { classTypeLabel, formatClassSchedule } from '@/lib/portal/labels';
import { getProfileMap } from '@/lib/portal/data';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

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

async function createClass(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();

  await supabase.from('classes').insert({
    term_id: String(formData.get('term_id')),
    name: String(formData.get('name')),
    description: String(formData.get('description') || '') || null,
    type: String(formData.get('type')) as Database['public']['Enums']['class_type'],
    coach_id: String(formData.get('coach_id')),
    schedule_day: String(formData.get('schedule_day')) as Database['public']['Enums']['schedule_day'],
    schedule_start_time: String(formData.get('schedule_start_time')),
    schedule_end_time: String(formData.get('schedule_end_time')),
    timezone: String(formData.get('timezone') || 'America/Vancouver'),
    zoom_link: String(formData.get('zoom_link') || '') || null,
    max_students: Number(formData.get('max_students') || 12),
    eligible_sub_tier: String(formData.get('eligible_sub_tier')) as Database['public']['Enums']['coach_tier'],
  });

  revalidatePath('/portal/admin/classes');
}

async function updateClass(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const classId = String(formData.get('id') || '');
  if (!classId) return;

  await supabase
    .from('classes')
    .update({
      term_id: String(formData.get('term_id')),
      name: String(formData.get('name')),
      description: String(formData.get('description') || '') || null,
      type: String(formData.get('type')) as Database['public']['Enums']['class_type'],
      coach_id: String(formData.get('coach_id')),
      schedule_day: String(formData.get('schedule_day')) as Database['public']['Enums']['schedule_day'],
      schedule_start_time: String(formData.get('schedule_start_time')),
      schedule_end_time: String(formData.get('schedule_end_time')),
      timezone: String(formData.get('timezone') || 'America/Vancouver'),
      zoom_link: String(formData.get('zoom_link') || '') || null,
      max_students: Number(formData.get('max_students') || 12),
      eligible_sub_tier: String(formData.get('eligible_sub_tier')) as Database['public']['Enums']['coach_tier'],
    })
    .eq('id', classId);

  revalidatePath('/portal/admin/classes');
}

async function deleteClass(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const classId = String(formData.get('id') || '');
  if (!classId) return;
  await supabase.from('classes').delete().eq('id', classId);
  revalidatePath('/portal/admin/classes');
}

export default async function AdminClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ term?: string }>;
}) {
  await requireRole(['admin']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const [{ data: termsData }, { data: coachProfilesData }, { data: tierAssignmentsData }] = await Promise.all([
    supabase.from('terms').select('*').order('start_date', { ascending: false }),
    supabase.from('coach_profiles').select('coach_id,tier,is_ta'),
    supabase.from('coach_tier_assignments').select('coach_id,tier'),
  ]);
  const terms = (termsData ?? []) as Array<Record<string, any>>;
  const coachProfiles = (coachProfilesData ?? []) as Array<Record<string, any>>;
  const tiersByCoach = new Map<string, string[]>();
  for (const row of (tierAssignmentsData ?? []) as Array<{ coach_id: string; tier: string }>) {
    const list = tiersByCoach.get(row.coach_id) ?? [];
    list.push(row.tier);
    tiersByCoach.set(row.coach_id, list);
  }

  const selectedTermId =
    params.term || terms.find((term: any) => term.is_active)?.id || terms[0]?.id || '';

  const classes = selectedTermId
    ? (((await supabase.from('classes').select('*').eq('term_id', selectedTermId).order('name')).data ??
        []) as Array<Record<string, any>>)
    : ([] as Array<Record<string, any>>);

  const coachIds = coachProfiles.map((row: any) => row.coach_id);
  const coachMap = await getProfileMap(supabase, coachIds);

  const classIds = classes.map((classRow) => classRow.id);
  const enrollments = classIds.length
    ? (((await supabase
        .from('enrollments')
        .select('class_id,student_id,status')
        .in('class_id', classIds)
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
      <SectionCard title="Classes by Term" description="Create and manage class schedules for each term.">
        <form method="get" className="flex flex-wrap items-center gap-3 mb-4">
          <label className="text-sm text-navy-700 dark:text-navy-200">Select term</label>
          <select
            name="term"
            defaultValue={selectedTermId}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            {terms.map((term: any) => (
              <option key={term.id} value={term.id}>
                {term.name} {term.is_active ? '(Active)' : ''}
              </option>
            ))}
          </select>
          <button className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
            Load
          </button>
        </form>

        {selectedTermId ? (
          <form action={createClass} className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
            <input type="hidden" name="term_id" value={selectedTermId} />
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
            <select
              name="schedule_day"
              defaultValue="sat"
              className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            >
              {scheduleDays.map((day) => (
                <option key={day} value={day}>
                  {day.toUpperCase()}
                </option>
              ))}
            </select>
            <input
              required
              type="time"
              name="schedule_start_time"
              className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            />
            <input
              required
              type="time"
              name="schedule_end_time"
              className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            />
            <input
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
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold justify-self-start"
            >
              Create Class
            </button>
          </form>
        ) : (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">Create a term first to add classes.</p>
        )}
      </SectionCard>

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
                <input type="hidden" name="term_id" value={selectedTermId} />
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
                <input
                  name="timezone"
                  defaultValue={classRow.timezone}
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                />
                <select
                  name="schedule_day"
                  defaultValue={classRow.schedule_day}
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                >
                  {scheduleDays.map((day) => (
                    <option key={day} value={day}>
                      {day.toUpperCase()}
                    </option>
                  ))}
                </select>
                <input
                  name="schedule_start_time"
                  type="time"
                  defaultValue={classRow.schedule_start_time}
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                />
                <input
                  name="schedule_end_time"
                  type="time"
                  defaultValue={classRow.schedule_end_time}
                  className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                />
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
                <div className="lg:col-span-4 text-sm text-charcoal/75 dark:text-navy-300">
                  Schedule: {formatClassSchedule(classRow.schedule_day, classRow.schedule_start_time, classRow.schedule_end_time)}
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
                <div className="lg:col-span-4 flex items-center gap-2">
                  <button type="submit" className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-sm font-semibold">
                    Save
                  </button>
                  <button formAction={deleteClass} className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm">
                    Delete
                  </button>
                  <Link
                    href={`/portal/admin/students?classId=${classRow.id}`}
                    className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                  >
                    View Students
                  </Link>
                </div>
              </form>
            );
          })}
          {classes.length === 0 ? (
            <p className="text-sm text-charcoal/70 dark:text-navy-300">No classes found for this term.</p>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
