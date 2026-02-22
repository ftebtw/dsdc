"use client";

import { useState } from 'react';

type State = 'idle' | 'loading' | 'success' | 'error';

export default function StudentLinkParentForm() {
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
        throw new Error(payload.error || 'Could not claim invite code.');
      }

      setState('success');
      setCode('');
      setMessage(`Linked successfully to ${payload.parentName || 'parent account'}.`);
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Could not claim invite code.');
    }
  }

  return (
    <form onSubmit={submitCode} className="max-w-md space-y-3">
      <label className="block">
        <span className="text-sm text-navy-700 dark:text-navy-200">Enter 6-character parent invite code</span>
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          maxLength={6}
          required
          className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 font-mono tracking-[0.18em] uppercase"
          placeholder="ABC234"
        />
      </label>

      <button
        type="submit"
        disabled={state === 'loading'}
        className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-60"
      >
        {state === 'loading' ? 'Linking...' : 'Link Parent'}
      </button>

      {message ? (
        <p className={`text-sm ${state === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
