'use client';

import Link from 'next/link';

// Shown on every coach portal page when they have an unsubmitted monthly
// payroll draft. Not dismissible: the whole point is that they can't miss it.
export default function PayrollReviewBanner({
  submissionId,
  monthLabel,
  computedHours,
}: {
  submissionId: string;
  monthLabel: string;
  computedHours: number;
}) {
  return (
    <div className="mb-4 rounded-xl border border-gold-400/60 bg-gold-100/80 dark:border-gold-500/40 dark:bg-gold-500/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-navy-900 dark:text-gold-100">
          Verify your hours for {monthLabel}
        </p>
        <p className="text-xs text-charcoal/70 dark:text-navy-200">
          We have {computedHours.toFixed(2)} hour{computedHours === 1 ? '' : 's'} on file. Approve or attach adjustments and submit to admin.
        </p>
      </div>
      <Link
        href={`/portal/coach/payroll-review/${submissionId}`}
        className="px-3 py-1.5 rounded-md bg-navy-800 text-white text-sm font-medium hover:bg-navy-700 dark:bg-gold-300 dark:text-navy-900 dark:hover:bg-gold-200"
      >
        Review now
      </Link>
    </div>
  );
}
