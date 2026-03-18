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
    <section className="py-20 md:py-28 bg-white dark:bg-navy-900/30 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-warm-200/70 bg-white px-6 py-14 shadow-sm sm:px-10 md:py-16 dark:border-navy-700/80 dark:[background:linear-gradient(180deg,_rgba(23,35,61,0.98)_0%,_rgba(14,23,42,0.98)_44%,_rgba(10,16,31,1)_100%)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 text-navy-800 dark:text-white">
              {t("testimonials.title")}
            </h2>
          </AnimatedSection>

          <div
            className="relative"
            role="region"
            aria-label="Student testimonials"
          >
            <div className="relative min-h-[380px] md:min-h-[310px] flex items-center rounded-[1.75rem] border border-warm-200/80 bg-warm-50/70 px-5 py-8 shadow-sm md:px-16 dark:border-navy-700/80 dark:bg-navy-950/45 dark:shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
              <div className="w-full" aria-live="polite">
                <div className="text-center max-w-3xl mx-auto px-6 md:px-12">
                  <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-gold-400/10 px-4 py-3 dark:bg-gold-500/10">
                      <Quote className="w-10 h-10 text-gold-500 dark:text-gold-400" />
                    </div>
                  </div>
                  <blockquote className="text-xl md:text-[1.85rem] text-charcoal/85 dark:text-navy-100 leading-[1.75] md:leading-[1.6] mb-8 font-sans italic">
                    &ldquo;{items[current].quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-14 h-14 bg-navy-100 dark:bg-navy-800 rounded-full flex items-center justify-center ring-4 ring-white/80 dark:ring-navy-900/80">
                      <span className="text-navy-600 dark:text-navy-100 font-bold text-lg">
                        {items[current].name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-navy-800 dark:text-white font-serif text-lg">
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
                       w-11 h-11 bg-white/90 dark:bg-navy-900/85 rounded-full shadow-lg flex items-center justify-center
                       hover:bg-warm-100 dark:hover:bg-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5 text-navy-800 dark:text-navy-100" />
              </button>
              <button
                onClick={next}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2
                       w-11 h-11 bg-white/90 dark:bg-navy-900/85 rounded-full shadow-lg flex items-center justify-center
                       hover:bg-warm-100 dark:hover:bg-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5 text-navy-800 dark:text-navy-100" />
              </button>
            </div>
          </div>

          <div className="flex md:hidden justify-center gap-3 mt-5">
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

          <div className="flex justify-center gap-2 mt-8">
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
