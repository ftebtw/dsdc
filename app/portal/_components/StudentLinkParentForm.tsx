"use client";

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { portalT } from '@/lib/portal/parent-i18n';

type State = 'idle' | 'loading' | 'success' | 'error';

export default function StudentLinkParentForm() {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const [code, setCode] = useState('');
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function submitCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('loading');
    setMessage(null);

    try {
      const response = await fetch('/api/portal/invite-codes/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const payload = (await response.json()) as { success?: boolean; parentName?: string; error?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || t('portal.linkParent.claimError', 'Could not claim invite code.'));
      }

      setState('success');
      setCode('');
      setMessage(
        t('portal.linkParent.success', 'Linked successfully to {name}.').replace(
          '{name}',
          payload.parentName || t('portal.linkParent.parentAccount', 'parent account')
        )
      );
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : t('portal.linkParent.claimError', 'Could not claim invite code.'));
    }
  }

  return (
    <form onSubmit={submitCode} className="max-w-md space-y-3">
      <label className="block">
        <span className="text-sm text-navy-700 dark:text-navy-200">
          {t('portal.linkParent.enterCode', 'Enter 6-character parent invite code')}
        </span>
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          maxLength={6}
          required
          className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 font-mono tracking-[0.18em] uppercase"
          placeholder={t('portal.linkParent.placeholder', 'ABC234')}
        />
      </label>

      <button
        type="submit"
        disabled={state === 'loading'}
        className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-60"
      >
        {state === 'loading'
          ? t('portal.linkParent.linking', 'Linking...')
          : t('portal.linkParent.submit', 'Link Parent')}
      </button>

      {message ? (
        <p className={`text-sm ${state === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
