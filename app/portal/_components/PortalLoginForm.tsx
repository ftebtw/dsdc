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
          resetLinkDetected: '已检测到重置链接，请在下方输入新密码。',
          recoveryModeEnabled: '已进入密码找回模式，请输入新密码。',
          enterEmailFirst: '请先输入电子邮箱，然后点击“忘记密码”。',
          resetSent:
            '密码重置邮件已发送，请检查您的收件箱（也包括垃圾邮件/垃圾箱文件夹）并点击链接。',
          newPasswordMin: '新密码至少需要 8 个字符。',
          passwordsNoMatch: '两次输入的密码不一致。',
          passwordUpdated: '密码已更新，现在可以登录。',
          email: '电子邮箱',
          password: '密码',
          newPassword: '新密码',
          confirmNewPassword: '确认新密码',
          updatingPassword: '更新密码中...',
          signingIn: '登录中...',
          updatePassword: '更新密码',
          signIn: '登录',
          sendingResetEmail: '发送重置邮件中...',
          forgotPassword: '忘记密码',
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
          className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
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
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
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
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
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
        {loading ? (recoveryMode ? t.updatingPassword : t.signingIn) : recoveryMode ? t.updatePassword : t.signIn}
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
          {resetLoading ? t.sendingResetEmail : t.forgotPassword}
        </button>
      ) : null}
    </form>
  );
}
