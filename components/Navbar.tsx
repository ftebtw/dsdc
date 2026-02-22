"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/", key: "nav.home" },
  { href: "/pricing", key: "nav.pricing" },
  { href: "/team", key: "nav.team" },
  { href: "/classes", key: "nav.classes" },
  { href: "/awards", key: "nav.awards" },
  { href: "/blog", key: "nav.blog" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();
  const { t, locale } = useI18n();

  const registerHref = `/register?lang=${locale === "zh" ? "zh" : "en"}`;
  const navSolid = scrolled || isOpen || !isDesktop;

  const navBackgroundClass = navSolid
    ? isDesktop
      ? "bg-white/90 dark:bg-navy-900/90 backdrop-blur-md shadow-lg dark:shadow-black/20 border-b border-warm-200/70 dark:border-navy-700/70"
      : "bg-white dark:bg-navy-900 shadow-lg dark:shadow-black/20 border-b border-warm-200 dark:border-navy-700"
    : "bg-transparent border-b border-transparent";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBackgroundClass}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-[74px] items-center justify-between gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <img
              src="/images/logos/logo-full.png"
              alt="DSDC Logo"
              className={`h-9 lg:h-11 w-auto transition-all duration-300 ${
                navSolid ? "dark:brightness-0 dark:invert" : "brightness-0 invert"
              }`}
            />
          </Link>

          <div className="hidden lg:flex min-w-0 flex-1 items-center justify-center px-4">
            <div
              className={`inline-flex items-center gap-1 rounded-full border p-1 ${
                navSolid
                  ? "border-warm-300 bg-white/85 dark:border-navy-600 dark:bg-navy-800/90"
                  : "border-white/25 bg-white/10"
              }`}
            >
              {navLinks.map((link) => {
                const active = pathname === link.href;
                const activeClass = navSolid
                  ? "bg-navy-800 text-white dark:bg-navy-600 dark:text-white"
                  : "bg-white/18 text-white";
                const inactiveClass = navSolid
                  ? "text-charcoal hover:bg-warm-100 hover:text-navy-800 dark:text-navy-100 dark:hover:bg-navy-700 dark:hover:text-white"
                  : "text-white/85 hover:bg-white/12 hover:text-white";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                      active ? activeClass : inactiveClass
                    }`}
                  >
                    {t(link.key)}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden lg:flex shrink-0 items-center gap-2">
            <div
              className={`mr-1 flex items-center gap-2 border-r pr-3 ${
                navSolid ? "border-warm-300 dark:border-navy-600" : "border-white/30"
              }`}
            >
              <ThemeToggle variant={navSolid ? "dark" : "light"} />
              <LanguageToggle variant={navSolid ? "dark" : "light"} />
            </div>

            <Link
              href="/portal/login"
              className={`hidden xl:inline-flex rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                navSolid
                  ? "text-navy-800 hover:text-navy-900 dark:text-navy-100 dark:hover:text-white"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {t("nav.portalLogin")}
            </Link>

            <Link
              href={registerHref}
              className={`inline-flex rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                navSolid
                  ? "border border-warm-300 bg-warm-100 text-navy-900 hover:bg-warm-200 dark:border-navy-500 dark:bg-navy-800 dark:text-navy-100 dark:hover:bg-navy-700"
                  : "border border-white/35 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {t("nav.register")}
            </Link>

            <Link
              href="/book"
              className="inline-flex rounded-full bg-gold-300 px-4 py-2 text-sm font-bold text-navy-900 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-200 hover:shadow-lg"
            >
              {t("nav.book")}
            </Link>
          </div>

          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="lg:hidden flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className={`h-6 w-6 ${navSolid ? "text-charcoal dark:text-navy-100" : "text-white"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${navSolid ? "text-charcoal dark:text-navy-100" : "text-white"}`} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 top-16 z-40 bg-black/35 backdrop-blur-[2px] lg:hidden"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="ml-auto h-full w-full max-w-sm overflow-y-auto border-l border-warm-200 bg-white px-5 pb-8 pt-6 dark:border-navy-700 dark:bg-navy-900"
            >
              <div className="space-y-5">
                <div className="rounded-2xl border border-warm-200 bg-warm-50 p-4 dark:border-navy-700 dark:bg-navy-800">
                  <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-navy-600 dark:text-navy-200">
                    Explore
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
                    >
                      {t(link.key)}
                    </Link>
                  ))}
                </div>

                <div className="rounded-2xl border border-warm-200 p-4 dark:border-navy-700">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy-600 dark:text-navy-200">
                    Display
                  </p>
                  <div className="flex items-center gap-3">
                    <ThemeToggle variant="dark" />
                    <LanguageToggle />
                  </div>
                </div>

                <div className="space-y-2 rounded-2xl border border-warm-200 p-4 dark:border-navy-700">
                  <p className="pb-1 text-xs font-semibold uppercase tracking-wide text-navy-600 dark:text-navy-200">
                    Actions
                  </p>
                  <Link
                    href={registerHref}
                    className="block w-full rounded-lg border border-warm-300 px-4 py-3 text-center text-sm font-semibold text-navy-900 dark:border-navy-600 dark:text-navy-100"
                  >
                    {t("nav.register")}
                  </Link>
                  <Link
                    href="/book"
                    className="block w-full rounded-lg bg-gold-300 px-4 py-3 text-center text-sm font-bold text-navy-900"
                  >
                    {t("nav.book")}
                  </Link>
                  <Link
                    href="/portal/login"
                    className="block w-full rounded-lg border border-warm-300 px-4 py-3 text-center text-sm text-charcoal dark:border-navy-600 dark:text-navy-100"
                  >
                    {t("nav.portalLogin")}
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
