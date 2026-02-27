"use client";

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { portalT } from '@/lib/portal/parent-i18n';

type Props = {
  requestType: 'sub' | 'ta';
  className: string;
  whenText: string;
  requestingName: string;
  status: string;
  reason?: string | null;
  acceptedByName?: string | null;
  canAccept?: boolean;
  canCancel?: boolean;
  onAccept?: () => Promise<{ ok: boolean; error?: string }>;
  onCancel?: () => Promise<{ ok: boolean; error?: string }>;
};

export default function SubRequestCard({
  requestType,
  className,
  whenText,
  requestingName,
  status,
  reason,
  acceptedByName,
  canAccept = false,
  canCancel = false,
  onAccept,
  onCancel,
}: Props) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const [loading, setLoading] = useState<'accept' | 'cancel' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (!onAccept) return;
    setLoading('accept');
    setError(null);
    const result = await onAccept();
    setLoading(null);
    if (!result.ok) setError(result.error || t('portal.subRequestCard.acceptError', 'Could not accept request.'));
  }

  async function handleCancel() {
    if (!onCancel) return;
    setLoading('cancel');
    setError(null);
    const result = await onCancel();
    setLoading(null);
    if (!result.ok) setError(result.error || t('portal.subRequestCard.cancelError', 'Could not cancel request.'));
  }

  return (
    <article className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">
            {requestType === 'sub'
              ? t('portal.subRequestCard.subRequest', 'Sub Request')
              : t('portal.subRequestCard.taRequest', 'TA Request')}
          </p>
          <h3 className="font-semibold text-navy-800 dark:text-white">{className}</h3>
          <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">{whenText}</p>
          <p className="text-sm text-charcoal/75 dark:text-navy-200 mt-1">
            {t('portal.subRequestCard.requestingCoach', 'Requesting coach:')} {requestingName}
          </p>
          {reason ? <p className="text-sm mt-1">{t('portal.subRequestCard.reason', 'Reason:')} {reason}</p> : null}
          {acceptedByName ? (
            <p className="text-sm mt-1">
              {t('portal.subRequestCard.acceptedBy', 'Accepted by:')} {acceptedByName}
            </p>
          ) : null}
          <p className="text-xs mt-2 uppercase">
            {t('portal.subRequestCard.status', 'Status:')} {status}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canAccept && onAccept ? (
            <button
              type="button"
              className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-sm font-semibold disabled:opacity-70"
              onClick={() => void handleAccept()}
              disabled={loading !== null}
            >
              {loading === 'accept'
                ? t('portal.subRequestCard.accepting', 'Accepting...')
                : t('portal.subRequestCard.accept', 'Accept')}
            </button>
          ) : null}
          {canCancel && onCancel ? (
            <button
              type="button"
              className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm disabled:opacity-70"
              onClick={() => void handleCancel()}
              disabled={loading !== null}
            >
              {loading === 'cancel'
                ? t('portal.subRequestCard.cancelling', 'Cancelling...')
                : t('portal.common.cancel', 'Cancel')}
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p className="text-sm text-red-700 mt-2">{error}</p> : null}
    </article>
  );
}
