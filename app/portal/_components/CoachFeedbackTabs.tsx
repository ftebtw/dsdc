'use client';

import { useState, type ReactNode } from 'react';
import SectionCard from '@/app/portal/_components/SectionCard';

type Tab = 'weekly' | 'requests';

export default function CoachFeedbackTabs({
  requestsSlot,
  weeklySlot,
  initialTab = 'weekly',
}: {
  requestsSlot: ReactNode;
  weeklySlot: ReactNode;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  return (
    <SectionCard
      title="Feedback"
      description="Post weekly class feedback and respond to student or parent feedback requests."
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
          Weekly feedback
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
        </button>
      </div>
      {tab === 'weekly' ? weeklySlot : requestsSlot}
    </SectionCard>
  );
}
