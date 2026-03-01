"use client";

import { useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { portalT } from '@/lib/portal/parent-i18n';

type InviteCode = {
  id: string;
  code: string;
  expires_at: string;
  claimed_at: string | null;
  claimed_by: string | null;
  created_at: string;
};

type ParentInviteCodePanelProps = {
  initialCodes: InviteCode[];
  locale?: 'en' | 'zh';
};

function getStatus(code: InviteCode, now: Date): 'pending' | 'claimed' | 'expired' {
  if (code.claimed_at || code.claimed_by) return 'claimed';
  if (new Date(code.expires_at).getTime() <= now.getTime()) return 'expired';
  return 'pending';
}

function getTimeRemainingText(
  expiresAt: string,
  now: Date,
  t: (key: string, fallback: string) => string
): string {
  const remainingMs = new Date(expiresAt).getTime() - now.getTime();
  if (remainingMs <= 0) return t('portal.linkStudent.status.expired', 'Expired');

  const totalMinutes = Math.floor(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export default function ParentInviteCodePanel({ initialCodes, locale = 'en' }: ParentInviteCodePanelProps) {
  const { locale: contextLocale } = useI18n();
  const t = (key: string, fallback: string) => portalT(contextLocale, key, fallback);
  const [codes, setCodes] = useState<InviteCode[]>(initialCodes);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const now = useMemo(() => new Date(), [codes]);

  async function generateCode() {
    setPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/portal/invite-codes', {
        method: 'POST',
      });
      const payload = (await response.json()) as {
        error?: string;
        invite?: InviteCode;
      };

      if (!response.ok || !payload.invite) {
        throw new Error(payload.error || t('portal.linkStudent.generateError', 'Could not generate invite code.'));
      }

      setCodes((previous) => [payload.invite!, ...previous]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t('portal.linkStudent.generateError', 'Could not generate invite code.')
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-warm-200 dark:border-navy-600/70 bg-white/80 dark:bg-navy-900/50 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-navy-800 dark:text-white">
            {t('portal.linkStudent.heading', 'Link Student')}
          </h3>
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {t(
              'portal.linkStudent.instructions',
              'Generate a 6-character code. Your student enters it in their portal to link accounts.'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={generateCode}
          disabled={pending}
          className="px-3 py-2 rounded-md bg-navy-800 text-white text-sm font-semibold disabled:opacity-60"
        >
          {pending
            ? t('portal.linkStudent.generatingButton', 'Generating...')
            : t('portal.linkStudent.generateButton', 'Generate Code')}
        </button>
      </div>

      {errorMessage ? <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p> : null}

      <div className="space-y-2">
        {codes.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {t('portal.linkStudent.noCodes', 'No codes yet.')}
          </p>
        ) : (
          codes.map((code) => {
            const status = getStatus(code, now);
            const statusColor =
              status === 'claimed'
                ? 'bg-green-100 text-green-800'
                : status === 'expired'
                  ? 'bg-charcoal/10 text-charcoal/80 dark:bg-navy-700 dark:text-navy-200'
                  : 'bg-gold-100 text-navy-900';

            return (
              <div
                key={code.id}
                className="rounded-lg border border-warm-200 dark:border-navy-600 p-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-mono text-lg tracking-[0.15em] text-navy-800 dark:text-white">{code.code}</p>
                  <p className="text-xs text-charcoal/70 dark:text-navy-300">
                    {t('portal.linkStudent.expires', 'Expires')}: {new Date(code.expires_at).toLocaleString()} ({getTimeRemainingText(code.expires_at, now, t)})
                  </p>
                </div>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase ${statusColor}`}>
                  {t(`portal.linkStudent.status.${status}`, status)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
