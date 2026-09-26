'use client';

import { useState, type ReactNode } from 'react';
import SectionCard from '@/app/portal/_components/SectionCard';

type Tab = 'weekly' | 'requests' | 'history';

function pill(count: number, tone: 'red' | 'gold') {
  const cls =
    tone === 'red'
      ? 'bg-red-500 text-white'
      : 'bg-gold-300 text-navy-900';
  return count > 0 ? (
    <span
      className={`ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[11px] font-semibold ${cls}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  ) : null;
}

export default function AdminFeedbackTabs({
  pendingRequestsCount,
  pendingWeeklyCount,
  requestsSlot,
  weeklyReviewSlot,
  historySlot,
}: {
  pendingRequestsCount: number;
  pendingWeeklyCount: number;
  requestsSlot: ReactNode;
  weeklyReviewSlot: ReactNode;
  historySlot: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>(
    pendingWeeklyCount > 0
      ? 'weekly'
      : pendingRequestsCount > 0
        ? 'requests'
        : 'weekly'
  );
  return (
    <SectionCard
      title="Feedback"
      description="Review coach-submitted weekly feedback, approve or reject feedback requests, and look up past entries by class or student."
    >
      <div className="mb-4 inline-flex rounded-lg border border-warm-200 dark:border-navy-600/70 bg-white dark:bg-navy-900 p-1">
        <button
          type="button"
          onClick={() => setTab('weekly')}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
            tab === 'weekly'
              ? 'bg-navy-800 text-white dark:bg-gold-300 dark:text-navy-900'
              : 'text-charcoal/70 dark:text-navy-200 hover:text-charcoal'
          }`}
        >
          Weekly feedback review
          {pill(pendingWeeklyCount, 'red')}
        </button>
        <button
          type="button"
          onClick={() => setTab('requests')}
          className={`ml-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
            tab === 'requests'
              ? 'bg-navy-800 text-white dark:bg-gold-300 dark:text-navy-900'
              : 'text-charcoal/70 dark:text-navy-200 hover:text-charcoal'
          }`}
        >
          Feedback requests
          {pill(pendingRequestsCount, 'red')}
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`ml-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
            tab === 'history'
              ? 'bg-navy-800 text-white dark:bg-gold-300 dark:text-navy-900'
              : 'text-charcoal/70 dark:text-navy-200 hover:text-charcoal'
          }`}
        >
          History
        </button>
      </div>
      {tab === 'weekly' ? weeklyReviewSlot : tab === 'requests' ? requestsSlot : historySlot}
    </SectionCard>
  );
}
