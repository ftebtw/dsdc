import PrivateSessionsManager from '@/app/portal/_components/PrivateSessionsManager';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { formatSessionRangeForViewer } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';

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

  const studentMap = await getProfileMap(
    supabase,
    [...new Set(sessions.map((row: any) => row.student_id))]
  );

  const items = sessions.map((row: any) => ({
    ...row,
    coachName: session.profile.display_name || session.profile.email,
    studentName: studentMap[row.student_id]?.display_name || studentMap[row.student_id]?.email || row.student_id,
    whenText: formatSessionRangeForViewer(
      row.requested_date,
      row.requested_start_time,
      row.requested_end_time,
      row.timezone,
      session.profile.timezone
    ),
    canConfirm: row.status === 'pending',
    canCancel: row.status === 'pending' || row.status === 'confirmed',
    canComplete: row.status === 'confirmed',
  }));

  return (
    <SectionCard title="Private Sessions" description="Review and manage private session requests assigned to you.">
      <PrivateSessionsManager sessions={items} />
    </SectionCard>
  );
}
