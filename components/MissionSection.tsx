"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

export default function MissionSection() {
  const { t } = useI18n();

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <AnimatedSection>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src="/images/photos/wsc-group-1.jpg"
                alt="DSDC students at the World Scholar's Cup competition"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/30 to-transparent" />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t("mission.title")}
              </h2>
              <p className="text-lg text-charcoal/70 leading-relaxed mb-8 font-sans">
                {t("mission.text")}
              </p>
              <Link
                href="/team"
                className="inline-flex items-center px-6 py-3 bg-navy-800 text-white font-semibold
                           rounded-lg hover:bg-navy-700 transition-all duration-200 shadow-md
                           hover:shadow-lg hover:-translate-y-0.5"
              >
                {t("mission.cta")}
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
