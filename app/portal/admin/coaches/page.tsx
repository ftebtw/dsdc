export const dynamic = 'force-dynamic';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fromZonedTime } from 'date-fns-tz';
import AdminDeleteUserButton from '@/app/portal/_components/AdminDeleteUserButton';
import FlashBanners from '@/app/portal/_components/FlashBanners';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { formatUtcForUser } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';

async function updateHourlyRate(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();

  const coachId = String(formData.get('coach_id') || '');
  const hourlyRateRaw = String(formData.get('hourly_rate') || '').trim();
  if (!coachId) {
    redirect('/portal/admin/coaches?error=missing_record');
  }

  let hourlyRate: number | null = null;
  if (hourlyRateRaw) {
    const parsed = Number(hourlyRateRaw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      redirect('/portal/admin/coaches?error=invalid_rate');
    }
    hourlyRate = parsed;
  }

  const { error } = await supabase
    .from('coach_profiles')
    .update({ hourly_rate: hourlyRate })
    .eq('coach_id', coachId);
  if (error) {
    console.error('[admin-coaches] update hourly rate failed', error);
    redirect('/portal/admin/coaches?error=save_failed');
  }
  revalidatePath('/portal/admin/coaches');
  redirect('/portal/admin/coaches?saved=1');
}

async function archiveCoachProfile(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const coachId = String(formData.get('coach_id') || '');
  const showArchived = String(formData.get('show_archived') || '') === '1';
  if (!coachId) {
    redirect('/portal/admin/coaches?error=missing_record');
  }
  const supabase = await getSupabaseServerClient();
  const { error } = await (supabase as any)
    .from('coach_profiles')
    .update({ archived_at: new Date().toISOString() })
    .eq('coach_id', coachId);
  if (error) {
    console.error('[admin-coaches] archive failed', error);
    redirect(`/portal/admin/coaches?error=archive_failed${showArchived ? '&show_archived=1' : ''}`);
  }
  revalidatePath('/portal/admin/coaches');
  redirect(`/portal/admin/coaches?archived=1${showArchived ? '&show_archived=1' : ''}`);
}

async function unarchiveCoachProfile(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const coachId = String(formData.get('coach_id') || '');
  if (!coachId) {
    redirect('/portal/admin/coaches?show_archived=1&error=missing_record');
  }
  const supabase = await getSupabaseServerClient();
  const { error } = await (supabase as any)
    .from('coach_profiles')
    .update({ archived_at: null })
    .eq('coach_id', coachId);
  if (error) {
    console.error('[admin-coaches] unarchive failed', error);
    redirect('/portal/admin/coaches?show_archived=1&error=unarchive_failed');
  }
  revalidatePath('/portal/admin/coaches');
  redirect('/portal/admin/coaches?show_archived=1&unarchived=1');
}

function isLate(
  checkedInAtIso: string,
  sessionDate: string,
  scheduleStartTime: string,
  timezone: string
): boolean {
  const localStart = `${sessionDate}T${scheduleStartTime}`;
  const scheduledUtc = fromZonedTime(localStart, timezone).getTime();
  return new Date(checkedInAtIso).getTime() > scheduledUtc;
}

