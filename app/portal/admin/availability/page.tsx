export const dynamic = 'force-dynamic';

import AvailabilityCalendar from '@/app/portal/_components/AvailabilityCalendar';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type CoachProfileIdRow = Pick<Database['public']['Tables']['coach_profiles']['Row'], 'coach_id'>;
type AvailabilityRow = Database['public']['Tables']['coach_availability']['Row'];

export default async function AdminAvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ coachId?: string; mode?: string }>;
}) {
  const session = await requireRole(['admin']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const { data: coachProfilesData } = await supabase.from('coach_profiles').select('coach_id').order('coach_id');
  const coachIds = ((coachProfilesData ?? []) as CoachProfileIdRow[]).map((row) => row.coach_id);
  const coachMap = await getProfileMap(supabase, coachIds);

  let query = supabase
    .from('coach_availability')
    .select('*')
    .order('available_date', { ascending: true })
    .order('start_time', { ascending: true });
  if (params.coachId) query = query.eq('coach_id', params.coachId);
  if (params.mode === 'group') query = query.eq('is_group', true);
  if (params.mode === 'private') query = query.eq('is_private', true);

  const { data: slotsData } = await query;
  const slots = ((slotsData ?? []) as AvailabilityRow[]).map((slot) => ({
    ...slot,
    available_date: slot.available_date || '',
    start_time: slot.start_time || '',
    end_time: slot.end_time || '',
    timezone: slot.timezone || 'America/Vancouver',
    coachName: coachMap[slot.coach_id]?.display_name || coachMap[slot.coach_id]?.email || slot.coach_id,
  }));

  return (
    <SectionCard title="Coach Availability" description="Read-only overview of all coach availability slots.">
      <form method="get" className="grid sm:grid-cols-3 gap-3 mb-4">
        <select
          name="coachId"
          defaultValue={params.coachId || ''}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">All coaches</option>
          {coachIds.map((coachId: string) => (
            <option key={coachId} value={coachId}>
              {coachMap[coachId]?.display_name || coachMap[coachId]?.email || coachId}
            </option>
          ))}
        </select>
        <select
          name="mode"
          defaultValue={params.mode || ''}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">All modes</option>
          <option value="group">Group</option>
          <option value="private">Private</option>
        </select>
        <button className="justify-self-start px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
          Apply
        </button>
      </form>

      <AvailabilityCalendar
        slots={slots}
        displayTimezone={session.profile.timezone || 'America/Vancouver'}
      />
    </SectionCard>
  );
}
