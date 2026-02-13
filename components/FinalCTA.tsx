"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

export default function FinalCTA() {
  const { t } = useI18n();

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 80%, rgba(212,168,67,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212,168,67,0.2) 0%, transparent 50%)",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {t("finalCta.title")}
          </h2>
          <p className="text-lg text-white/80 mb-10 font-sans">
            {t("finalCta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="px-10 py-4 bg-gold-400 text-navy-900 font-semibold text-lg rounded-lg
                         hover:bg-gold-300 transition-all duration-200 shadow-lg hover:shadow-xl
                         hover:-translate-y-0.5"
            >
              {t("finalCta.cta")}
            </Link>
          </div>
          <p className="text-white/50 text-sm mt-6 font-sans">
            {t("finalCta.phone")}
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
