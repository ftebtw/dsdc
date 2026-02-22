import PrivateSessionsManager from '@/app/portal/_components/PrivateSessionsManager';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { formatSessionRangeForViewer } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminPrivateSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; coachId?: string; studentId?: string }>;
}) {
  await requireRole(['admin']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from('private_sessions')
    .select('*')
    .order('requested_date', { ascending: true })
    .order('requested_start_time', { ascending: true });
  if (params.status) query = query.eq('status', params.status);
  if (params.coachId) query = query.eq('coach_id', params.coachId);
  if (params.studentId) query = query.eq('student_id', params.studentId);

  const { data: rowsData } = await query;
  const rows = (rowsData ?? []) as any[];
  const ids = [...new Set([...rows.map((row: any) => row.coach_id), ...rows.map((row: any) => row.student_id)])];
  const people = await getProfileMap(supabase, ids);
  const coaches = ids.filter((id) => people[id]?.role === 'coach' || people[id]?.role === 'ta');
  const students = ids.filter((id) => people[id]?.role === 'student');

  const items = rows.map((row: any) => ({
    ...row,
    coachName: people[row.coach_id]?.display_name || people[row.coach_id]?.email || row.coach_id,
    studentName: people[row.student_id]?.display_name || people[row.student_id]?.email || row.student_id,
    whenText: formatSessionRangeForViewer(
      row.requested_date,
      row.requested_start_time,
      row.requested_end_time,
      row.timezone,
      'America/Vancouver'
    ),
    canConfirm: row.status === 'pending',
    canCancel: row.status === 'pending' || row.status === 'confirmed',
    canComplete: row.status === 'confirmed',
  }));

  return (
    <SectionCard title="Private Sessions" description="Admin controls for all private session requests.">
      <form method="get" className="grid sm:grid-cols-4 gap-3 mb-4">
        <select
          name="status"
          defaultValue={params.status || ''}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <select
          name="coachId"
          defaultValue={params.coachId || ''}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">All coaches</option>
          {coaches.map((coachId) => (
            <option key={coachId} value={coachId}>
              {people[coachId]?.display_name || people[coachId]?.email || coachId}
            </option>
          ))}
        </select>
        <select
          name="studentId"
          defaultValue={params.studentId || ''}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">All students</option>
          {students.map((studentId) => (
            <option key={studentId} value={studentId}>
              {people[studentId]?.display_name || people[studentId]?.email || studentId}
            </option>
          ))}
        </select>
        <button className="justify-self-start px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
          Apply
        </button>
      </form>
      <PrivateSessionsManager sessions={items} />
    </SectionCard>
  );
}
