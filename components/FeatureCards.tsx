"use client";

import { Award, Users, TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

const icons = [Award, Users, TrendingUp];
const keys = ["coaching", "attention", "leadership"];

export default function FeatureCards() {
  const { t } = useI18n();

  return (
    <section className="py-10 md:py-14 bg-warm-100 dark:bg-navy-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-navy-800 dark:text-white">
            {t("difference.title")}
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6 items-stretch">
          {keys.map((key, i) => {
            const Icon = icons[i];
            return (
              <AnimatedSection key={key} delay={i * 0.1} className="h-full">
                <div className="flex h-full items-start gap-4 rounded-xl bg-white px-5 py-5 shadow-sm dark:bg-navy-800">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-50 dark:bg-gold-900/30">
                    <Icon className="h-5 w-5 text-gold-500 dark:text-gold-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-navy-800 dark:text-white font-serif leading-tight">
                      {t(`difference.cards.${key}.title`)}
                    </h3>
                    <p className="mt-1 text-sm text-charcoal/70 dark:text-navy-200 leading-relaxed font-sans">
                      {t(`difference.cards.${key}.description`)}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
