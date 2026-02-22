"use client";

import { useState } from 'react';

type Props = {
  coachName: string;
  studentName: string;
  whenText: string;
  status: string;
  studentNotes?: string | null;
  coachNotes?: string | null;
  canConfirm?: boolean;
  canCancel?: boolean;
  canComplete?: boolean;
  onConfirm?: () => Promise<{ ok: boolean; error?: string }>;
  onCancel?: () => Promise<{ ok: boolean; error?: string }>;
  onComplete?: () => Promise<{ ok: boolean; error?: string }>;
};

function statusClass(status: string) {
  if (status === 'confirmed') return 'bg-green-100 text-green-800';
  if (status === 'cancelled') return 'bg-red-100 text-red-800';
  if (status === 'completed') return 'bg-blue-100 text-blue-800';
  return 'bg-amber-100 text-amber-800';
}

export default function PrivateSessionCard({
  coachName,
  studentName,
  whenText,
  status,
  studentNotes,
  coachNotes,
  canConfirm = false,
  canCancel = false,
  canComplete = false,
  onConfirm,
  onCancel,
  onComplete,
}: Props) {
  const [loading, setLoading] = useState<'confirm' | 'cancel' | 'complete' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(
    kind: 'confirm' | 'cancel' | 'complete',
    fn?: () => Promise<{ ok: boolean; error?: string }>
  ) {
    if (!fn) return;
    setLoading(kind);
    setError(null);
    const result = await fn();
    setLoading(null);
    if (!result.ok) setError(result.error || 'Action failed.');
  }

  return (
    <article className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <h3 className="font-semibold text-navy-800 dark:text-white">{whenText}</h3>
          <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">Coach: {coachName}</p>
          <p className="text-sm text-charcoal/70 dark:text-navy-300">Student: {studentName}</p>
          {studentNotes ? <p className="text-sm mt-1">Student notes: {studentNotes}</p> : null}
          {coachNotes ? <p className="text-sm mt-1">Coach notes: {coachNotes}</p> : null}
          <span className={`inline-block px-2 py-1 rounded-full text-xs uppercase mt-2 ${statusClass(status)}`}>
            {status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canConfirm && onConfirm ? (
            <button
              type="button"
              className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-sm font-semibold disabled:opacity-70"
              onClick={() => void runAction('confirm', onConfirm)}
              disabled={loading !== null}
            >
              {loading === 'confirm' ? 'Confirming...' : 'Confirm'}
            </button>
          ) : null}
          {canComplete && onComplete ? (
            <button
              type="button"
              className="px-3 py-1.5 rounded-md bg-navy-800 text-white text-sm disabled:opacity-70"
              onClick={() => void runAction('complete', onComplete)}
              disabled={loading !== null}
            >
              {loading === 'complete' ? 'Completing...' : 'Complete'}
            </button>
          ) : null}
          {canCancel && onCancel ? (
            <button
              type="button"
              className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm disabled:opacity-70"
              onClick={() => void runAction('cancel', onCancel)}
              disabled={loading !== null}
            >
              {loading === 'cancel' ? 'Cancelling...' : 'Cancel'}
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p className="text-sm text-red-700 mt-2">{error}</p> : null}
    </article>
  );
}
