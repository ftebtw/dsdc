"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

interface CounterProps {
  value: string;
  label: string;
  delay: number;
}

function Counter({ value, label, delay }: CounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const hasAnimatedRef = useRef(false);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    const numericMatch = value.match(/(\d+)/);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const target = parseInt(numericMatch[1]);
    const suffix = value.replace(/\d+/, "");
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let current = 0;
    setDisplayValue(`0${suffix}`);

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += Math.ceil(target / steps);
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setDisplayValue(`${current}${suffix}`);
      }, stepDuration);

      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [isInView, value, delay]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-navy-800 dark:text-gold-300 font-serif leading-none">
        {displayValue}
      </div>
      <div className="mt-1.5 text-[0.7rem] md:text-xs text-charcoal/60 dark:text-navy-200 font-sans uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

const statItems = [
  { value: "5000+", labelKey: "stats.students" },
  { value: "7+", labelKey: "stats.years" },
  { value: "100%", labelKey: "stats.wscRate" },
  { value: "20+", labelKey: "stats.coaches" },
];

const fallbackCompetitions = [
  "Canadian National Debate Championships",
  "US National Debate Championships",
  "World University Debating Championships",
  "Stanford Invitational",
  "Princeton Invitational",
  "World Scholar's Cup - Yale",
  "Oxford Schools Championships",
  "Georgetown Public Forum",
  "UBC Debate Tournaments",
  "SFU Worlds Schools Championships",
  "BC Provincial Championships",
  "Harvard Model United Nations",
];

export default function ProofStrip() {
  const { t, messages } = useI18n();
  const competitionItems =
    ((messages.competitions as { items?: string[] } | undefined)?.items ?? fallbackCompetitions) as string[];

  return (
    <section className="stats-section border-y border-warm-200 bg-warm-50 py-10 md:py-14 dark:border-navy-800 dark:bg-navy-900/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-10">
          {statItems.map((stat, i) => (
            <Counter
              key={stat.labelKey}
              value={stat.value}
              label={t(stat.labelKey)}
              delay={i * 0.12}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="my-8 h-px w-full bg-warm-200 dark:bg-navy-800 md:my-10" />

        {/* Competitions */}
        <AnimatedSection>
          <p className="mb-4 text-center text-[0.7rem] md:text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300/80">
            {t("competitions.title")}
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
            {competitionItems.map((name, i) => (
              <div
                key={i}
                className="rounded-full border border-warm-200 bg-white px-3 py-1.5 text-[11px] sm:text-xs font-medium text-navy-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100 dark:hover:border-gold-500"
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
