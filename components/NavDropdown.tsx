"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

interface NavDropdownProps {
  user: {
    displayName: string;
    email: string;
    role: string;
  } | null;
  variant?: "light" | "dark";
}

function portalHome(role: string) {
  if (role === "admin") return "/portal/admin/dashboard";
  if (role === "coach" || role === "ta") return "/portal/coach/dashboard";
  if (role === "parent") return "/portal/parent/dashboard";
  return "/portal/student/classes";
}

export default function NavDropdown({ user, variant = "dark" }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t, locale } = useI18n();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const textColor =
    variant === "light"
      ? "text-white/90 hover:text-white"
      : "text-navy-800 hover:text-navy-900 dark:text-navy-100 dark:hover:text-white";

  return (
    <div ref={ref} className="relative">
      {user ? (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-full px-1.5 py-1.5 text-sm font-medium transition-colors ${textColor}`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-800 text-sm font-bold text-white dark:bg-navy-600">
            {user.displayName.charAt(0).toUpperCase()}
          </span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${textColor}`}
        >
          {t("nav.signIn") !== "nav.signIn" ? t("nav.signIn") : "Sign In"}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      )}

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-warm-200 bg-white shadow-xl dark:border-navy-700 dark:bg-navy-900">
          {user ? (
            <>
              <div className="border-b border-warm-200 px-4 py-3 dark:border-navy-700">
                <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">{user.displayName}</p>
                <p className="truncate text-xs text-charcoal/60 dark:text-navy-400">{user.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href={portalHome(user.role)}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-800 transition-colors hover:bg-warm-50 dark:text-navy-100 dark:hover:bg-navy-800"
                >
                  <User className="h-4 w-4 text-charcoal/50 dark:text-navy-400" />
                  Go to Portal
                </Link>
              </div>

              <div className="border-t border-warm-200 px-4 py-3 dark:border-navy-700">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-charcoal/40 dark:text-navy-500">
                  Settings
                </p>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-navy-700 dark:text-navy-200">Theme</span>
                  <ThemeToggle variant="dark" />
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-navy-700 dark:text-navy-200">Language</span>
                  <LanguageToggle variant="dark" />
                </div>
              </div>

              <div className="border-t border-warm-200 py-1 dark:border-navy-700">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="py-1">
                <Link
                  href="/portal/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-800 transition-colors hover:bg-warm-50 dark:text-navy-100 dark:hover:bg-navy-800"
                >
                  <User className="h-4 w-4 text-charcoal/50 dark:text-navy-400" />
                  Sign In
                </Link>
                <Link
                  href={`/register?lang=${locale === "zh" ? "zh" : "en"}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-800 transition-colors hover:bg-warm-50 dark:text-navy-100 dark:hover:bg-navy-800"
                >
                  <Settings className="h-4 w-4 text-charcoal/50 dark:text-navy-400" />
                  Register
                </Link>
              </div>

              <div className="border-t border-warm-200 px-4 py-3 dark:border-navy-700">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-charcoal/40 dark:text-navy-500">
                  Settings
                </p>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-navy-700 dark:text-navy-200">Theme</span>
                  <ThemeToggle variant="dark" />
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-navy-700 dark:text-navy-200">Language</span>
                  <LanguageToggle variant="dark" />
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
