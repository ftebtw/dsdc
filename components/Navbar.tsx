"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const NavbarDesktopAuth = dynamic(() => import("./NavbarDesktopAuth"), {
  ssr: false,
  loading: () => <div className="h-8 w-8 animate-pulse rounded-full bg-warm-200 dark:bg-navy-700" />,
});

const NavbarMobilePanel = dynamic(() => import("./NavbarMobilePanel"), {
  ssr: false,
});

const navLinks = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
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
  const solidNavPages = ["/register", "/portal", "/payment", "/pricing"];
  const needsSolidNav = solidNavPages.some((prefix) => pathname.startsWith(prefix));
  const navSolid = scrolled || isOpen || !isDesktop || needsSolidNav;

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
            <Image
              src="/images/logos/logo-full.png"
              alt="DSDC - Online Debate and Public Speaking Classes"
              width={120}
              height={40}
              priority
                  className={`h-11 lg:h-14 w-auto transition-all duration-300 ${
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
            <Link
              href="/book"
              className="inline-flex rounded-full bg-gold-300 px-4 py-2 text-sm font-bold text-navy-900 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-200 hover:shadow-lg"
            >
              {t("nav.book")}
            </Link>
            <NavbarDesktopAuth navSolid={navSolid} />
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

      {isOpen ? (
        <NavbarMobilePanel
          pathname={pathname}
          registerHref={registerHref}
          onClose={() => setIsOpen(false)}
          t={t}
        />
      ) : null}
    </nav>
  );
}
