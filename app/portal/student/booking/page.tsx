import SectionCard from '@/app/portal/_components/SectionCard';
import StudentBookingManager from '@/app/portal/_components/StudentBookingManager';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { formatSessionRangeForViewer } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function StudentBookingPage() {
  const session = await requireRole(['student']);
  const supabase = await getSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);

  const [availabilityRaw, sessionRaw] = await Promise.all([
    supabase
      .from('coach_availability')
      .select('*')
      .eq('is_private', true)
      .gte('available_date', today)
      .order('available_date', { ascending: true })
      .order('start_time', { ascending: true }),
    supabase
      .from('private_sessions')
      .select('*')
      .eq('student_id', session.userId)
      .order('requested_date', { ascending: true })
      .order('requested_start_time', { ascending: true }),
  ]);

  const availability = (availabilityRaw.data ?? []) as Array<Record<string, any>>;
  const sessions = (sessionRaw.data ?? []) as Array<Record<string, any>>;

  const coachIds = [...new Set([...availability.map((slot: any) => slot.coach_id), ...sessions.map((row: any) => row.coach_id)])];
  const coachMap = await getProfileMap(supabase, coachIds);

  const availableSlots = availability.map((slot: any) => ({
    id: slot.id,
    coachName: coachMap[slot.coach_id]?.display_name || coachMap[slot.coach_id]?.email || slot.coach_id,
    whenText: formatSessionRangeForViewer(
      slot.available_date,
      slot.start_time,
      slot.end_time,
      slot.timezone,
      session.profile.timezone
    ),
  }));

  const sessionItems = sessions.map((row: any) => ({
    ...row,
    coachName: coachMap[row.coach_id]?.display_name || coachMap[row.coach_id]?.email || row.coach_id,
    studentName: session.profile.display_name || session.profile.email,
    whenText: formatSessionRangeForViewer(
      row.requested_date,
      row.requested_start_time,
      row.requested_end_time,
      row.timezone,
      session.profile.timezone
    ),
    canCancel: row.status === 'pending',
    canConfirm: false,
    canComplete: false,
  }));

  return (
    <SectionCard
      title="Book Private Session"
      description="View coach private availability and request a private session."
    >
      <StudentBookingManager availableSlots={availableSlots} sessions={sessionItems} />
    </SectionCard>
  );
}
