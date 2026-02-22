import PortalLoginForm from '@/app/portal/_components/PortalLoginForm';
import Link from 'next/link';

export default function PortalLoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-navy-800 dark:text-white mb-2">Portal Login</h1>
        <p className="text-sm text-charcoal/60 dark:text-navy-300 mb-6">Sign in with your DSDC portal account.</p>
        <PortalLoginForm />
        <Link
          href="/"
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-warm-300 dark:border-navy-600 py-2.5 text-sm font-medium text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
