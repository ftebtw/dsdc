"use client";

import { useMemo, useState } from 'react';
import { portalT } from '@/lib/portal/parent-i18n';

type ActionResult = { ok: boolean; error?: string };

type Props = {
  coachName: string;
  studentName: string;
  whenText: string;
  status: string;
  studentNotes?: string | null;
  coachNotes?: string | null;
  priceCad?: number | null;
  zoomLink?: string | null;
  paymentMethod?: string | null;
  proposedDate?: string | null;
  proposedStartTime?: string | null;
  proposedEndTime?: string | null;
  proposedByName?: string | null;
  step?: number;
  viewerRole: 'admin' | 'coach' | 'student' | 'parent';

  canAccept?: boolean;
  canReject?: boolean;
  canReschedule?: boolean;
  canAcceptReschedule?: boolean;
  canApprove?: boolean;
  canPay?: boolean;
  canCancel?: boolean;
  canComplete?: boolean;

  onAccept?: () => Promise<ActionResult>;
  onReject?: (notes?: string) => Promise<ActionResult>;
  onReschedule?: (data: {
    date: string;
    start: string;
    end: string;
    notes?: string;
  }) => Promise<ActionResult>;
  onAcceptReschedule?: () => Promise<ActionResult>;
  onApprove?: (data: { priceCad: number; zoomLink?: string }) => Promise<ActionResult>;
  onPayCard?: () => Promise<ActionResult>;
  onPayEtransfer?: () => Promise<ActionResult>;
  onCancel?: (reason?: string) => Promise<ActionResult>;
  onComplete?: () => Promise<ActionResult>;
  locale?: 'en' | 'zh';
};

function statusClass(status: string) {
  if (status === 'confirmed') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
  if (status === 'cancelled') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
  if (status === 'completed') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
  if (status === 'coach_accepted') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
  if (status === 'awaiting_payment') return 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200';
  if (status === 'rescheduled_by_coach' || status === 'rescheduled_by_student') {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200';
  }
  return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200';
}

const stepLabels = ['Request', 'Coach Review', 'Admin Approval', 'Payment', 'Confirmed', 'Complete'];

function normalizeTimeInput(value: string): string {
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed.slice(0, 5);
  return trimmed;
}

function sessionStatusText(status: string, t: (key: string, fallback: string) => string) {
  switch (status) {
    case 'pending':
      return t('portal.privateSessions.status.awaitingCoach', 'Awaiting coach response');
    case 'rescheduled_by_coach':
      return t('portal.privateSessions.status.rescheduledByCoach', 'Coach proposed a new time');
    case 'rescheduled_by_student':
      return t('portal.privateSessions.status.rescheduledByStudent', 'Student proposed a new time');
    case 'coach_accepted':
      return t('portal.privateSessions.status.coachAccepted', 'Coach accepted. Awaiting admin approval');
    case 'awaiting_payment':
      return t('portal.privateSessions.status.awaitingPayment', 'Approved. Awaiting payment');
    case 'confirmed':
      return t('portal.common.confirmed', 'Confirmed');
    case 'completed':
      return t('portal.common.completed', 'Completed');
    case 'cancelled':
      return t('portal.common.cancelled', 'Cancelled');
    default:
      return status;
  }
}

function statusBadgeText(status: string, t: (key: string, fallback: string) => string): string {
  if (status === 'pending') return t('portal.common.pending', 'Pending');
  if (status === 'confirmed') return t('portal.common.confirmed', 'Confirmed');
  if (status === 'completed') return t('portal.common.completed', 'Completed');
  if (status === 'cancelled') return t('portal.common.cancelled', 'Cancelled');
  if (status === 'awaiting_payment') {
    return t('portal.privateSessions.status.awaitingPaymentShort', 'Awaiting payment');
  }
  return status;
}

