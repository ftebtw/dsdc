"use client";

import { Suspense, useState } from 'react';
import PortalLoginForm from '@/app/portal/_components/PortalLoginForm';
import Link from 'next/link';

export default function PortalLoginPage() {
  const [locale, setLocale] = useState<'en' | 'zh'>('en');
  const copy =
    locale === 'zh'
      ? {
          title: '门户登录',
          subtitle: '请使用您的 DSDC 门户账户登录。',
          noAccount: '还没有账户？',
          createAccount: '创建账户',
          backHome: '返回首页',
        }
      : {
          title: 'Portal Login',
          subtitle: 'Sign in with your DSDC portal account.',
          noAccount: "Don't have an account?",
          createAccount: 'Create an Account',
          backHome: 'Back to Home',
        };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-warm-300 dark:border-navy-600 shadow-md bg-white dark:bg-navy-800 p-6 sm:p-8">
        <div className="flex justify-end mb-4">
          <div className="inline-flex rounded-lg border border-warm-300 dark:border-navy-600 overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-3 py-1 ${
                locale === 'en'
                  ? 'bg-navy-800 text-white dark:bg-gold-300 dark:text-navy-900'
                  : 'text-navy-700 dark:text-navy-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale('zh')}
              className={`px-3 py-1 ${
                locale === 'zh'
                  ? 'bg-navy-800 text-white dark:bg-gold-300 dark:text-navy-900'
                  : 'text-navy-700 dark:text-navy-200'
              }`}
            >
              中文
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-navy-800 dark:text-white mb-2">{copy.title}</h1>
        <p className="text-sm text-charcoal/60 dark:text-navy-300 mb-6">{copy.subtitle}</p>
        <Suspense
          fallback={<div className="h-20 animate-pulse rounded-lg bg-warm-100 dark:bg-navy-700" />}
        >
          <PortalLoginForm locale={locale} />
        </Suspense>
        <div className="mt-4 text-center">
          <p className="text-sm text-charcoal/60 dark:text-navy-300">{copy.noAccount}</p>
          <Link
            href="/register"
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-gold-300 dark:bg-gold-400 text-navy-900 py-2.5 text-sm font-semibold hover:bg-gold-200 dark:hover:bg-gold-300 transition-colors"
          >
            {copy.createAccount}
          </Link>
        </div>
        <Link
          href="/"
          className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-warm-300 dark:border-navy-600 py-2.5 text-sm font-medium text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700 transition-colors"
        >
          {copy.backHome}
        </Link>
      </div>
    </div>
  );
}
