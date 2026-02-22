"use client";

import { useMemo, useState } from 'react';

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
};

function getStatus(code: InviteCode, now: Date): 'pending' | 'claimed' | 'expired' {
  if (code.claimed_at || code.claimed_by) return 'claimed';
  if (new Date(code.expires_at).getTime() <= now.getTime()) return 'expired';
  return 'pending';
}

function getTimeRemainingText(expiresAt: string, now: Date): string {
  const remainingMs = new Date(expiresAt).getTime() - now.getTime();
  if (remainingMs <= 0) return 'Expired';

  const totalMinutes = Math.floor(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m left`;
}

export default function ParentInviteCodePanel({ initialCodes }: ParentInviteCodePanelProps) {
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
        throw new Error(payload.error || 'Could not generate invite code.');
      }

      setCodes((previous) => [payload.invite!, ...previous]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not generate invite code.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-warm-200 dark:border-navy-600/70 bg-white/80 dark:bg-navy-900/50 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-navy-800 dark:text-white">Link Student</h3>
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            Generate a 6-character code. Your student enters it in their portal to link accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={generateCode}
          disabled={pending}
          className="px-3 py-2 rounded-md bg-navy-800 text-white text-sm font-semibold disabled:opacity-60"
        >
          {pending ? 'Generating...' : 'Generate Code'}
        </button>
      </div>

      {errorMessage ? <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p> : null}

      <div className="space-y-2">
        {codes.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">No codes yet.</p>
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
                    Expires: {new Date(code.expires_at).toLocaleString()} ({getTimeRemainingText(code.expires_at, now)})
                  </p>
                </div>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase ${statusColor}`}>
                  {status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
