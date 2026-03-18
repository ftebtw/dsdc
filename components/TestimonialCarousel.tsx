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
    <section className="py-16 md:py-20 bg-white dark:bg-navy-900/30 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-warm-200/70 bg-white px-5 py-10 shadow-sm sm:px-8 md:py-12 dark:border-navy-700/80 dark:[background:linear-gradient(180deg,_rgba(23,35,61,0.98)_0%,_rgba(14,23,42,0.98)_44%,_rgba(10,16,31,1)_100%)] dark:shadow-[0_18px_52px_rgba(0,0,0,0.28)]">
          <AnimatedSection>
            <h2 className="text-3xl md:text-[2.2rem] font-bold text-center mb-10 text-navy-800 dark:text-white">
              {t("testimonials.title")}
            </h2>
          </AnimatedSection>

          <div
            className="relative"
            role="region"
            aria-label="Student testimonials"
          >
            <div className="relative min-h-[280px] md:min-h-[240px] flex items-center rounded-[1.4rem] border border-warm-200/80 bg-warm-50/70 px-4 py-6 shadow-sm md:px-12 dark:border-navy-700/80 dark:bg-navy-950/45 dark:shadow-[0_14px_32px_rgba(0,0,0,0.18)]">
              <div className="w-full" aria-live="polite">
                <div className="text-center max-w-2xl mx-auto px-5 md:px-10">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-gold-400/10 px-3 py-2.5 dark:bg-gold-500/10">
                      <Quote className="w-8 h-8 text-gold-500 dark:text-gold-400" />
                    </div>
                  </div>
                  <blockquote className="text-lg md:text-[1.35rem] text-charcoal/85 dark:text-navy-100 leading-[1.7] md:leading-[1.65] mb-6 font-sans italic">
                    &ldquo;{items[current].quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-navy-100 dark:bg-navy-800 rounded-full flex items-center justify-center ring-4 ring-white/80 dark:ring-navy-900/80">
                      <span className="text-navy-600 dark:text-navy-100 font-bold text-base">
                        {items[current].name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-navy-800 dark:text-white font-serif text-base md:text-lg">
                        {items[current].name}
                      </div>
                      <div className="text-sm text-charcoal/60 dark:text-navy-300 font-sans">
                        {items[current].role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={prev}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2
                       w-10 h-10 bg-white/90 dark:bg-navy-900/85 rounded-full shadow-lg flex items-center justify-center
                       hover:bg-warm-100 dark:hover:bg-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5 text-navy-800 dark:text-navy-100" />
              </button>
              <button
                onClick={next}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2
                       w-10 h-10 bg-white/90 dark:bg-navy-900/85 rounded-full shadow-lg flex items-center justify-center
                       hover:bg-warm-100 dark:hover:bg-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5 text-navy-800 dark:text-navy-100" />
              </button>
            </div>
          </div>

          <div className="flex md:hidden justify-center gap-3 mt-4">
            <button
              onClick={prev}
              className="w-10 h-10 bg-white dark:bg-navy-900/85 rounded-full shadow-lg flex items-center justify-center hover:bg-warm-100 dark:hover:bg-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-navy-800 dark:text-navy-100" />
            </button>
            <button
              onClick={next}
              className="w-10 h-10 bg-white dark:bg-navy-900/85 rounded-full shadow-lg flex items-center justify-center hover:bg-warm-100 dark:hover:bg-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-navy-800 dark:text-navy-100" />
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? "bg-gold-400 dark:bg-gold-400 w-8"
                    : "w-2.5 bg-navy-200 hover:bg-navy-300 dark:bg-navy-600 dark:hover:bg-navy-500"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
