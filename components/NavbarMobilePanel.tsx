"use client";

import Link from "next/link";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import NavbarMobileActions from "./NavbarMobileActions";

const navLinks = [
  { href: "/", key: "nav.home" },
  { href: "/pricing", key: "nav.pricing" },
  { href: "/team", key: "nav.team" },
  { href: "/classes", key: "nav.classes" },
  { href: "/awards", key: "nav.awards" },
  { href: "/blog", key: "nav.blog" },
];

export default function NavbarMobilePanel({
  pathname,
  registerHref,
  onClose,
  t,
}: {
  pathname: string;
  registerHref: string;
  onClose: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="fixed inset-0 top-16 z-40 bg-black/35 backdrop-blur-[2px] lg:hidden">
      <div className="ml-auto h-full w-full max-w-sm overflow-y-auto border-l border-warm-200 bg-white px-5 pb-8 pt-6 dark:border-navy-700 dark:bg-navy-900">
        <div className="space-y-5">
          <div className="rounded-2xl border border-warm-200 bg-warm-50 p-4 dark:border-navy-700 dark:bg-navy-800">
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-navy-600 dark:text-navy-200">
              {t("nav.explore")}
            </p>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-gold-300 text-navy-900"
                    : "text-charcoal hover:bg-warm-100 dark:text-navy-100 dark:hover:bg-navy-700"
                }`}
                onClick={onClose}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div className="rounded-2xl border border-warm-200 p-4 dark:border-navy-700">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy-600 dark:text-navy-200">
              {t("nav.display")}
            </p>
            <div className="flex items-center gap-3">
              <ThemeToggle variant="dark" />
              <LanguageToggle />
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-warm-200 p-4 dark:border-navy-700">
            <p className="pb-1 text-xs font-semibold uppercase tracking-wide text-navy-600 dark:text-navy-200">
              {t("nav.actions")}
            </p>
            <NavbarMobileActions registerHref={registerHref} onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}
