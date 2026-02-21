"use client";

import { Phone, UserCheck, Monitor } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

const icons = [Phone, UserCheck, Monitor];

export default function HowItWorks() {
  const { t, messages } = useI18n();
  const steps = ((messages.howItWorks as { steps?: Array<{ step: string; title: string; description: string }> } | undefined)?.steps ??
    []) as Array<{ step: string; title: string; description: string }>;

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-navy-900/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navy-800 dark:text-white">{t("howItWorks.title")}</h2>
            <p className="text-charcoal/60 dark:text-navy-200 text-lg font-sans">{t("howItWorks.subtitle")}</p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-0.5 bg-gold-200 dark:bg-gold-600" />

          {steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <AnimatedSection key={i} delay={i * 0.15}>
                <div className="text-center relative">
                  <div className="w-14 h-14 bg-gold-400 dark:bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs font-bold text-gold-500 dark:text-gold-400 uppercase tracking-widest mb-2 font-sans">
                    Step {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-3 font-serif">{step.title}</h3>
                  <p className="text-charcoal/60 dark:text-navy-200 leading-relaxed font-sans">{step.description}</p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
