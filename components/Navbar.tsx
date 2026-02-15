"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "./LanguageToggle";

const navLinks = [
  { href: "/", key: "nav.home" },
  { href: "/team", key: "nav.team" },
  { href: "/classes", key: "nav.classes" },
  { href: "/awards", key: "nav.awards" },
  { href: "/blog", key: "nav.blog" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
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
                scrolled ? "" : "brightness-0 invert"
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
                    ? scrolled
                      ? "text-navy-800 border-b-2 border-gold-400 pb-0.5"
                      : "text-white border-b-2 border-gold-400 pb-0.5"
                    : scrolled
                    ? "text-charcoal hover:text-navy-800"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
            <LanguageToggle variant={scrolled ? "dark" : "light"} />
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
            className="md:hidden p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className={`w-6 h-6 ${scrolled ? "text-charcoal" : "text-white"}`} />
            ) : (
              <Menu className={`w-6 h-6 ${scrolled ? "text-charcoal" : "text-white"}`} />
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
            className="fixed inset-0 top-16 bg-white z-40 md:hidden"
          >
            <div className="flex flex-col items-center gap-6 pt-12 px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-lg font-medium ${
                    pathname === link.href
                      ? "text-navy-800 border-b-2 border-gold-400"
                      : "text-charcoal hover:text-navy-800"
                  }`}
                >
                  {t(link.key)}
                </Link>
              ))}
              <LanguageToggle />
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
