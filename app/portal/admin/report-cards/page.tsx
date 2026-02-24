export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import ReportCardStatusBadge from '@/app/portal/_components/ReportCardStatusBadge';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { formatUtcForUser } from '@/lib/portal/time';
import { getReportCardLastActivityIso } from '@/lib/portal/report-cards';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

const statusOptions: Database['public']['Enums']['report_card_status'][] = [
  'draft',
  'submitted',
  'approved',
  'rejected',
];

function isReportCardStatus(value: string): value is Database['public']['Enums']['report_card_status'] {
  return statusOptions.includes(value as Database['public']['Enums']['report_card_status']);
}

type ReportCardRow = Database['public']['Tables']['report_cards']['Row'];
type TermNameRow = Pick<Database['public']['Tables']['terms']['Row'], 'id' | 'name'>;
type ClassNameRow = Pick<Database['public']['Tables']['classes']['Row'], 'id' | 'name'>;

export default async function AdminReportCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; termId?: string; classId?: string; coachId?: string }>;
}) {
  const session = await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const params = await searchParams;

  let query = supabase.from('report_cards').select('*').order('created_at', { ascending: false });
  const selectedStatus = params.status || 'submitted';
  if (isReportCardStatus(selectedStatus)) query = query.eq('status', selectedStatus);
  if (params.termId) query = query.eq('term_id', params.termId);
  if (params.classId) query = query.eq('class_id', params.classId);
  if (params.coachId) query = query.eq('written_by', params.coachId);

  const [{ data: rowsData }, { data: termsData }, { data: classesData }, { data: coachProfilesData }] =
    await Promise.all([
      query,
      supabase.from('terms').select('id,name').order('start_date', { ascending: false }),
      supabase.from('classes').select('id,name').order('name', { ascending: true }),
      supabase.from('coach_profiles').select('coach_id'),
    ]);

  const rows = (rowsData ?? []) as ReportCardRow[];
  const terms = (termsData ?? []) as TermNameRow[];
  const classes = (classesData ?? []) as ClassNameRow[];
  const coachIds = [
    ...new Set(((coachProfilesData ?? []) as Array<{ coach_id: string }>).map((row) => row.coach_id)),
  ];

  const profileIds = [
    ...coachIds,
    ...rows.map((row) => row.student_id),
    ...rows.map((row) => row.written_by),
    ...rows.map((row) => row.reviewed_by).filter((value): value is string => Boolean(value)),
  ];
  const profileMap = await getProfileMap(supabase, profileIds);
  const classMap = Object.fromEntries(classes.map((row) => [row.id, row.name]));
  const termMap = Object.fromEntries(terms.map((row) => [row.id, row.name]));

  return (
    <SectionCard
      title="Report Cards"
      description="Review submitted report cards and inspect historical status across terms."
    >
      <form method="get" className="mb-4 grid sm:grid-cols-5 gap-3">
        <select
          name="status"
          defaultValue={selectedStatus}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="submitted">Queue (submitted)</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          name="termId"
          defaultValue={params.termId || ''}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">All terms</option>
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </select>
        <select
          name="classId"
          defaultValue={params.classId || ''}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">All classes</option>
          {classes.map((classRow) => (
            <option key={classRow.id} value={classRow.id}>
              {classRow.name}
            </option>
          ))}
        </select>
        <select
          name="coachId"
          defaultValue={params.coachId || ''}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">All coaches</option>
          {coachIds.map((coachId) => (
            <option key={coachId} value={coachId}>
              {profileMap[coachId]?.display_name || profileMap[coachId]?.email || coachId}
            </option>
          ))}
        </select>
        <button className="justify-self-start px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
          Apply
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-warm-200 dark:border-navy-600">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-warm-100 dark:bg-navy-800">
            <tr>
              <th className="px-3 py-2 text-left">Student</th>
              <th className="px-3 py-2 text-left">Class</th>
              <th className="px-3 py-2 text-left">Term</th>
              <th className="px-3 py-2 text-left">Coach</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Last activity</th>
              <th className="px-3 py-2 text-left">Reviewer</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-warm-200 dark:border-navy-700">
                <td className="px-3 py-2">
                  {profileMap[row.student_id]?.display_name || profileMap[row.student_id]?.email || row.student_id}
                </td>
                <td className="px-3 py-2">{classMap[row.class_id] || row.class_id}</td>
                <td className="px-3 py-2">{termMap[row.term_id] || row.term_id}</td>
                <td className="px-3 py-2">
                  {row.written_by
                    ? profileMap[row.written_by]?.display_name || profileMap[row.written_by]?.email || row.written_by
                    : 'Unknown'}
                </td>
                <td className="px-3 py-2">
                  <ReportCardStatusBadge status={row.status} />
                </td>
                <td className="px-3 py-2">
                  {formatUtcForUser(getReportCardLastActivityIso(row), session.profile.timezone)}
                </td>
                <td className="px-3 py-2">
                  {row.reviewed_by
                    ? profileMap[row.reviewed_by]?.display_name || profileMap[row.reviewed_by]?.email || row.reviewed_by
                    : '-'}
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/portal/admin/report-cards/${row.id}`}
                    className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-xs"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-charcoal/65 dark:text-navy-300">
                  No report cards match this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

