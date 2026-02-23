"use client";

import { useState } from 'react';
import PortalLoginForm from '@/app/portal/_components/PortalLoginForm';
import Link from 'next/link';

export default function PortalLoginPage() {
  const [locale, setLocale] = useState<'en' | 'zh'>('en');
  const copy =
    locale === 'zh'
      ? {
          title: '\u95e8\u6237\u767b\u5f55',
          subtitle: '\u8bf7\u4f7f\u7528\u60a8\u7684 DSDC \u95e8\u6237\u8d26\u6237\u767b\u5f55\u3002',
          noAccount: '\u8fd8\u6ca1\u6709\u8d26\u6237\uff1f',
          createAccount: '\u521b\u5efa\u8d26\u6237',
          backHome: '\u8fd4\u56de\u9996\u9875',
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
      <div className="w-full max-w-md rounded-2xl border-2 border-warm-300 dark:border-navy-600 shadow-lg bg-white dark:bg-navy-800 p-6 sm:p-8">
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
              \u4e2d\u6587
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-navy-800 dark:text-white mb-2">{copy.title}</h1>
        <p className="text-sm text-charcoal/60 dark:text-navy-300 mb-6">{copy.subtitle}</p>
        <PortalLoginForm locale={locale} />
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
          className="mt-3 inline-flex w-full items-center justify-center rounded-lg border-2 border-warm-400 dark:border-navy-500 py-2.5 text-sm font-medium text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700 transition-colors"
        >
          {copy.backHome}
        </Link>
      </div>
    </div>
  );
}
