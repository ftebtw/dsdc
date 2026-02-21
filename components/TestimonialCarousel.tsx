"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

export default function TestimonialCarousel() {
  const { t, messages } = useI18n();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const items = ((messages.testimonials as { items?: Array<{ name: string; role: string; quote: string }> } | undefined)?.items ??
    []) as Array<{
    name: string;
    role: string;
    quote: string;
  }>;

  const total = items.length;

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  if (total === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-navy-900/30 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-navy-800 dark:text-white">
            {t("testimonials.title")}
          </h2>
        </AnimatedSection>

        <div className="relative">
          <div className="min-h-[340px] md:min-h-[250px] flex items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full"
              >
                <div className="text-center max-w-3xl mx-auto px-8 md:px-20 lg:px-24">
                  <Quote className="w-10 h-10 text-gold-400 dark:text-gold-500 mx-auto mb-6" />
                  <blockquote className="text-lg md:text-xl text-charcoal/80 dark:text-navy-200 leading-relaxed mb-8 font-sans italic">
                    &ldquo;{items[current].quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-navy-100 dark:bg-navy-700 rounded-full flex items-center justify-center">
                      <span className="text-navy-600 dark:text-navy-200 font-bold text-lg">
                        {items[current].name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-navy-800 dark:text-white font-serif">
                        {items[current].name}
                      </div>
                      <div className="text-sm text-charcoal/60 dark:text-navy-300 font-sans">
                        {items[current].role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Desktop navigation arrows */}
          <button
            onClick={prev}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 lg:-translate-x-14
                       w-10 h-10 bg-white dark:bg-navy-800 rounded-full shadow-lg flex items-center justify-center
                       hover:bg-warm-100 dark:hover:bg-navy-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 text-navy-800 dark:text-navy-100" />
          </button>
          <button
            onClick={next}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 lg:translate-x-14
                       w-10 h-10 bg-white dark:bg-navy-800 rounded-full shadow-lg flex items-center justify-center
                       hover:bg-warm-100 dark:hover:bg-navy-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 text-navy-800 dark:text-navy-100" />
          </button>
        </div>

        {/* Mobile navigation arrows */}
        <div className="flex md:hidden justify-center gap-3 mt-5">
          <button
            onClick={prev}
            className="w-10 h-10 bg-white dark:bg-navy-800 rounded-full shadow-lg flex items-center justify-center hover:bg-warm-100 dark:hover:bg-navy-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 text-navy-800 dark:text-navy-100" />
          </button>
          <button
            onClick={next}
            className="w-10 h-10 bg-white dark:bg-navy-800 rounded-full shadow-lg flex items-center justify-center hover:bg-warm-100 dark:hover:bg-navy-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 text-navy-800 dark:text-navy-100" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-gold-400 dark:bg-gold-500 w-8"
                  : "bg-navy-200 hover:bg-navy-300 dark:bg-navy-600 dark:hover:bg-navy-500"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
