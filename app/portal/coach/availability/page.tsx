import SectionCard from '@/app/portal/_components/SectionCard';
import CoachAvailabilityManager from '@/app/portal/_components/CoachAvailabilityManager';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function CoachAvailabilityPage() {
  const session = await requireRole(['coach', 'ta']);
  const supabase = await getSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: slotsData } = await supabase
    .from('coach_availability')
    .select('*')
    .eq('coach_id', session.userId)
    .gte('available_date', today)
    .order('available_date', { ascending: true })
    .order('start_time', { ascending: true });
  const slots = (slotsData ?? []) as any[];

  return (
    <SectionCard
      title="Availability"
      description="Manage your group/private availability. Times display in your timezone."
    >
      <CoachAvailabilityManager
        initialSlots={slots}
        displayTimezone={session.profile.timezone}
        defaultTimezone={session.profile.timezone}
      />
    </SectionCard>
  );
}
