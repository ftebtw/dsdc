'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type AdminWeeklyFeedbackEntry = {
  id: string;
  classId: string;
  className: string;
  coachId: string;
  coachName: string;
  sessionDate: string;
  generalFeedback: string;
  individual: Array<{ studentId: string; studentName: string; feedback: string }>;
  status: 'pending_admin' | 'approved' | 'rejected';
  reviewedAt: string | null;
  rejectionNotes: string | null;
  updatedAt: string;
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map((s) => parseInt(s, 10));
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function AdminWeeklyFeedbackReview({
  initialEntries,
}: {
  initialEntries: AdminWeeklyFeedbackEntry[];
}) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  async function review(id: string, action: 'approve' | 'reject', notes?: string) {
    setError(null);
    setBusyId(id);
    try {
      const response = await fetch(`/api/portal/class-feedback/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Review failed.');
      }
      // Drop the row from the pending queue in-place.
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setRejectFor(null);
      setRejectNotes('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed.');
    } finally {
      setBusyId(null);
    }
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-charcoal/70 dark:text-navy-300">
        No weekly feedback waiting for review. Coach submissions land here after they hit
        Submit.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-700 dark:text-red-300">{error}</p> : null}
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4"
        >
          <header className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h3 className="font-semibold text-navy-800 dark:text-white">{entry.className}</h3>
              <p className="text-xs text-charcoal/60 dark:text-navy-300">
                Coach: {entry.coachName} · Session: {formatDate(entry.sessionDate)} · Submitted{' '}
                {new Date(entry.updatedAt).toLocaleString()}
              </p>
            </div>
          </header>

          {entry.generalFeedback ? (
            <div className="mt-3 rounded-lg border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-900/60 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide font-semibold text-charcoal/60 dark:text-navy-300">
                General
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-charcoal/85 dark:text-navy-100">
                {entry.generalFeedback}
              </p>
            </div>
          ) : null}

          {entry.individual.length > 0 ? (
            <div className="mt-3 space-y-2">
              {entry.individual.map((row) => (
                <div
                  key={row.studentId}
                  className="rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-900/20 px-3 py-2"
                >
                  <p className="text-[11px] uppercase tracking-wide font-semibold text-emerald-800 dark:text-emerald-200">
                    {row.studentName}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-charcoal/85 dark:text-navy-100">
                    {row.feedback}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {rejectFor === entry.id ? (
            <div className="mt-4 space-y-2">
              <label className="block text-xs font-semibold text-charcoal/70 dark:text-navy-200">
                Notes to the coach (required)
              </label>
              <textarea
                rows={3}
                value={rejectNotes}
                onChange={(event) => setRejectNotes(event.target.value)}
                maxLength={2000}
                placeholder="e.g. Please make the personal feedback for Alex more specific."
                className="w-full rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => review(entry.id, 'reject', rejectNotes)}
                  disabled={busyId === entry.id || rejectNotes.trim().length < 3}
                  className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-semibold disabled:opacity-60"
                >
                  {busyId === entry.id ? 'Sending…' : 'Reject with notes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectFor(null);
                    setRejectNotes('');
                  }}
                  className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => review(entry.id, 'approve')}
                disabled={busyId === entry.id}
                className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60"
              >
                {busyId === entry.id ? 'Approving…' : 'Approve'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRejectFor(entry.id);
                  setRejectNotes('');
                }}
                className="px-3 py-1.5 rounded-md border border-red-300 dark:border-red-800/60 text-red-700 dark:text-red-300 text-sm font-semibold"
              >
                Reject…
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
