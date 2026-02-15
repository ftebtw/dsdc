"use client";

import Link from "next/link";
import { Mail, Phone, Facebook, Instagram, Youtube } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "./LanguageToggle";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-navy-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img
              src="/images/logos/logo-full.png"
              alt="DSDC Logo"
              className="h-10 w-auto brightness-0 invert mb-4"
            />
            <p className="text-navy-200 text-sm leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-4">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("nav.team")}
                </Link>
              </li>
              <li>
                <Link href="/classes" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("nav.classes")}
                </Link>
              </li>
              <li>
                <Link href="/awards" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("nav.awards")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("nav.blog")}
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("nav.book")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-4">
              {t("footer.contact")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contact@dsdc.ca"
                  className="text-navy-200 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {t("footer.email")}
                </a>
              </li>
              <li>
                <a
                  href="tel:+16040000000"
                  className="text-navy-200 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {t("footer.phone")}
                </a>
              </li>
            </ul>
          </div>

          {/* Social + Language */}
          <div>
            <h3 className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-4">
              {t("footer.social")}
            </h3>
            <div className="flex gap-4 mb-6">
              <a href="#" className="text-navy-200 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-navy-200 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-navy-200 hover:text-white transition-colors" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            <LanguageToggle />
          </div>
        </div>

        <div className="border-t border-navy-700 mt-12 pt-8 text-center">
          <p className="text-navy-300 text-xs">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
