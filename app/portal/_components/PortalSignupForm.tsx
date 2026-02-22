"use client";

import { useState } from 'react';
import type { Database } from '@/lib/supabase/database.types';

type AppRole = Database['public']['Enums']['app_role'];
type CoachTier = Database['public']['Enums']['coach_tier'];

type FormState = {
  email: string;
  display_name: string;
  role: AppRole;
  locale: Database['public']['Enums']['locale_code'];
  phone: string;
  timezone: string;
  tier: CoachTier;
  is_ta: boolean;
  send_invite: boolean;
};

const initialState: FormState = {
  email: '',
  display_name: '',
  role: 'coach',
  locale: 'en',
  phone: '',
  timezone: 'America/Vancouver',
  tier: 'junior',
  is_ta: false,
  send_invite: true,
};

export default function PortalSignupForm() {
  const [state, setState] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch('/api/portal/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });

    const data = (await response.json()) as { error?: string; message?: string };
    setLoading(false);

    if (!response.ok) {
      setError(data.error || 'Failed to create user.');
      return;
    }

    setMessage(data.message || 'User created.');
    setState(initialState);
  }

  const isCoachLike = state.role === 'coach' || state.role === 'ta';

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6">
      <h1 className="text-xl font-bold text-navy-800 dark:text-white">Create Portal User</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <input required placeholder="Email" value={state.email} onChange={(e) => setState({ ...state, email: e.target.value })} className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2" />
        <input required placeholder="Display name" value={state.display_name} onChange={(e) => setState({ ...state, display_name: e.target.value })} className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2" />
        <select value={state.role} onChange={(e) => setState({ ...state, role: e.target.value as AppRole })} className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2">
          <option value="admin">Admin</option>
          <option value="coach">Coach</option>
          <option value="ta">TA</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
        </select>
        <select value={state.locale} onChange={(e) => setState({ ...state, locale: e.target.value as FormState['locale'] })} className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2">
          <option value="en">English</option>
          <option value="zh">Chinese</option>
        </select>
        <input placeholder="Phone" value={state.phone} onChange={(e) => setState({ ...state, phone: e.target.value })} className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2" />
        <input placeholder="Timezone" value={state.timezone} onChange={(e) => setState({ ...state, timezone: e.target.value })} className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2" />
      </div>

      {isCoachLike ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <select value={state.tier} onChange={(e) => setState({ ...state, tier: e.target.value as CoachTier })} className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2">
            <option value="junior">Junior</option>
            <option value="senior">Senior</option>
            <option value="wsc">WSC</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-200">
            <input type="checkbox" checked={state.is_ta} onChange={(e) => setState({ ...state, is_ta: e.target.checked })} />
            Is TA
          </label>
        </div>
      ) : null}

      <label className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-200">
        <input type="checkbox" checked={state.send_invite} onChange={(e) => setState({ ...state, send_invite: e.target.checked })} />
        Send invite email
      </label>

      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button disabled={loading} type="submit" className="rounded-lg bg-navy-800 text-white px-4 py-2 font-semibold">
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
