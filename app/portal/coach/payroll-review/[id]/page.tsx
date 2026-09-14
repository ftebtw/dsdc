export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import PayrollReviewForm from '@/app/portal/_components/PayrollReviewForm';
import { requireRole } from '@/lib/portal/auth';
import { fetchPayrollDataset } from '@/lib/portal/payroll';
import { parseYearMonthKey } from '@/lib/portal/payroll-submissions';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function CoachPayrollReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(['coach', 'ta']);
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: submission } = await (supabase as any)
    .from('payroll_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!submission) notFound();
  if (submission.coach_id !== session.userId) redirect('/portal/coach/dashboard');

  const monthLabel = parseYearMonthKey(submission.year_month)?.label ?? submission.year_month;

  // Load the coach's session breakdown for the period so they can see
  // exactly what the computed_hours snapshot is built from.
  const dataset = await fetchPayrollDataset(supabase, {
    start: submission.period_start,
    end: submission.period_end,
    coachId: session.userId,
    includeManualAdjustments: false,
  });

  const { data: existingAdjustments } = await (supabase as any)
    .from('payroll_submission_adjustments')
    .select('id,hours_delta,reason,adjustment_date,created_at')
    .eq('submission_id', id)
    .order('created_at', { ascending: true });

  const isDraft = submission.status === 'draft';

  return (
    <div className="space-y-6">
      <SectionCard
        title={`Verify hours — ${monthLabel}`}
        description={
          isDraft
            ? 'Review your auto-computed hours for the month, add adjustments if needed, then submit to admin.'
            : `Submitted ${submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : ''}. This period is locked; any further changes go through admin.`
        }
      >
        <div className="grid gap-3 sm:grid-cols-3 mb-4">
          <div className="rounded-lg border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-3">
            <p className="text-xs text-charcoal/60 dark:text-navy-300">Computed hours</p>
            <p className="text-2xl font-semibold text-navy-800 dark:text-white">
              {Number(submission.computed_hours).toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-3">
            <p className="text-xs text-charcoal/60 dark:text-navy-300">Adjustments</p>
            <p className="text-2xl font-semibold text-navy-800 dark:text-white">
              {isDraft ? '—' : `${Number(submission.adjustment_hours_total) >= 0 ? '+' : ''}${Number(submission.adjustment_hours_total).toFixed(2)}`}
            </p>
          </div>
          <div className="rounded-lg border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 px-4 py-3">
            <p className="text-xs text-charcoal/60 dark:text-navy-300">Final hours</p>
            <p className="text-2xl font-semibold text-navy-800 dark:text-white">
              {isDraft
                ? Number(submission.computed_hours).toFixed(2)
                : Number(submission.final_hours).toFixed(2)}
            </p>
          </div>
        </div>

        {isDraft ? (
          <PayrollReviewForm
            submissionId={submission.id}
            monthLabel={monthLabel}
            computedHours={Number(submission.computed_hours)}
          />
        ) : (
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
            You submitted this month&apos;s hours. Adjustments below were included in the total sent to admin.
            {existingAdjustments && existingAdjustments.length > 0 ? (
              <ul className="mt-2 list-disc pl-5">
                {(existingAdjustments as Array<{ id: string; hours_delta: number; reason: string }>).map((row) => (
                  <li key={row.id}>
                    {row.hours_delta >= 0 ? '+' : ''}
                    {Number(row.hours_delta).toFixed(2)}h — {row.reason}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1">No adjustments were attached — you approved the computed total as-is.</p>
            )}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Session detail"
        description="Group check-ins and completed private sessions counted for this month."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-warm-100 dark:bg-navy-800">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Class</th>
                <th className="px-3 py-2 text-right">Duration</th>
              </tr>
            </thead>
            <tbody>
              {dataset.sessions.map((row) => (
                <tr key={row.id} className="border-t border-warm-200 dark:border-navy-700">
                  <td className="px-3 py-2">{row.sessionDate}</td>
                  <td className="px-3 py-2">{row.isPrivateSession ? 'Private' : 'Group'}</td>
                  <td className="px-3 py-2">{row.className}</td>
                  <td className="px-3 py-2 text-right">{row.durationHours.toFixed(2)}</td>
                </tr>
              ))}
              {dataset.sessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-charcoal/65 dark:text-navy-300">
                    No sessions counted for this month.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-charcoal/60 dark:text-navy-300">
          <Link href="/portal/coach/hours" className="underline">
            Open My Hours
          </Link>{' '}
          for a broader breakdown across custom date ranges.
        </p>
      </SectionCard>
    </div>
  );
}
