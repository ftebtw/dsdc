import { Suspense } from "react";
import PortalLoginPageClient from "./PortalLoginPageClient";

export const dynamic = "force-dynamic";

function LoginSkeleton() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-warm-300 dark:border-navy-600 shadow-md bg-white dark:bg-navy-800 p-6 sm:p-8">
        <div className="h-8 w-40 bg-warm-200 dark:bg-navy-700 rounded animate-pulse mb-4" />
        <div className="h-4 w-64 bg-warm-100 dark:bg-navy-700 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-warm-100 dark:bg-navy-700 rounded-lg animate-pulse" />
          <div className="h-10 bg-warm-100 dark:bg-navy-700 rounded-lg animate-pulse" />
          <div className="h-10 bg-navy-800 dark:bg-gold-300 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <PortalLoginPageClient />
    </Suspense>
  );
}
