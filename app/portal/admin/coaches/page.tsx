import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getProfileMap } from '@/lib/portal/data';
import { formatUtcForUser } from '@/lib/portal/time';
import { fromZonedTime } from 'date-fns-tz';

function isLate(
  checkedInAtIso: string,
  sessionDate: string,
  scheduleStartTime: string,
  timezone: string
): boolean {
  const localStart = `${sessionDate}T${scheduleStartTime}`;
  const scheduledUtc = fromZonedTime(localStart, timezone).getTime();
  const threshold = scheduledUtc + 10 * 60 * 1000;
  return new Date(checkedInAtIso).getTime() > threshold;
}

export default async function AdminCoachesPage() {
  const session = await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();

  const [{ data: coachProfilesData }, { data: classesData }, { data: checkinsData }] = await Promise.all([
    supabase.from('coach_profiles').select('*').order('created_at', { ascending: true }),
    supabase.from('classes').select('*').order('name', { ascending: true }),
    supabase.from('coach_checkins').select('*').order('checked_in_at', { ascending: false }).limit(200),
  ]);
  const coachProfiles = (coachProfilesData ?? []) as any[];
  const classes = (classesData ?? []) as any[];
  const checkins = (checkinsData ?? []) as any[];

  const coachIds = coachProfiles.map((row: any) => row.coach_id);
  const profileMap = await getProfileMap(supabase, coachIds);
  const classMap = Object.fromEntries(classes.map((classRow: any) => [classRow.id, classRow]));

  const classesByCoach = new Map<string, typeof classes>();
  for (const classRow of classes) {
    const list = classesByCoach.get(classRow.coach_id) ?? [];
    list.push(classRow);
    classesByCoach.set(classRow.coach_id, list);
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Coaches and TAs" description="Assignments, tier, and check-in history.">
        <div className="space-y-4">
          {coachProfiles.map((coachProfile: any) => {
            const profile = profileMap[coachProfile.coach_id];
            const assignedClasses = classesByCoach.get(coachProfile.coach_id) ?? [];
            const coachCheckins = checkins.filter((row: any) => row.coach_id === coachProfile.coach_id);
            return (
              <article
                key={coachProfile.coach_id}
                className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-navy-800 dark:text-white">
                      {profile?.display_name || profile?.email || coachProfile.coach_id}
                    </h3>
                    <p className="text-sm text-charcoal/65 dark:text-navy-300">
                      {profile?.email} • tier: {coachProfile.tier} • {coachProfile.is_ta ? 'TA' : 'Coach'}
                    </p>
                    <p className="text-sm mt-2">
                      Assigned classes:{' '}
                      {assignedClasses.length
                        ? assignedClasses.map((classRow) => classRow.name).join(', ')
                        : 'none'}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-200 mb-2">
                    Recent check-ins
                  </h4>
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
                          {formatUtcForUser(checkin.checked_in_at, session.profile.timezone)} •{' '}
                          {classRow?.name || checkin.class_id} •{' '}
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
