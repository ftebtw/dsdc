'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type AdjustmentDraft = {
  id: string;
  hoursDelta: string;
  reason: string;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function PayrollReviewForm({
  submissionId,
  monthLabel,
  computedHours,
}: {
  submissionId: string;
  monthLabel: string;
  computedHours: number;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<'approve' | 'adjust'>('approve');
  const [drafts, setDrafts] = useState<AdjustmentDraft[]>([
    { id: makeId(), hoursDelta: '', reason: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedTotal = useMemo(() => {
    if (mode === 'approve') return 0;
    let total = 0;
    for (const draft of drafts) {
      const value = Number(draft.hoursDelta);
      if (Number.isFinite(value)) total += value;
    }
    return Math.round(total * 100) / 100;
  }, [mode, drafts]);

  function updateDraft(id: string, patch: Partial<AdjustmentDraft>) {
    setDrafts((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addDraft() {
    setDrafts((current) => [...current, { id: makeId(), hoursDelta: '', reason: '' }]);
  }

  function removeDraft(id: string) {
    setDrafts((current) => (current.length <= 1 ? current : current.filter((row) => row.id !== id)));
  }

  async function submit() {
    setError(null);
    let adjustments: Array<{ hoursDelta: number; reason: string }> | undefined;

    if (mode === 'adjust') {
      const cleaned: Array<{ hoursDelta: number; reason: string }> = [];
      for (const draft of drafts) {
        const trimmed = draft.reason.trim();
        const hoursDelta = Number(draft.hoursDelta);
        if (!Number.isFinite(hoursDelta) || hoursDelta === 0) {
          setError('Each adjustment needs a non-zero hours amount.');
          return;
        }
        if (trimmed.length < 3) {
          setError('Each adjustment needs a reason (at least 3 characters).');
          return;
        }
        cleaned.push({ hoursDelta, reason: trimmed });
      }
      if (cleaned.length === 0) {
        setError('Add at least one adjustment, or choose Approve as-is.');
        return;
      }
      adjustments = cleaned;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/portal/payroll-submissions/${submissionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit', adjustments }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Could not submit hours.');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit hours.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode('approve')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium ${
            mode === 'approve'
              ? 'bg-emerald-600 text-white'
              : 'border border-warm-300 dark:border-navy-600 text-charcoal/80 dark:text-navy-200'
          }`}
        >
          Approve as-is ({computedHours.toFixed(2)}h)
        </button>
        <button
          type="button"
          onClick={() => setMode('adjust')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium ${
            mode === 'adjust'
              ? 'bg-navy-800 text-white dark:bg-gold-300 dark:text-navy-900'
              : 'border border-warm-300 dark:border-navy-600 text-charcoal/80 dark:text-navy-200'
          }`}
        >
          Add adjustments
        </button>
      </div>

      {mode === 'adjust' ? (
        <div className="space-y-3">
          <p className="text-xs text-charcoal/70 dark:text-navy-300">
            Add one line per adjustment. Positive hours add pay, negative hours reduce it. Reason
            should explain what happened (e.g. &ldquo;covered for Alex on Oct 12&rdquo;).
          </p>
          {drafts.map((draft, index) => (
            <div
              key={draft.id}
              className="rounded-lg border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 px-3 py-3"
            >
              <div className="flex flex-wrap items-end gap-3">
                <label className="text-xs text-charcoal/70 dark:text-navy-200">
                  Hours (± allowed)
                  <input
                    type="number"
                    step="0.25"
                    value={draft.hoursDelta}
                    onChange={(event) => updateDraft(draft.id, { hoursDelta: event.target.value })}
                    className="mt-1 block w-32 rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="flex-1 min-w-[240px] text-xs text-charcoal/70 dark:text-navy-200">
                  Reason
                  <input
                    type="text"
                    value={draft.reason}
                    onChange={(event) => updateDraft(draft.id, { reason: event.target.value })}
                    maxLength={500}
                    placeholder="e.g. covered for Sarah on Oct 12"
                    className="mt-1 block w-full rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-2 py-1.5 text-sm"
                  />
                </label>
                {drafts.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeDraft(draft.id)}
                    className="px-2 py-1.5 rounded-md text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <p className="mt-1 text-[11px] text-charcoal/50 dark:text-navy-400">Line {index + 1}</p>
            </div>
          ))}
          <button
            type="button"
            onClick={addDraft}
            className="text-sm text-navy-700 dark:text-navy-200 underline"
          >
            + Add another adjustment
          </button>
          <p className="text-sm text-charcoal/80 dark:text-navy-200">
            New total: <strong>{(computedHours + parsedTotal).toFixed(2)}</strong> h
            <span className="text-charcoal/60 dark:text-navy-400">
              {' '}
              ({computedHours.toFixed(2)} computed {parsedTotal >= 0 ? '+' : '−'}{' '}
              {Math.abs(parsedTotal).toFixed(2)} adjustments)
            </span>
          </p>
        </div>
      ) : (
        <p className="text-sm text-charcoal/80 dark:text-navy-200">
          You&apos;re approving <strong>{computedHours.toFixed(2)} hours</strong> for {monthLabel} with
          no adjustments. This gets sent straight to admin.
        </p>
      )}

      {error ? (
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="px-4 py-2 rounded-md bg-gold-300 text-navy-900 font-semibold disabled:opacity-60"
      >
        {submitting
          ? 'Submitting…'
          : mode === 'approve'
            ? 'Approve and send to admin'
            : 'Submit adjustments to admin'}
      </button>
    </div>
  );
}
