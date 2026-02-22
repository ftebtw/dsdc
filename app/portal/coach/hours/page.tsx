import SectionCard from '@/app/portal/_components/SectionCard';
import PayrollTable from '@/app/portal/_components/PayrollTable';
import { requireRole } from '@/lib/portal/auth';
import { fetchPayrollDataset, parsePayrollDateRange } from '@/lib/portal/payroll';
import { formatUtcForUser } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function CoachHoursPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const session = await requireRole(['coach', 'ta']);
  const supabase = await getSupabaseServerClient();
  const params = await searchParams;

  let range;
  try {
    range = parsePayrollDateRange({ start: params.start, end: params.end });
  } catch {
    range = parsePayrollDateRange({});
  }

  const dataset = await fetchPayrollDataset(supabase, {
    start: range.start,
    end: range.end,
    coachId: session.userId,
  });
  const summary = dataset.summary[0] ?? null;

  return (
    <div className="space-y-6">
      <SectionCard title="My Hours" description="Hours are credited by class schedule duration when checked in.">
        <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Start date
            <input
              type="date"
              name="start"
              defaultValue={range.start}
              className="mt-1 block rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            End date
            <input
              type="date"
              name="end"
              defaultValue={range.end}
              className="mt-1 block rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            />
          </label>
          <button className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
            Apply
          </button>
        </form>

        <PayrollTable
          rows={summary ? [summary] : []}
          showPayColumns={false}
          totals={{
            sessions: summary?.sessions ?? 0,
            totalHours: summary?.totalHours ?? 0,
            lateCount: summary?.lateCount ?? 0,
          }}
        />
      </SectionCard>

      <SectionCard title="Session Detail" description="Group check-ins and completed private sessions in selected date range.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-warm-100 dark:bg-navy-800">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Class</th>
                <th className="px-3 py-2 text-left">Checked in</th>
                <th className="px-3 py-2 text-left">Class time</th>
                <th className="px-3 py-2 text-right">Duration</th>
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
                    No sessions found in this range.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
