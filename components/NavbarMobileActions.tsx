"use client";

import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useUser } from "@/lib/hooks/useUser";

export default function NavbarMobileActions({
  registerHref,
  onClose,
}: {
  registerHref: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { user, loading } = useUser();

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    onClose();
    window.location.href = "/";
  }

  if (loading) {
    return <div className="h-10 animate-pulse rounded-lg bg-warm-100 dark:bg-navy-800" />;
  }

  if (user) {
    return (
      <>
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 font-bold text-white dark:bg-navy-600">
            {(user.displayName || "U").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">{user.displayName}</p>
            <p className="truncate text-xs text-charcoal/60 dark:text-navy-400">{user.email}</p>
          </div>
        </div>
        <Link
          href={
            user.role === "admin"
              ? "/portal/admin/dashboard"
              : user.role === "coach" || user.role === "ta"
                ? "/portal/coach/dashboard"
                : user.role === "parent"
                  ? "/portal/parent/dashboard"
                  : "/portal/student/classes"
          }
          onClick={onClose}
          className="block w-full rounded-lg border border-warm-300 px-4 py-3 text-center text-sm font-semibold text-navy-900 dark:border-navy-600 dark:text-navy-100"
        >
          Go to Portal
        </Link>
        <Link
          href="/book"
          onClick={onClose}
          className="block w-full rounded-lg bg-gold-300 px-4 py-3 text-center text-sm font-bold text-navy-900"
        >
          {t("nav.book")}
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="block w-full rounded-lg border border-red-200 px-4 py-3 text-center text-sm text-red-600 dark:border-red-900 dark:text-red-400"
        >
          Sign Out
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/portal/login"
        onClick={onClose}
        className="block w-full rounded-lg border border-warm-300 px-4 py-3 text-center text-sm font-semibold text-navy-900 dark:border-navy-600 dark:text-navy-100"
      >
        {t("nav.signIn")}
      </Link>
      <Link
        href={registerHref}
        onClick={onClose}
        className="block w-full rounded-lg border border-warm-300 px-4 py-3 text-center text-sm text-navy-900 dark:border-navy-600 dark:text-navy-100"
      >
        {t("nav.register")}
      </Link>
      <Link
        href="/book"
        onClick={onClose}
        className="block w-full rounded-lg bg-gold-300 px-4 py-3 text-center text-sm font-bold text-navy-900"
      >
        {t("nav.book")}
      </Link>
    </>
  );
}
