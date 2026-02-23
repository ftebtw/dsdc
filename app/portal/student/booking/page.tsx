export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import StudentBookingManager from '@/app/portal/_components/StudentBookingManager';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { formatSessionRangeForViewer } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';

function stepForStatus(status: string): number {
  if (status === 'pending') return 1;
  if (status === 'rescheduled_by_coach' || status === 'rescheduled_by_student') return 2;
  if (status === 'coach_accepted') return 3;
  if (status === 'awaiting_payment') return 4;
  if (status === 'confirmed') return 5;
  if (status === 'completed') return 6;
  return 1;
}

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

  const coachIds = [
    ...new Set([
      ...availability.map((slot: any) => slot.coach_id),
      ...sessions.map((row: any) => row.coach_id),
      ...sessions.map((row: any) => row.proposed_by).filter(Boolean),
    ]),
  ];
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

  const sessionItems = sessions.map((row: any) => {
    const status = String(row.status || 'pending');
    return {
      ...row,
      coachName: coachMap[row.coach_id]?.display_name || coachMap[row.coach_id]?.email || row.coach_id,
      studentName: session.profile.display_name || session.profile.email,
      proposedByName: row.proposed_by
        ? coachMap[row.proposed_by]?.display_name || coachMap[row.proposed_by]?.email || row.proposed_by
        : null,
      whenText: formatSessionRangeForViewer(
        row.requested_date,
        row.requested_start_time,
        row.requested_end_time,
        row.timezone,
        session.profile.timezone
      ),
      step: stepForStatus(status),
      canAccept: false,
      canReject: false,
      canReschedule: ['pending', 'rescheduled_by_coach'].includes(status),
      canAcceptReschedule: status === 'rescheduled_by_coach',
      canApprove: false,
      canPay: status === 'awaiting_payment',
      canCancel: ['pending', 'rescheduled_by_coach', 'rescheduled_by_student', 'awaiting_payment'].includes(status),
      canComplete: false,
    };
  });

  return (
    <SectionCard
      title="Book Private Session"
      description="View coach private availability and request a private session."
    >
      <StudentBookingManager availableSlots={availableSlots} sessions={sessionItems} />
    </SectionCard>
  );
}
