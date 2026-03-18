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
    <section className="py-16 md:py-20 bg-white dark:bg-navy-900/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-warm-200/70 bg-white px-5 py-10 shadow-sm sm:px-8 md:py-12 dark:border-navy-700/80 dark:[background:linear-gradient(180deg,_rgba(24,36,63,0.98)_0%,_rgba(16,26,46,0.98)_42%,_rgba(10,16,31,1)_100%)] dark:shadow-[0_18px_52px_rgba(0,0,0,0.28)]">
          <AnimatedSection>
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-3xl md:text-[2.2rem] font-bold mb-3 text-navy-800 dark:text-white">{t("howItWorks.title")}</h2>
              <p className="text-charcoal/60 dark:text-navy-100/90 text-base md:text-lg font-sans">{t("howItWorks.subtitle")}</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-14 left-[16.66%] right-[16.66%] h-px bg-gold-200 dark:bg-gradient-to-r dark:from-gold-500/25 dark:via-gold-400 dark:to-gold-500/25" />

            {steps.map((step, i) => {
              const Icon = icons[i];
              return (
                <AnimatedSection key={i} delay={i * 0.15}>
                  <div className="text-center relative rounded-[1.35rem] px-4 py-5 transition-all duration-300 dark:border dark:border-navy-700/70 dark:bg-navy-900/55 dark:shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
                    <div className="w-12 h-12 bg-gold-400 dark:bg-gold-400 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 shadow-lg ring-4 ring-white dark:ring-navy-900/85">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs font-bold text-gold-500 dark:text-gold-300 uppercase tracking-widest mb-2 font-sans">
                      Step {step.step}
                    </div>
                    <h3 className="text-lg md:text-[1.35rem] font-bold text-navy-800 dark:text-white mb-2.5 font-serif">{step.title}</h3>
                    <p className="text-sm md:text-base text-charcoal/60 dark:text-navy-100/90 leading-relaxed font-sans">{step.description}</p>
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
