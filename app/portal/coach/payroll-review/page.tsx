export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { parseYearMonthKey } from '@/lib/portal/payroll-submissions';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function CoachPayrollReviewIndexPage() {
  const session = await requireRole(['coach', 'ta']);
  const supabase = await getSupabaseServerClient();

  const { data: submissions } = await (supabase as any)
    .from('payroll_submissions')
    .select('id,year_month,computed_hours,final_hours,adjustment_hours_total,status,submitted_at')
    .eq('coach_id', session.userId)
    .order('year_month', { ascending: false });

  const rows = (submissions ?? []) as Array<{
    id: string;
    year_month: string;
    computed_hours: number;
    final_hours: number;
    adjustment_hours_total: number;
    status: 'draft' | 'submitted';
    submitted_at: string | null;
  }>;

  return (
    <SectionCard
      title="Payroll review"
      description="Verify your paid hours each month. Drafts appear here on the 1st of every month."
    >
      {rows.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          No payroll periods yet. New drafts are created automatically on the 1st of every month.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-warm-100 dark:bg-navy-800">
              <tr>
                <th className="px-3 py-2 text-left">Month</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Computed</th>
                <th className="px-3 py-2 text-right">Adjustments</th>
                <th className="px-3 py-2 text-right">Final</th>
                <th className="px-3 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const label = parseYearMonthKey(row.year_month)?.label ?? row.year_month;
                const isDraft = row.status === 'draft';
                return (
                  <tr key={row.id} className="border-t border-warm-200 dark:border-navy-700">
                    <td className="px-3 py-2 font-medium text-navy-800 dark:text-white">{label}</td>
                    <td className="px-3 py-2">
                      {isDraft ? (
                        <span className="inline-flex items-center rounded-full bg-gold-100 text-navy-900 px-2 py-0.5 text-xs font-medium">
                          Draft — action needed
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 px-2 py-0.5 text-xs font-medium">
                          Submitted
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">{Number(row.computed_hours).toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">
                      {isDraft
                        ? '—'
                        : `${Number(row.adjustment_hours_total) >= 0 ? '+' : ''}${Number(row.adjustment_hours_total).toFixed(2)}`}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {isDraft
                        ? Number(row.computed_hours).toFixed(2)
                        : Number(row.final_hours).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/portal/coach/payroll-review/${row.id}`}
                        className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-xs"
                      >
                        {isDraft ? 'Review' : 'View'}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
