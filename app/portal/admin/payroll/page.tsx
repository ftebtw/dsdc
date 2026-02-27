export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import PayrollTable from '@/app/portal/_components/PayrollTable';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { fetchPayrollDataset, parsePayrollDateRange } from '@/lib/portal/payroll';
import { formatUtcForUser } from '@/lib/portal/time';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseServerClient } from '@/lib/supabase/server';

function currentMonthRange() {
  const now = new Date();
  const start = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
  const end = now.toISOString().slice(0, 10);
  return { start, end };
}

function lastMonthRange() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const firstCurrent = new Date(Date.UTC(year, month, 1));
  const firstLast = new Date(Date.UTC(year, month - 1, 1));
  const lastLast = new Date(firstCurrent.getTime() - 24 * 60 * 60 * 1000);
  return {
    start: firstLast.toISOString().slice(0, 10),
    end: lastLast.toISOString().slice(0, 10),
  };
}

export default async function AdminPayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; coachId?: string; preset?: string }>;
}) {
  const session = await requireRole(['admin']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  let presetRange: { start: string; end: string } | null = null;
  if (params.preset === 'lastMonth') presetRange = lastMonthRange();
  if (params.preset === 'thisMonth') presetRange = currentMonthRange();

  let range;
  try {
    range = parsePayrollDateRange({
      start: params.start || presetRange?.start,
      end: params.end || presetRange?.end,
    });
  } catch (error) {
    console.error("[admin-payroll] error:", error);
    range = parsePayrollDateRange({});
  }

  const [{ data: coachProfilesData }, { data: termsData }] = await Promise.all([
    supabase.from('coach_profiles').select('coach_id').order('created_at', { ascending: true }),
    supabase.from('terms').select('id,name,start_date,end_date').eq('is_active', true).limit(1),
  ]);
  const coachIds = [
    ...new Set(((coachProfilesData ?? []) as Array<{ coach_id: string }>).map((row) => row.coach_id)),
  ];
  const coachMap = await getProfileMap(supabase, coachIds);
  type ActiveTermRow = Pick<Database['public']['Tables']['terms']['Row'], 'id' | 'name' | 'start_date' | 'end_date'>;
  const activeTerm = ((termsData ?? []) as ActiveTermRow[])[0];

  if (params.preset === 'thisTerm' && activeTerm) {
    range = { start: activeTerm.start_date, end: activeTerm.end_date };
  }

  const dataset = await fetchPayrollDataset(supabase, {
    start: range.start,
    end: range.end,
    coachId: params.coachId || undefined,
  });

  const exportHref = `/api/portal/payroll/export?start=${encodeURIComponent(range.start)}&end=${encodeURIComponent(
    range.end
  )}${params.coachId ? `&coachId=${encodeURIComponent(params.coachId)}` : ''}`;

  return (
    <div className="space-y-6">
      <SectionCard title="Payroll" description="Hours are calculated from class schedule duration when checked in.">
        <form method="get" className="grid lg:grid-cols-6 gap-3 mb-4">
          <label className="text-sm lg:col-span-1">
            Start date
            <input
              type="date"
              name="start"
              defaultValue={range.start}
              className="mt-1 block w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            />
          </label>
          <label className="text-sm lg:col-span-1">
            End date
            <input
              type="date"
              name="end"
              defaultValue={range.end}
              className="mt-1 block w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            />
          </label>
          <label className="text-sm lg:col-span-2">
            Coach
            <select
              name="coachId"
              defaultValue={params.coachId || ''}
              className="mt-1 block w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            >
              <option value="">All coaches</option>
              {coachIds.map((coachId) => (
                <option key={coachId} value={coachId}>
                  {coachMap[coachId]?.display_name || coachMap[coachId]?.email || coachId}
                </option>
              ))}
            </select>
          </label>
          <div className="lg:col-span-2 flex flex-wrap items-end gap-2">
            <button className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
              Apply
            </button>
            <Link
              href={`?preset=thisMonth${params.coachId ? `&coachId=${encodeURIComponent(params.coachId)}` : ''}`}
              className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
            >
              This month
            </Link>
            <Link
              href={`?preset=lastMonth${params.coachId ? `&coachId=${encodeURIComponent(params.coachId)}` : ''}`}
              className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
            >
              Last month
            </Link>
            {activeTerm ? (
              <Link
                href={`?preset=thisTerm${params.coachId ? `&coachId=${encodeURIComponent(params.coachId)}` : ''}`}
                className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
              >
                This term
              </Link>
            ) : null}
            <a
              href={exportHref}
              className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-sm font-semibold"
            >
              Export CSV
            </a>
          </div>
        </form>

        <PayrollTable
          rows={dataset.summary}
          showPayColumns
          totals={{
            sessions: dataset.totals.sessions,
            totalHours: dataset.totals.totalHours,
            lateCount: dataset.totals.lateCount,
            calculatedPay: dataset.totals.calculatedPay,
          }}
        />
      </SectionCard>

      {params.coachId ? (
        <SectionCard title="Coach Session Detail" description="Group check-ins and completed private sessions in this date range.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-warm-100 dark:bg-navy-800">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Class</th>
                  <th className="px-3 py-2 text-left">Checked in</th>
                  <th className="px-3 py-2 text-left">Class time</th>
                  <th className="px-3 py-2 text-right">Hours</th>
                  <th className="px-3 py-2 text-right">Late</th>
                </tr>
              </thead>
              <tbody>
                {dataset.sessions.map((row) => (
                  <tr key={row.id} className="border-t border-warm-200 dark:border-navy-700">
                    <td className="px-3 py-2">{row.sessionDate}</td>
                    <td className="px-3 py-2">{row.isPrivateSession ? 'Private' : 'Group'}</td>
                    <td className="px-3 py-2">{row.className}</td>
                    <td className="px-3 py-2">{formatUtcForUser(row.checkedInAt, session.profile.timezone)}</td>
                    <td className="px-3 py-2">
                      {row.classStartTime.slice(0, 5)}-{row.classEndTime.slice(0, 5)} ({row.classTimezone})
                    </td>
                    <td className="px-3 py-2 text-right">{row.durationHours.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">
                      {row.late ? <span className="text-red-700">Late</span> : <span className="text-green-700">On time</span>}
                    </td>
                  </tr>
                ))}
                {dataset.sessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-charcoal/65 dark:text-navy-300">
                      No sessions for this coach in selected range.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
