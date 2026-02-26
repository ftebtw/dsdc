export const dynamic = 'force-dynamic';

import PrivateSessionsManager from '@/app/portal/_components/PrivateSessionsManager';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { portalT } from '@/lib/portal/parent-i18n';
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

export default async function AdminPrivateSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; coachId?: string; studentId?: string }>;
}) {
  const session = await requireRole(['admin']);
  const locale = (session.profile.locale === 'zh' ? 'zh' : 'en') as 'en' | 'zh';
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  const selectedStatus = params.status === 'needs_action' ? 'coach_accepted' : params.status || '';

  let query = supabase
    .from('private_sessions')
    .select('*')
    .order('requested_date', { ascending: true })
    .order('requested_start_time', { ascending: true });

  if (selectedStatus) query = query.eq('status', selectedStatus);
  if (params.coachId) query = query.eq('coach_id', params.coachId);
  if (params.studentId) query = query.eq('student_id', params.studentId);

  const { data: rowsData } = await query;
  const rows = (rowsData ?? []) as Array<Record<string, any>>;

  const ids = [
    ...new Set([
      ...rows.map((row: any) => row.coach_id),
      ...rows.map((row: any) => row.student_id),
      ...rows.map((row: any) => row.proposed_by).filter(Boolean),
      ...rows.map((row: any) => row.cancelled_by).filter(Boolean),
    ]),
  ];
  const people = await getProfileMap(supabase, ids);
  const coaches = ids.filter((id) => people[id]?.role === 'coach' || people[id]?.role === 'ta');
  const students = ids.filter((id) => people[id]?.role === 'student');

  const items = rows.map((row: any) => {
    const status = String(row.status || 'pending');

    return {
      ...row,
      coachName: people[row.coach_id]?.display_name || people[row.coach_id]?.email || row.coach_id,
      studentName: people[row.student_id]?.display_name || people[row.student_id]?.email || row.student_id,
      proposedByName: row.proposed_by
        ? people[row.proposed_by]?.display_name || people[row.proposed_by]?.email || row.proposed_by
        : null,
      whenText: (() => {
        try {
          return formatSessionRangeForViewer(
            row.requested_date,
            row.requested_start_time,
            row.requested_end_time,
            row.timezone,
            session.profile.timezone
          );
        } catch {
          return `${row.requested_date ?? '?'} ${(row.requested_start_time ?? '').slice(0, 5)}-${(row.requested_end_time ?? '').slice(0, 5)}`;
        }
      })(),
      step: stepForStatus(status),
      canAccept: status === 'pending',
      canReject: ['pending', 'coach_accepted', 'rescheduled_by_coach', 'rescheduled_by_student'].includes(status),
      canReschedule: ['pending', 'coach_accepted', 'rescheduled_by_coach', 'rescheduled_by_student'].includes(status),
      canAcceptReschedule: ['rescheduled_by_coach', 'rescheduled_by_student'].includes(status),
      canApprove: status === 'coach_accepted' || status === 'awaiting_payment',
      canPay: false,
      canCancel: ['pending', 'coach_accepted', 'rescheduled_by_coach', 'rescheduled_by_student', 'awaiting_payment', 'confirmed'].includes(status),
      canComplete: status === 'confirmed',
      coach_notes:
        status === 'cancelled' && row.cancelled_by
          ? `${row.coach_notes || ''}${row.coach_notes ? ' | ' : ''}Cancelled by ${people[row.cancelled_by]?.display_name || people[row.cancelled_by]?.email || row.cancelled_by}`
          : row.coach_notes,
    };
  });

  return (
    <SectionCard
      title={t('portal.privateSessions.title', 'Private Sessions')}
      description={t(
        'portal.privateSessions.adminDesc',
        'Admin workflow: coach review, approval, payment, completion.'
      )}
    >
      <form method="get" className="grid sm:grid-cols-4 gap-3 mb-4">
        <select
          name="status"
          defaultValue={params.status || ''}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="needs_action">Needs My Action (Coach Accepted)</option>
          <option value="pending">Pending</option>
          <option value="rescheduled_by_coach">Rescheduled by coach</option>
          <option value="rescheduled_by_student">Rescheduled by student</option>
          <option value="coach_accepted">Coach accepted</option>
          <option value="awaiting_payment">Awaiting payment</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
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

      <PrivateSessionsManager sessions={items} viewerRole="admin" locale={locale} />
    </SectionCard>
  );
}
