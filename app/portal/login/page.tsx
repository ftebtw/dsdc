import PortalLoginForm from '@/app/portal/_components/PortalLoginForm';
import Link from 'next/link';

export default function PortalLoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-navy-800 dark:text-white mb-2">Portal Login</h1>
        <p className="text-sm text-charcoal/60 dark:text-navy-300 mb-6">Sign in with your DSDC portal account.</p>
        <PortalLoginForm />
        <div className="mt-4 text-center">
          <p className="text-sm text-charcoal/60 dark:text-navy-300">Don&apos;t have an account?</p>
          <Link
            href="/register"
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-gold-300 dark:bg-gold-400 text-navy-900 py-2.5 text-sm font-semibold hover:bg-gold-200 dark:hover:bg-gold-300 transition-colors"
          >
            Create an Account
          </Link>
        </div>
        <Link
          href="/"
          className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-warm-300 dark:border-navy-600 py-2.5 text-sm font-medium text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
