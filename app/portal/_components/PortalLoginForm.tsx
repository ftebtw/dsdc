"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AuthChangeEvent } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function PortalLoginForm() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      setRecoveryMode(true);
      setInfo('Reset link detected. Enter a new password below.');
    }

    const { data } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
        setInfo('Password recovery mode enabled. Enter a new password.');
        setError(null);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (recoveryMode) {
      await onUpdatePassword();
      return;
    }

    setLoading(true);
    setError(null);
    setInfo(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    void fetch('/api/portal/track-login', { method: 'POST' }).catch(() => {});

    const redirectTo = params.get('redirectTo') || '/portal';
    router.push(redirectTo);
    router.refresh();
  }

  async function onSendResetEmail() {
    if (!email.trim()) {
      setError('Enter your email first, then click Forgot password.');
      return;
    }

    setResetLoading(true);
    setError(null);
    setInfo(null);

    const redirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/portal/login` : undefined;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setResetLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setInfo('Password reset email sent. Check your inbox (and spam/junk folder) and follow the link.');
  }

  async function onUpdatePassword() {
    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfo(null);

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setInfo('Password updated. You can now sign in.');
    setRecoveryMode(false);
    setNewPassword('');
    setConfirmPassword('');
    if (typeof window !== 'undefined' && window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1 text-navy-700 dark:text-navy-200">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        />
      </div>

      {recoveryMode ? (
        <>
          <div>
            <label className="block text-sm mb-1 text-navy-700 dark:text-navy-200">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-navy-700 dark:text-navy-200">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            />
          </div>
        </>
      ) : (
        <div>
          <label className="block text-sm mb-1 text-navy-700 dark:text-navy-200">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
        </div>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {info ? <p className="text-sm text-green-700 dark:text-green-400">{info}</p> : null}

      <button
        disabled={loading}
        type="submit"
        className="w-full rounded-lg bg-navy-800 text-white py-2.5 font-semibold hover:bg-navy-700 dark:bg-gold-300 dark:text-navy-900 dark:hover:bg-gold-200 disabled:opacity-60"
      >
        {loading ? (recoveryMode ? 'Updating password...' : 'Signing in...') : recoveryMode ? 'Update Password' : 'Sign In'}
      </button>

      {!recoveryMode ? (
        <button
          type="button"
          disabled={resetLoading}
          onClick={() => {
            void onSendResetEmail();
          }}
          className="w-full rounded-lg border border-warm-300 dark:border-navy-600 py-2.5 font-medium text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700 disabled:opacity-60"
        >
          {resetLoading ? 'Sending reset email...' : 'Forgot Password'}
        </button>
      ) : null}
    </form>
  );
}
