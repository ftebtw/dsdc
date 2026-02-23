export const dynamic = 'force-dynamic';

import PrivateSessionsManager from '@/app/portal/_components/PrivateSessionsManager';
import SectionCard from '@/app/portal/_components/SectionCard';
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

export default async function CoachPrivateSessionsPage() {
  const session = await requireRole(['coach', 'ta']);
  const supabase = await getSupabaseServerClient();

  const { data: sessionsData } = await supabase
    .from('private_sessions')
    .select('*')
    .eq('coach_id', session.userId)
    .order('requested_date', { ascending: true })
    .order('requested_start_time', { ascending: true });
  const sessions = (sessionsData ?? []) as Array<Record<string, any>>;

  const profileMap = await getProfileMap(
    supabase,
    [
      ...new Set([
        ...sessions.map((row: any) => row.student_id),
        ...sessions.map((row: any) => row.proposed_by).filter(Boolean),
      ]),
    ]
  );

  const items = sessions.map((row: any) => {
    const status = String(row.status || 'pending');
    return {
      ...row,
      coachName: session.profile.display_name || session.profile.email,
      studentName: profileMap[row.student_id]?.display_name || profileMap[row.student_id]?.email || row.student_id,
      proposedByName: row.proposed_by
        ? profileMap[row.proposed_by]?.display_name || profileMap[row.proposed_by]?.email || row.proposed_by
        : null,
      whenText: formatSessionRangeForViewer(
        row.requested_date,
        row.requested_start_time,
        row.requested_end_time,
        row.timezone,
        session.profile.timezone
      ),
      step: stepForStatus(status),
      canAccept: status === 'pending',
      canReject: ['pending', 'rescheduled_by_student', 'rescheduled_by_coach'].includes(status),
      canReschedule: ['pending', 'rescheduled_by_student'].includes(status),
      canAcceptReschedule: status === 'rescheduled_by_student',
      canApprove: false,
      canPay: false,
      canCancel: status === 'rescheduled_by_coach',
      canComplete: status === 'confirmed',
    };
  });

  return (
    <SectionCard title="Private Sessions" description="Review and manage private session requests assigned to you.">
      <PrivateSessionsManager sessions={items} viewerRole="coach" />
    </SectionCard>
  );
}
