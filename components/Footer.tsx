"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Instagram, Linkedin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "./LanguageToggle";

export default function Footer() {
  const { t, locale } = useI18n();
  const registerHref = `/register?lang=${locale === "zh" ? "zh" : "en"}`;
  const currentYear = new Date().getFullYear();
  const footerTagline = t("footer.tagline");
  const footerCopyright = t("footer.copyright").replace(
    "{year}",
    String(currentYear)
  );

  return (
    <footer className="bg-navy-800 dark:bg-navy-900 text-white border-t border-navy-700 dark:border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="mb-4 inline-flex items-center gap-3">
              <Image
                src="/images/logos/logo-full.png"
                alt="DSDC"
                width={120}
                height={40}
                loading="lazy"
                className="h-10 w-auto brightness-0 invert"
              />
              <span className="text-lg font-bold tracking-wide text-white">DSDC</span>
            </Link>
            <p className="text-navy-200 text-sm leading-relaxed">
              {footerTagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-4">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link href="/classes" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("nav.classes")}
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("footer.compare")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("nav.blog")}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("nav.pricing")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("footer.contactPage")}
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("nav.book")}
                </Link>
              </li>
              <li>
                <Link href={registerHref} className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("nav.register")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-4">
              {locale === "zh" ? "课程项目" : "Programs"}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/online-debate-classes" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {locale === "zh" ? "在线辩论课程" : "Online Debate Classes"}
                </Link>
              </li>
              <li>
                <Link href="/public-speaking-classes-for-kids" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {locale === "zh" ? "青少年演讲课" : "Public Speaking for Kids"}
                </Link>
              </li>
              <li>
                <Link href="/world-scholars-cup-coaching" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {locale === "zh" ? "世界学者杯辅导" : "World Scholar's Cup"}
                </Link>
              </li>
              <li>
                <Link href="/debate-classes-for-beginners" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {locale === "zh" ? "初学者辩论课" : "Debate for Beginners"}
                </Link>
              </li>
              <li>
                <Link href="/debate-classes-canada" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {locale === "zh" ? "加拿大辩论课程" : "Debate Classes Canada"}
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
                  href={`mailto:${t("footer.companyEmail")}`}
                  className="text-navy-200 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {t("footer.companyEmail")}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-4">
              {t("legal.footerTitle")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("legal.links.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("legal.links.terms")}
                </Link>
              </li>
              <li>
                <Link href="/cancellation" className="text-navy-200 hover:text-white text-sm transition-colors">
                  {t("legal.links.cancellation")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social + Language */}
          <div>
            <h3 className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-4">
              {t("footer.social")}
            </h3>
            <div className="flex gap-4 mb-6">
              <a
                href={t("footer.instagramUrl")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-200 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={t("footer.linkedinUrl")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-200 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <LanguageToggle variant="light" />
          </div>
        </div>

        <div className="border-t border-navy-700 mt-12 pt-8 pb-4 text-center">
          <p className="text-navy-200 mb-4 text-sm">{t("footer.ctaText")}</p>
          <Link
            href="/book"
            className="inline-block bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {t("footer.ctaButton")}
          </Link>
        </div>

        <div className="pt-4 text-center">
          <p className="text-navy-300 text-xs">
            {footerCopyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
