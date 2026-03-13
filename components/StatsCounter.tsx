"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

interface CounterProps {
  value: string;
  label: string;
  delay: number;
}

function Counter({ value, label, delay }: CounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [displayValue, setDisplayValue] = useState("0");

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
    if (!isInView) return;

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
      <div className="text-4xl md:text-5xl font-bold text-gold-400 font-serif mb-2">
        {isInView ? displayValue : "0"}
      </div>
      <div className="text-sm md:text-base text-white/80 font-sans uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

const statKeys = [
  { valueKey: "stats.studentsValue", labelKey: "stats.students" },
  { valueKey: "stats.yearsValue", labelKey: "stats.years" },
  { valueKey: "stats.wscRateValue", labelKey: "stats.wscRate" },
  { valueKey: "stats.coachesValue", labelKey: "stats.coaches" },
];

export default function StatsCounter() {
  const { t } = useI18n();

  return (
    <section className="py-20 md:py-24 bg-navy-800 relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {statKeys.map((stat, i) => (
            <Counter
              key={stat.valueKey}
              value={t(stat.valueKey)}
              label={t(stat.labelKey)}
              delay={i * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