export default function PrivateSessionCard(props: Props) {
  const locale = props.locale ?? 'en';
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [rejectNotes, setRejectNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState(props.proposedDate || '');
  const [rescheduleStart, setRescheduleStart] = useState(
    normalizeTimeInput(props.proposedStartTime || '')
  );
  const [rescheduleEnd, setRescheduleEnd] = useState(
    normalizeTimeInput(props.proposedEndTime || '')
  );
  const [rescheduleNotes, setRescheduleNotes] = useState('');

  const [priceCad, setPriceCad] = useState(
    props.priceCad != null && Number.isFinite(Number(props.priceCad))
      ? Number(props.priceCad).toFixed(2)
      : ''
  );
  const [zoomLink, setZoomLink] = useState(props.zoomLink || '');

  const canRunActions = loading === null;

  const resolvedStep = useMemo(() => {
    if (props.step) return Math.max(1, Math.min(6, props.step));
    if (props.status === 'pending') return 1;
    if (props.status === 'rescheduled_by_coach' || props.status === 'rescheduled_by_student') return 2;
    if (props.status === 'coach_accepted') return 3;
    if (props.status === 'awaiting_payment') return 4;
    if (props.status === 'confirmed') return 5;
    return props.status === 'completed' ? 6 : 1;
  }, [props.step, props.status]);

  async function runAction(label: string, fn?: () => Promise<ActionResult>) {
    if (!fn) return;
    setLoading(label);
    setError(null);
    const result = await fn();
    setLoading(null);
    if (!result.ok) {
      setError(result.error || t('portal.privateSessions.error.actionFailed', 'Action failed.'));
    }
  }

  return (
    <article className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4 space-y-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-navy-800 dark:text-white">{props.whenText}</h3>
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {t('portal.common.coach', 'Coach')}: {props.coachName}
          </p>
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {t('portal.common.student', 'Student')}: {props.studentName}
          </p>
          <p className="text-xs text-charcoal/65 dark:text-navy-300">{sessionStatusText(props.status, t)}</p>
        </div>
        <span className={`inline-flex px-2 py-1 rounded-full text-xs uppercase ${statusClass(props.status)}`}>
          {statusBadgeText(props.status, t)}
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-6 text-xs">
        {stepLabels.map((label, index) => {
          const stepNum = index + 1;
          const active = stepNum === resolvedStep;
          const done = stepNum < resolvedStep;
          return (
            <div
              key={label}
              className={`rounded-md px-2 py-1 border text-center ${
                active
                  ? 'border-gold-400 bg-gold-100/70 text-navy-900 dark:bg-gold-400/20 dark:text-gold-100'
                  : done
                    ? 'border-green-400 bg-green-50 text-green-800 dark:bg-green-500/20 dark:text-green-200'
                    : 'border-warm-200 text-charcoal/65 dark:border-navy-700 dark:text-navy-300'
              }`}
            >
              {done ? '\u2713 ' : ''}
              {label}
            </div>
          );
        })}
      </div>

      {props.studentNotes ? (
        <p className="text-sm">
          {t('portal.privateSessions.studentNotes', 'Student notes')}: {props.studentNotes}
        </p>
      ) : null}
      {props.coachNotes ? (
        <p className="text-sm">
          {t('portal.privateSessions.coachNotes', 'Coach notes')}: {props.coachNotes}
        </p>
      ) : null}

      {props.proposedDate && props.proposedStartTime && props.proposedEndTime ? (
        <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50/70 dark:bg-orange-900/20 px-3 py-2 text-sm">
          {t('portal.privateSessions.proposedTime', 'Proposed time')}: {props.proposedDate}{' '}
          {normalizeTimeInput(props.proposedStartTime)}-{normalizeTimeInput(props.proposedEndTime)}
          {props.proposedByName
            ? ` (${t('portal.privateSessions.by', 'by')} ${props.proposedByName})`
            : ''}
        </div>
      ) : null}

      {props.priceCad != null ? (
        <p className="text-sm text-charcoal/80 dark:text-navy-200">
          {t('portal.common.price', 'Price')}: CAD ${Number(props.priceCad).toFixed(2)}
        </p>
      ) : null}

      {props.paymentMethod ? (
        <p className="text-sm text-charcoal/80 dark:text-navy-200">
          {t('portal.privateSessions.paymentMethod', 'Payment method')}: {props.paymentMethod}
        </p>
      ) : null}

      {props.zoomLink && (props.status === 'confirmed' || props.status === 'completed') ? (
        <p className="text-sm">
          {t('portal.common.zoomLink', 'Zoom Link')}:{' '}
          <a href={props.zoomLink} target="_blank" rel="noreferrer" className="text-blue-700 underline">
            {props.zoomLink}
          </a>
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {props.canAccept && props.onAccept ? (
          <button
            type="button"
            onClick={() => void runAction('accept', props.onAccept)}
            disabled={!canRunActions}
            className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-sm font-semibold disabled:opacity-70"
          >
            {loading === 'accept'
              ? t('portal.privateSessions.accepting', 'Accepting...')
              : t('portal.common.accept', 'Accept')}
          </button>
        ) : null}

        {props.canAcceptReschedule && props.onAcceptReschedule ? (
          <button
            type="button"
            onClick={() => void runAction('accept-reschedule', props.onAcceptReschedule)}
            disabled={!canRunActions}
            className="px-3 py-1.5 rounded-md bg-blue-700 text-white text-sm font-semibold disabled:opacity-70"
          >
            {loading === 'accept-reschedule'
              ? t('portal.privateSessions.accepting', 'Accepting...')
              : t('portal.privateSessions.acceptReschedule', 'Accept Reschedule')}
          </button>
        ) : null}

        {props.canComplete && props.onComplete ? (
          <button
            type="button"
            onClick={() => void runAction('complete', props.onComplete)}
            disabled={!canRunActions}
            className="px-3 py-1.5 rounded-md bg-navy-800 text-white text-sm disabled:opacity-70"
          >
            {loading === 'complete'
              ? t('portal.privateSessions.completing', 'Completing...')
              : t('portal.privateSessions.markComplete', 'Mark Complete')}
          </button>
        ) : null}

        {props.canPay && props.onPayCard ? (
          <button
            type="button"
            onClick={() => void runAction('pay-card', props.onPayCard)}
            disabled={!canRunActions}
            className="px-3 py-1.5 rounded-md bg-green-700 text-white text-sm font-semibold disabled:opacity-70"
          >
            {loading === 'pay-card'
              ? t('portal.privateSessions.redirecting', 'Redirecting...')
              : t('portal.privateSessions.payWithCard', 'Pay with Card')}
          </button>
        ) : null}

        {props.canPay && props.onPayEtransfer ? (
          <button
            type="button"
            onClick={() => void runAction('pay-etransfer', props.onPayEtransfer)}
            disabled={!canRunActions}
            className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm disabled:opacity-70"
          >
            {loading === 'pay-etransfer'
              ? t('portal.common.sending', 'Sending...')
              : t('portal.privateSessions.payByEtransfer', 'Pay by E-Transfer')}
          </button>
        ) : null}
      </div>

      {(props.canReject && props.onReject) || (props.canCancel && props.onCancel) ? (
        <div className="grid gap-2 md:grid-cols-2">
          {props.canReject && props.onReject ? (
            <div className="space-y-2">
              <textarea
                value={rejectNotes}
                onChange={(event) => setRejectNotes(event.target.value)}
                rows={2}
                placeholder={t('portal.privateSessions.optionalRejectionReason', 'Optional rejection reason')}
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => void runAction('reject', () => props.onReject?.(rejectNotes.trim() || undefined) || Promise.resolve({ ok: false, error: 'Reject unavailable.' }))}
                disabled={!canRunActions}
                className="px-3 py-1.5 rounded-md bg-red-700 text-white text-sm disabled:opacity-70"
              >
                {loading === 'reject'
                  ? t('portal.privateSessions.rejecting', 'Rejecting...')
                  : t('portal.common.reject', 'Reject')}
              </button>
            </div>
          ) : null}

          {props.canCancel && props.onCancel ? (
            <div className="space-y-2">
              <textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                rows={2}
                placeholder={t('portal.privateSessions.optionalCancelReason', 'Optional cancel reason')}
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => void runAction('cancel', () => props.onCancel?.(cancelReason.trim() || undefined) || Promise.resolve({ ok: false, error: 'Cancel unavailable.' }))}
                disabled={!canRunActions}
                className="px-3 py-1.5 rounded-md border border-red-500 text-red-700 dark:text-red-300 text-sm disabled:opacity-70"
              >
                {loading === 'cancel'
                  ? t('portal.privateSessions.cancelling', 'Cancelling...')
                  : t('portal.common.cancel', 'Cancel')}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {props.canReschedule && props.onReschedule ? (
        <form
          className="grid gap-2 md:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            void runAction('reschedule', () =>
              props.onReschedule?.({
                date: rescheduleDate,
                start: rescheduleStart,
                end: rescheduleEnd,
                notes: rescheduleNotes.trim() || undefined,
              }) || Promise.resolve({ ok: false, error: 'Reschedule unavailable.' })
            );
          }}
        >
          <input
            type="date"
            required
            value={rescheduleDate}
            onChange={(event) => setRescheduleDate(event.target.value)}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
          />
          <input
            type="time"
            required
            value={rescheduleStart}
            onChange={(event) => setRescheduleStart(event.target.value)}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
          />
          <input
            type="time"
            required
            value={rescheduleEnd}
            onChange={(event) => setRescheduleEnd(event.target.value)}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={!canRunActions}
            className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm disabled:opacity-70"
          >
            {loading === 'reschedule'
              ? t('portal.common.sending', 'Sending...')
              : t('portal.privateSessions.proposeReschedule', 'Propose Reschedule')}
          </button>
          <textarea
            value={rescheduleNotes}
            onChange={(event) => setRescheduleNotes(event.target.value)}
            rows={2}
            placeholder={t('portal.common.notesPlaceholder', 'Notes for the coach (optional)')}
            className="md:col-span-4 rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
          />
        </form>
      ) : null}

      {props.canApprove && props.onApprove ? (
        <form
          className="grid gap-2 md:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            const parsedPrice = Number(priceCad);
            if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
              setError(t('portal.privateSessions.pricePositive', 'Price must be a positive number.'));
              return;
            }
            void runAction('approve', () =>
              props.onApprove?.({ priceCad: parsedPrice, zoomLink: zoomLink.trim() || undefined }) ||
              Promise.resolve({ ok: false, error: 'Approve unavailable.' })
            );
          }}
        >
          <input
            type="number"
            min="1"
            step="0.01"
            placeholder={t('portal.privateSessions.priceCad', 'Price (CAD)')}
            value={priceCad}
            onChange={(event) => setPriceCad(event.target.value)}
            required
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
          />
          <input
            type="url"
            placeholder={t('portal.privateSessions.zoomOptional', 'Zoom link (optional)')}
            value={zoomLink}
            onChange={(event) => setZoomLink(event.target.value)}
            className="md:col-span-2 rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={!canRunActions}
            className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-sm font-semibold disabled:opacity-70"
          >
            {loading === 'approve'
              ? t('portal.privateSessions.approving', 'Approving...')
              : t('portal.privateSessions.approveNotifyStudent', 'Approve & Notify Student')}
          </button>
        </form>
      ) : null}

      {error ? <p className="text-sm text-red-700 dark:text-red-300">{error}</p> : null}
    </article>
  );
}
