"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AuthChangeEvent } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type Props = {
  locale: 'en' | 'zh';
};

export default function PortalLoginForm({ locale }: Props) {
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
  const t =
    locale === 'zh'
      ? {
          resetLinkDetected: '\u5df2\u68c0\u6d4b\u5230\u91cd\u7f6e\u94fe\u63a5\uff0c\u8bf7\u5728\u4e0b\u65b9\u8f93\u5165\u65b0\u5bc6\u7801\u3002',
          recoveryModeEnabled: '\u5df2\u8fdb\u5165\u5bc6\u7801\u627e\u56de\u6a21\u5f0f\uff0c\u8bf7\u8f93\u5165\u65b0\u5bc6\u7801\u3002',
          enterEmailFirst: '\u8bf7\u5148\u8f93\u5165\u7535\u5b50\u90ae\u7bb1\uff0c\u7136\u540e\u70b9\u51fb\u201c\u5fd8\u8bb0\u5bc6\u7801\u201d\u3002',
          resetSent:
            '\u5bc6\u7801\u91cd\u7f6e\u90ae\u4ef6\u5df2\u53d1\u9001\uff0c\u8bf7\u68c0\u67e5\u60a8\u7684\u6536\u4ef6\u7bb1\uff08\u4e5f\u5305\u62ec\u5783\u573e\u90ae\u4ef6/\u5783\u573e\u7bb1\u6587\u4ef6\u5939\uff09\u5e76\u70b9\u51fb\u94fe\u63a5\u3002',
          newPasswordMin: '\u65b0\u5bc6\u7801\u81f3\u5c11\u9700\u8981 8 \u4e2a\u5b57\u7b26\u3002',
          passwordsNoMatch: '\u4e24\u6b21\u8f93\u5165\u7684\u5bc6\u7801\u4e0d\u4e00\u81f4\u3002',
          passwordUpdated: '\u5bc6\u7801\u5df2\u66f4\u65b0\uff0c\u73b0\u5728\u53ef\u4ee5\u767b\u5f55\u3002',
          email: '\u7535\u5b50\u90ae\u7bb1',
          password: '\u5bc6\u7801',
          newPassword: '\u65b0\u5bc6\u7801',
          confirmNewPassword: '\u786e\u8ba4\u65b0\u5bc6\u7801',
          updatingPassword: '\u66f4\u65b0\u5bc6\u7801\u4e2d...',
          signingIn: '\u767b\u5f55\u4e2d...',
          updatePassword: '\u66f4\u65b0\u5bc6\u7801',
          signIn: '\u767b\u5f55',
          sendingResetEmail: '\u53d1\u9001\u91cd\u7f6e\u90ae\u4ef6\u4e2d...',
          forgotPassword: '\u5fd8\u8bb0\u5bc6\u7801',
        }
      : {
          resetLinkDetected: 'Reset link detected. Enter a new password below.',
          recoveryModeEnabled: 'Password recovery mode enabled. Enter a new password.',
          enterEmailFirst: 'Enter your email first, then click Forgot password.',
          resetSent:
            'Password reset email sent. Check your inbox (and spam/junk folder) and follow the link.',
          newPasswordMin: 'New password must be at least 8 characters.',
          passwordsNoMatch: 'Passwords do not match.',
          passwordUpdated: 'Password updated. You can now sign in.',
          email: 'Email',
          password: 'Password',
          newPassword: 'New Password',
          confirmNewPassword: 'Confirm New Password',
          updatingPassword: 'Updating password...',
          signingIn: 'Signing in...',
          updatePassword: 'Update Password',
          signIn: 'Sign In',
          sendingResetEmail: 'Sending reset email...',
          forgotPassword: 'Forgot Password',
        };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      setRecoveryMode(true);
      setInfo(t.resetLinkDetected);
    }

    const { data } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
        setInfo(t.recoveryModeEnabled);
        setError(null);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [supabase, t.recoveryModeEnabled, t.resetLinkDetected]);

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
      setError(t.enterEmailFirst);
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

    setInfo(t.resetSent);
  }

  async function onUpdatePassword() {
    if (!newPassword || newPassword.length < 8) {
      setError(t.newPasswordMin);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t.passwordsNoMatch);
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

    setInfo(t.passwordUpdated);
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
        <label className="block text-sm mb-1 text-navy-700 dark:text-navy-200">{t.email}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border-2 border-warm-400 dark:border-navy-500 bg-white dark:bg-navy-900 px-3 py-2"
        />
      </div>

      {recoveryMode ? (
        <>
          <div>
            <label className="block text-sm mb-1 text-navy-700 dark:text-navy-200">{t.newPassword}</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border-2 border-warm-400 dark:border-navy-500 bg-white dark:bg-navy-900 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-navy-700 dark:text-navy-200">{t.confirmNewPassword}</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border-2 border-warm-400 dark:border-navy-500 bg-white dark:bg-navy-900 px-3 py-2"
            />
          </div>
        </>
      ) : (
        <div>
          <label className="block text-sm mb-1 text-navy-700 dark:text-navy-200">{t.password}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border-2 border-warm-400 dark:border-navy-500 bg-white dark:bg-navy-900 px-3 py-2"
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
        {loading ? (recoveryMode ? t.updatingPassword : t.signingIn) : recoveryMode ? t.updatePassword : t.signIn}
      </button>

      {!recoveryMode ? (
        <button
          type="button"
          disabled={resetLoading}
          onClick={() => {
            void onSendResetEmail();
          }}
          className="w-full rounded-lg border-2 border-warm-400 dark:border-navy-500 py-2.5 font-medium text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700 disabled:opacity-60"
        >
          {resetLoading ? t.sendingResetEmail : t.forgotPassword}
        </button>
      ) : null}
    </form>
  );
}
