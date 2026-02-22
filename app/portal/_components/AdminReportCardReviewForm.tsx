"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminReportCardReviewForm({
  reportCardId,
  canReview,
}: {
  reportCardId: string;
  canReview: boolean;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [loadingAction, setLoadingAction] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canReview) {
      setError('Only submitted report cards can be reviewed.');
    } else {
      setError(null);
    }
  }, [canReview]);

  async function onApprove() {
    if (!canReview) return;
    setLoadingAction('approve');
    setError(null);
    const response = await fetch(`/api/portal/report-cards/${reportCardId}/approve`, {
      method: 'POST',
    });
    const data = (await response.json()) as { error?: string };
    setLoadingAction(null);
    if (!response.ok) {
      setError(data.error || 'Approve failed.');
      return;
    }
    router.refresh();
  }

  async function onReject() {
    if (!canReview) return;
    if (!notes.trim()) {
      setError('Reviewer notes are required for rejection.');
      return;
    }
    setLoadingAction('reject');
    setError(null);
    const response = await fetch(`/api/portal/report-cards/${reportCardId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerNotes: notes.trim() }),
    });
    const data = (await response.json()) as { error?: string };
    setLoadingAction(null);
    if (!response.ok) {
      setError(data.error || 'Reject failed.');
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onApprove}
          disabled={loadingAction !== null || !canReview}
          className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loadingAction === 'approve' ? 'Approving...' : 'Approve'}
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-navy-700 dark:text-navy-200">Reject with notes</label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm"
          placeholder="Please revise section 2 with more concrete feedback..."
        />
        <button
          type="button"
          onClick={onReject}
          disabled={loadingAction !== null || !canReview}
          className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-semibold disabled:opacity-60"
        >
          {loadingAction === 'reject' ? 'Rejecting...' : 'Reject'}
        </button>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
