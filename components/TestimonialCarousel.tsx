"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

export default function TestimonialCarousel() {
  const { t, messages } = useI18n();
  const [current, setCurrent] = useState(0);
  const items = ((messages.testimonials as { items?: Array<{ name: string; role: string; quote: string }> } | undefined)?.items ??
    []) as Array<{
    name: string;
    role: string;
    quote: string;
  }>;

  const total = items.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, total]);

  if (total === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-warm-100 dark:bg-navy-900/50 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[1.5rem] border border-warm-200/70 bg-white px-5 py-6 shadow-sm sm:px-8 md:py-8 dark:border-navy-700/80 dark:[background:linear-gradient(180deg,_rgba(23,35,61,0.98)_0%,_rgba(14,23,42,0.98)_44%,_rgba(10,16,31,1)_100%)] dark:shadow-[0_18px_52px_rgba(0,0,0,0.28)]">
          <AnimatedSection>
            <div
              className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8"
              role="region"
              aria-label="Student testimonials"
            >
              <div className="flex shrink-0 items-center gap-3 md:flex-col md:items-start md:gap-2 md:pr-4 md:border-r md:border-warm-200/70 md:dark:border-navy-700/70">
                <div className="rounded-full bg-gold-400/10 p-2 dark:bg-gold-500/10">
                  <Quote className="h-5 w-5 text-gold-500 dark:text-gold-400" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-navy-800 dark:text-white leading-tight">
                  {t("testimonials.title")}
                </h2>
              </div>

              <div className="relative flex-1" aria-live="polite">
                <blockquote className="text-sm sm:text-base md:text-[1.05rem] text-charcoal/85 dark:text-navy-100 leading-relaxed font-sans italic">
                  &ldquo;{items[current].quote}&rdquo;
                </blockquote>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-100 dark:bg-navy-800 ring-2 ring-white/80 dark:ring-navy-900/80">
                    <span className="text-navy-600 dark:text-navy-100 font-bold text-sm">
                      {items[current].name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-navy-800 dark:text-white font-serif text-sm md:text-base">
                      {items[current].name}
                    </div>
                    <div className="text-xs text-charcoal/60 dark:text-navy-300 font-sans">
                      {items[current].role}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 md:flex-col md:gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={prev}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-warm-50 hover:bg-warm-100 dark:bg-navy-900/60 dark:hover:bg-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="h-4 w-4 text-navy-800 dark:text-navy-100" />
                  </button>
                  <button
                    onClick={next}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-warm-50 hover:bg-warm-100 dark:bg-navy-900/60 dark:hover:bg-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="h-4 w-4 text-navy-800 dark:text-navy-100" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === current
                          ? "bg-gold-400 dark:bg-gold-400 w-5"
                          : "w-1.5 bg-navy-200 hover:bg-navy-300 dark:bg-navy-600 dark:hover:bg-navy-500"
                      }`}
                      aria-label={`Go to testimonial ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
