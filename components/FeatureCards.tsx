"use client";

import { Award, Users, TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

const icons = [Award, Users, TrendingUp];
const keys = ["coaching", "attention", "leadership"];

export default function FeatureCards() {
  const { t } = useI18n();

  return (
    <section className="py-20 md:py-28 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            {t("difference.title")}
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {keys.map((key, i) => {
            const Icon = icons[i];
            return (
              <AnimatedSection key={key} delay={i * 0.15}>
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center group">
                  <div className="w-16 h-16 bg-gold-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gold-100 transition-colors">
                    <Icon className="w-8 h-8 text-gold-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-serif text-navy-800">
                    {t(`difference.cards.${key}.title`)}
                  </h3>
                  <p className="text-charcoal/70 leading-relaxed font-sans">
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
