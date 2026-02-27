"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { portalT } from "@/lib/portal/parent-i18n";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  useEffect(() => {
    console.error("[Portal Error]", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 max-w-lg text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-2xl">
          !
        </div>
        <h2 className="text-lg font-bold text-red-800 dark:text-red-200">
          {t("portal.error.title", "Something went wrong")}
        </h2>
        <p className="text-sm text-red-700 dark:text-red-300">
          {t(
            "portal.error.description",
            "This page encountered an error. Please try again or contact support if the problem persists."
          )}
        </p>
        {error.message ? (
          <p className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded px-3 py-2 font-mono break-all">
            {error.message}
          </p>
        ) : null}
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700"
          >
            {t("portal.error.tryAgain", "Try Again")}
          </button>
          <a
            href="/portal"
            className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 text-sm font-medium"
          >
            {t("portal.error.backToPortal", "Back to Portal")}
          </a>
        </div>
      </div>
    </div>
  );
}
