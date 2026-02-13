"use client";

import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

const competitions = [
  "Canadian National Debate Championships",
  "US National Debate Championships",
  "World University Debating Championships",
  "Stanford Invitational",
  "Princeton Invitational",
  "World Scholar's Cup — Yale",
  "Oxford Schools Championships",
  "Georgetown Public Forum",
  "UBC Debate Tournaments",
  "SFU Worlds Schools Championships",
  "BC Provincial Championships",
  "Harvard Model United Nations",
];

export default function CompetitionLogos() {
  const { t } = useI18n();

  return (
    <section className="py-16 md:py-20 bg-warm-50 border-y border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("competitions.title")}</h2>
            <p className="text-charcoal/50 text-sm font-sans">{t("competitions.subtitle")}</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
            {competitions.map((name, i) => (
              <div
                key={i}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-warm-200 rounded-full text-[11px] sm:text-xs md:text-sm
                           font-medium text-navy-700 shadow-sm hover:shadow-md hover:border-gold-300
                           transition-all duration-200"
              >
                {name}
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