function formatTierLabel(tier: string): string {
  if (tier === 'wsc') return 'WSC';
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export default async function AdminCoachesPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    error?: string;
    show_archived?: string;
    archived?: string;
    unarchived?: string;
  }>;
}) {
  const session = await requireRole(['admin']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const showArchived = params.show_archived === '1';

  let coachProfilesQuery = supabase
    .from('coach_profiles')
    .select('*')
    .order('created_at', { ascending: true });
  if (!showArchived) {
    coachProfilesQuery = coachProfilesQuery.is('archived_at', null);
  }

  const [{ data: coachProfilesData }, { data: classesData }, { data: checkinsData }, { data: allTierAssignments }] = await Promise.all([
    coachProfilesQuery,
    supabase.from('classes').select('*').order('name', { ascending: true }),
    supabase.from('coach_checkins').select('*').order('checked_in_at', { ascending: false }).limit(200),
    supabase.from('coach_tier_assignments').select('coach_id,tier'),
  ]);

  const coachProfiles = (coachProfilesData ?? []) as Array<Record<string, any>>;
  const classes = (classesData ?? []) as Array<Record<string, any>>;
  const checkins = (checkinsData ?? []) as Array<Record<string, any>>;

  const coachIds = coachProfiles.map((row: any) => row.coach_id);
  const profileMap = await getProfileMap(supabase, coachIds);
  const tiersByCoach = new Map<string, string[]>();
  for (const assignment of (allTierAssignments ?? []) as Array<{ coach_id: string; tier: string }>) {
    const list = tiersByCoach.get(assignment.coach_id) ?? [];
    list.push(assignment.tier);
    tiersByCoach.set(assignment.coach_id, list);
  }
  const classMap = Object.fromEntries(classes.map((classRow: any) => [classRow.id, classRow]));

  const classesByCoach = new Map<string, any[]>();
  for (const classRow of classes) {
    const list = classesByCoach.get(classRow.coach_id) ?? [];
    list.push(classRow);
    classesByCoach.set(classRow.coach_id, list);
  }

  const checkinsByCoach = new Map<string, any[]>();
  for (const checkin of checkins) {
    const list = checkinsByCoach.get(checkin.coach_id) ?? [];
    list.push(checkin);
    checkinsByCoach.set(checkin.coach_id, list);
  }

  return (
    <div className="space-y-6">
      <FlashBanners
        searchParams={params}
        successMessages={{
          saved: 'Coach updated.',
          archived: 'Coach archived. They are hidden from assignment dropdowns until you restore.',
          unarchived: 'Coach restored.',
        }}
        errorMessages={{
          missing_record: 'Coach not found.',
          invalid_rate: 'Hourly rate must be a positive number.',
          save_failed: 'Could not save the coach. Please try again.',
          archive_failed: 'Could not archive the coach. Please try again.',
          unarchive_failed: 'Could not restore the coach. Please try again.',
        }}
      />
      <SectionCard title="Coaches and TAs" description="Assignments, tier, and check-in history.">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warm-200 dark:border-navy-600/70 bg-warm-50/50 dark:bg-navy-900/40 px-3 py-2 text-sm">
          <span className="text-charcoal/70 dark:text-navy-300">
            {showArchived
              ? 'Showing active and archived coaches. Archived coaches are marked.'
              : 'Showing active coaches only. Archived coaches keep their profile, but are hidden from assignment dropdowns.'}
          </span>
          <a
            href={showArchived ? '/portal/admin/coaches' : '/portal/admin/coaches?show_archived=1'}
            className="rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-1.5 text-xs font-semibold text-charcoal/85 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700"
          >
            {showArchived ? 'Hide archived' : 'Show archived coaches'}
          </a>
        </div>
        <div className="space-y-4">
          {coachProfiles.map((coachProfile: any) => {
            const profile = profileMap[coachProfile.coach_id];
            const assignedClasses = classesByCoach.get(coachProfile.coach_id) ?? [];
            const coachCheckins = checkinsByCoach.get(coachProfile.coach_id) ?? [];

            const isArchived = Boolean(coachProfile.archived_at);
            return (
              <article
                key={coachProfile.coach_id}
                className={`rounded-xl border p-4 ${
                  isArchived
                    ? 'border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-navy-800 dark:text-white">
                      {profile?.display_name || profile?.email || coachProfile.coach_id}
                    </h3>
                    <p className="text-sm text-charcoal/65 dark:text-navy-300">
                      {profile?.email} -{' '}
                      {coachProfile.is_ta
                        ? 'TA'
                        : `Coach (${(tiersByCoach.get(coachProfile.coach_id) ?? [])
                            .map((tier) => formatTierLabel(tier))
                            .join(', ') || 'No tiers'})`}
                    </p>
                    {isArchived ? (
                      <p className="mt-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                        Archived on {new Date(coachProfile.archived_at).toLocaleDateString()}. Hidden from assignment dropdowns.
                      </p>
                    ) : null}
                    <p className="text-sm mt-2">
                      Assigned classes:{' '}
                      {assignedClasses.length ? assignedClasses.map((classRow) => classRow.name).join(', ') : 'none'}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <form action={updateHourlyRate} className="flex items-end gap-2">
                      <input type="hidden" name="coach_id" value={coachProfile.coach_id} />
                      <label className="text-xs text-charcoal/70 dark:text-navy-300">
                        Hourly rate (CAD)
                        <input
                          name="hourly_rate"
                          type="number"
                          min={0}
                          step="0.01"
                          defaultValue={coachProfile.hourly_rate ?? ''}
                          placeholder="Unset"
                          className="mt-1 block rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-1.5 text-sm"
                        />
                      </label>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-sm font-semibold"
                      >
                        Save
                      </button>
                    </form>
                    <div className="flex items-center gap-2">
                      {isArchived ? (
                        <form action={unarchiveCoachProfile}>
                          <input type="hidden" name="coach_id" value={coachProfile.coach_id} />
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-md border border-violet-400 bg-white dark:border-violet-700 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 text-sm font-semibold"
                          >
                            Restore
                          </button>
                        </form>
                      ) : (
                        <form action={archiveCoachProfile}>
                          <input type="hidden" name="coach_id" value={coachProfile.coach_id} />
                          {showArchived ? <input type="hidden" name="show_archived" value="1" /> : null}
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                          >
                            Archive
                          </button>
                        </form>
                      )}
                      <AdminDeleteUserButton
                        userId={coachProfile.coach_id}
                        displayName={profile?.display_name || profile?.email}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-200 mb-2">Recent check-ins</h4>
                  <div className="space-y-1 text-sm">
                    {coachCheckins.slice(0, 10).map((checkin) => {
                      const classRow = classMap[checkin.class_id];
                      const late =
                        classRow &&
                        isLate(
                          checkin.checked_in_at,
                          checkin.session_date,
                          classRow.schedule_start_time,
                          classRow.timezone
                        );

                      return (
                        <p key={checkin.id}>
                          {formatUtcForUser(checkin.checked_in_at, session.profile.timezone)} -{' '}
                          {classRow?.name || checkin.class_id} -{' '}
                          {late ? (
                            <span className="text-red-700 font-medium">Late</span>
                          ) : (
                            <span className="text-green-700 dark:text-green-400">On time</span>
                          )}
                        </p>
                      );
                    })}
                    {coachCheckins.length === 0 ? (
                      <p className="text-charcoal/70 dark:text-navy-300">No check-ins yet.</p>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
          {coachProfiles.length === 0 ? (
            <p className="text-sm text-charcoal/70 dark:text-navy-300">No coach profiles found.</p>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
