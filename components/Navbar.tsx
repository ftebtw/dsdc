"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/", key: "nav.home" },
  { href: "/team", key: "nav.team" },
  { href: "/classes", key: "nav.classes" },
  { href: "/awards", key: "nav.awards" },
  { href: "/blog", key: "nav.blog" },
  { href: "/pricing", key: "nav.pricing" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();
  const { t } = useI18n();
  const navSolid = scrolled || isOpen || !isDesktop;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        navSolid
          ? "bg-white/95 dark:bg-navy-900 backdrop-blur-md shadow-lg dark:shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/images/logos/logo-full.png"
              alt="DSDC Logo"
              className={`h-10 md:h-14 w-auto transition-all duration-300 ${
                navSolid ? "dark:brightness-0 dark:invert" : "brightness-0 invert"
              }`}
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  pathname === link.href
                    ? navSolid
                      ? "text-navy-800 dark:text-white border-b-2 border-gold-400 pb-0.5"
                      : "text-white border-b-2 border-gold-400 pb-0.5"
                    : navSolid
                    ? "text-charcoal hover:text-navy-800 dark:text-navy-100 dark:hover:text-white"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
            <ThemeToggle variant={navSolid ? "dark" : "light"} />
            <LanguageToggle variant={navSolid ? "dark" : "light"} />
            <Link
              href="/book"
              className="px-5 py-2.5 bg-gold-300 text-navy-900 text-sm font-bold rounded-lg
                         hover:bg-gold-200 transition-all duration-200 shadow-md hover:shadow-lg
                         hover:-translate-y-0.5"
            >
              {t("nav.book")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className={`w-6 h-6 ${navSolid ? "text-charcoal dark:text-navy-100" : "text-white"}`} />
            ) : (
              <Menu className={`w-6 h-6 ${navSolid ? "text-charcoal dark:text-navy-100" : "text-white"}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 top-16 bg-white dark:bg-navy-900 z-40 md:hidden"
          >
            <div className="flex flex-col items-center gap-6 pt-12 px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-lg font-medium ${
                    pathname === link.href
                      ? "text-navy-800 dark:text-white border-b-2 border-gold-400"
                      : "text-charcoal dark:text-navy-200 hover:text-navy-800 dark:hover:text-white"
                  }`}
                >
                  {t(link.key)}
                </Link>
              ))}
              <div className="flex items-center gap-3">
                <ThemeToggle variant="dark" />
                <LanguageToggle />
              </div>
              <Link
                href="/book"
                className="w-full text-center px-6 py-3 bg-gold-300 text-navy-900 font-bold
                           rounded-lg hover:bg-gold-200 transition-colors shadow-md"
              >
                {t("nav.book")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
