import type { PayrollSummaryRow } from '@/lib/portal/payroll';

type Props = {
  rows: PayrollSummaryRow[];
  showPayColumns?: boolean;
  totals?: {
    sessions: number;
    totalHours: number;
    lateCount: number;
    calculatedPay?: number;
  };
};

function formatMoney(value: number | null | undefined): string {
  if (value == null) return '—';
  return `$${value.toFixed(2)}`;
}

export default function PayrollTable({ rows, showPayColumns = true, totals }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-warm-200 dark:border-navy-600">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-warm-100 dark:bg-navy-800">
          <tr>
            <th className="px-3 py-2 text-left">Coach</th>
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Tier</th>
            <th className="px-3 py-2 text-right">Sessions</th>
            <th className="px-3 py-2 text-right">Hours</th>
            <th className="px-3 py-2 text-right">Late</th>
            {showPayColumns ? <th className="px-3 py-2 text-right">Hourly rate</th> : null}
            {showPayColumns ? <th className="px-3 py-2 text-right">Calculated pay</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.coachId} className="border-t border-warm-200 dark:border-navy-700">
              <td className="px-3 py-2">{row.coachName}</td>
              <td className="px-3 py-2">{row.coachEmail}</td>
              <td className="px-3 py-2">{row.coachTier}{row.isTa ? ' (TA)' : ''}</td>
              <td className="px-3 py-2 text-right">{row.sessions}</td>
              <td className="px-3 py-2 text-right">{row.totalHours.toFixed(2)}</td>
              <td className="px-3 py-2 text-right">{row.lateCount}</td>
              {showPayColumns ? <td className="px-3 py-2 text-right">{formatMoney(row.hourlyRate)}</td> : null}
              {showPayColumns ? <td className="px-3 py-2 text-right">{formatMoney(row.calculatedPay)}</td> : null}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={showPayColumns ? 8 : 6}
                className="px-3 py-4 text-center text-charcoal/65 dark:text-navy-300"
              >
                No payroll data for this range.
              </td>
            </tr>
          ) : null}
        </tbody>
        {totals ? (
          <tfoot className="bg-warm-100 dark:bg-navy-800 border-t border-warm-200 dark:border-navy-700">
            <tr>
              <td className="px-3 py-2 font-semibold" colSpan={3}>
                Totals
              </td>
              <td className="px-3 py-2 text-right font-semibold">{totals.sessions}</td>
              <td className="px-3 py-2 text-right font-semibold">{totals.totalHours.toFixed(2)}</td>
              <td className="px-3 py-2 text-right font-semibold">{totals.lateCount}</td>
              {showPayColumns ? <td className="px-3 py-2" /> : null}
              {showPayColumns ? (
                <td className="px-3 py-2 text-right font-semibold">{formatMoney(totals.calculatedPay ?? null)}</td>
              ) : null}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
