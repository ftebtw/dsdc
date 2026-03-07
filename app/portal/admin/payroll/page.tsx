export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { revalidatePath } from 'next/cache';
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

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function createPayrollAdjustment(formData: FormData) {
  'use server';

  const session = await requireRole(['admin']);
  const coachId = String(formData.get('coach_id') || '').trim();
  const adjustmentDate = String(formData.get('adjustment_date') || '').trim();
  const hoursDeltaRaw = String(formData.get('hours_delta') || '').trim();
  const noteRaw = String(formData.get('note') || '').trim();
  const hoursDelta = Number(hoursDeltaRaw);

  if (!coachId || !isValidDate(adjustmentDate) || !Number.isFinite(hoursDelta) || hoursDelta === 0) return;
  if (Math.abs(hoursDelta) > 24) return;

  const supabase = await getSupabaseServerClient();
  await (supabase as any).from('payroll_adjustments').insert({
    coach_id: coachId,
    adjustment_date: adjustmentDate,
    hours_delta: hoursDelta,
    note: noteRaw || null,
    created_by: session.userId,
  });

  revalidatePath('/portal/admin/payroll');
}

async function deletePayrollAdjustment(formData: FormData) {
  'use server';

  await requireRole(['admin']);
  const adjustmentId = String(formData.get('adjustment_id') || '').trim();
  if (!adjustmentId) return;

  const supabase = await getSupabaseServerClient();
  await (supabase as any).from('payroll_adjustments').delete().eq('id', adjustmentId);

  revalidatePath('/portal/admin/payroll');
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
    includeManualAdjustments: true,
  });

  let adjustmentsQuery = (supabase as any)
    .from('payroll_adjustments')
    .select('id,coach_id,adjustment_date,hours_delta,note,created_by,created_at')
    .gte('adjustment_date', range.start)
    .lte('adjustment_date', range.end)
    .order('adjustment_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (params.coachId) adjustmentsQuery = adjustmentsQuery.eq('coach_id', params.coachId);
  const { data: adjustmentsData } = await adjustmentsQuery;
  const adjustments = (adjustmentsData ?? []) as Array<{
    id: string;
    coach_id: string;
    adjustment_date: string;
    hours_delta: number;
    note: string | null;
    created_by: string;
    created_at: string;
  }>;
  const adjustmentPeople = await getProfileMap(
    supabase,
    [...new Set(adjustments.flatMap((row) => [row.coach_id, row.created_by]))]
  );

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
          showAdjustmentColumns
          showPayColumns
          totals={{
            sessions: dataset.totals.sessions,
            totalHours: dataset.totals.totalHours,
            manualAdjustmentHours: dataset.totals.manualAdjustmentHours,
            adjustedHours: dataset.totals.adjustedHours,
            lateCount: dataset.totals.lateCount,
            calculatedPay: dataset.totals.calculatedPay,
          }}
        />
      </SectionCard>

      <SectionCard
        title="Manual Hour Adjustments"
        description="Add or subtract payroll hours for a coach in this date range. Positive adds hours, negative removes hours."
      >
        <form action={createPayrollAdjustment} className="grid lg:grid-cols-6 gap-3 mb-4">
          <label className="text-sm lg:col-span-2">
            Coach
            <select
              name="coach_id"
              defaultValue={params.coachId || ''}
              required
              className="mt-1 block w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            >
              <option value="" disabled>
                Select coach
              </option>
              {coachIds.map((coachId) => (
                <option key={coachId} value={coachId}>
                  {coachMap[coachId]?.display_name || coachMap[coachId]?.email || coachId}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm lg:col-span-1">
            Date
            <input
              type="date"
              name="adjustment_date"
              defaultValue={range.end}
              required
              className="mt-1 block w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            />
          </label>
          <label className="text-sm lg:col-span-1">
            Hours (+/-)
            <input
              type="number"
              name="hours_delta"
              step="0.25"
              min="-24"
              max="24"
              required
              placeholder="e.g. 1.5 or -1"
              className="mt-1 block w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            />
          </label>
          <label className="text-sm lg:col-span-2">
            Note (optional)
            <input
              type="text"
              name="note"
              maxLength={500}
              placeholder="Reason for adjustment"
              className="mt-1 block w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            />
          </label>
          <div className="lg:col-span-6">
            <button className="px-3 py-1.5 rounded-md bg-navy-800 text-white text-sm font-semibold">
              Add Adjustment
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-sm">
            <thead className="bg-warm-100 dark:bg-navy-800">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Coach</th>
                <th className="px-3 py-2 text-right">Hours</th>
                <th className="px-3 py-2 text-left">Note</th>
                <th className="px-3 py-2 text-left">Created by</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.map((row) => (
                <tr key={row.id} className="border-t border-warm-200 dark:border-navy-700">
                  <td className="px-3 py-2">{row.adjustment_date}</td>
                  <td className="px-3 py-2">
                    {adjustmentPeople[row.coach_id]?.display_name ||
                      adjustmentPeople[row.coach_id]?.email ||
                      row.coach_id}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {row.hours_delta > 0 ? '+' : ''}
                    {Number(row.hours_delta).toFixed(2)}
                  </td>
                  <td className="px-3 py-2">{row.note || '-'}</td>
                  <td className="px-3 py-2">
                    {adjustmentPeople[row.created_by]?.display_name ||
                      adjustmentPeople[row.created_by]?.email ||
                      row.created_by}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <form action={deletePayrollAdjustment}>
                      <input type="hidden" name="adjustment_id" value={row.id} />
                      <button className="px-2 py-1 rounded-md border border-red-300 text-red-700 text-xs">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-charcoal/65 dark:text-navy-300">
                    No manual adjustments in this range.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
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
