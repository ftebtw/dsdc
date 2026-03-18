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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-warm-200/70 bg-white px-6 py-14 shadow-sm sm:px-10 md:py-16 dark:border-navy-700/80 dark:bg-[radial-gradient(circle_at_top,_rgba(229,179,58,0.14),_rgba(18,28,49,0.98)_38%,_rgba(10,16,31,1)_100%)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navy-800 dark:text-white">{t("howItWorks.title")}</h2>
              <p className="text-charcoal/60 dark:text-navy-100/90 text-lg font-sans">{t("howItWorks.subtitle")}</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-px bg-gold-200 dark:bg-gradient-to-r dark:from-gold-500/25 dark:via-gold-400 dark:to-gold-500/25" />

            {steps.map((step, i) => {
              const Icon = icons[i];
              return (
                <AnimatedSection key={i} delay={i * 0.15}>
                  <div className="text-center relative rounded-2xl px-5 py-6 transition-all duration-300 dark:border dark:border-navy-700/70 dark:bg-navy-900/55 dark:shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
                    <div className="w-14 h-14 bg-gold-400 dark:bg-gold-400 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg ring-8 ring-white dark:ring-navy-900/85">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xs font-bold text-gold-500 dark:text-gold-300 uppercase tracking-widest mb-2 font-sans">
                      Step {step.step}
                    </div>
                    <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-3 font-serif">{step.title}</h3>
                    <p className="text-charcoal/60 dark:text-navy-100/90 leading-relaxed font-sans">{step.description}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
