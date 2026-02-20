"use client";

import { Award, Users, TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

const icons = [Award, Users, TrendingUp];
const keys = ["coaching", "attention", "leadership"];

export default function FeatureCards() {
  const { t } = useI18n();

  return (
    <section className="py-20 md:py-28 bg-warm-100 dark:bg-navy-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-navy-800 dark:text-white">
            {t("difference.title")}
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {keys.map((key, i) => {
            const Icon = icons[i];
            return (
              <AnimatedSection key={key} delay={i * 0.15} className="h-full">
                <div className="h-full bg-white dark:bg-navy-800 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center group flex flex-col">
                  <div className="w-16 h-16 bg-gold-50 dark:bg-gold-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gold-100 dark:group-hover:bg-gold-800/40 transition-colors">
                    <Icon className="w-8 h-8 text-gold-500 dark:text-gold-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-serif text-navy-800 dark:text-white min-h-[56px] flex items-center justify-center leading-tight line-clamp-2">
                    {t(`difference.cards.${key}.title`)}
                  </h3>
                  <p className="text-charcoal/70 dark:text-navy-200 leading-relaxed font-sans min-h-[96px] line-clamp-4">
                    {t(`difference.cards.${key}.description`)}
                  </p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
