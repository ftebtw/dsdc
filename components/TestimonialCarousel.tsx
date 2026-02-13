"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

export default function TestimonialCarousel() {
  const { t, locale } = useI18n();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  // Access testimonials array from JSON
  const testimonials = (() => {
    try {
      const items = t("testimonials.items");
      if (typeof items === "string") return [];
      return [];
    } catch {
      return [];
    }
  })();

  // We'll use a different approach: read from the imported JSON directly
  const en = require("@/messages/en.json");
  const zh = require("@/messages/zh.json");
  const msgs = locale === "zh" ? zh : en;
  const items = msgs.testimonials.items as Array<{
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
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            {t("testimonials.title")}
          </h2>
        </AnimatedSection>

        <div className="relative">
          <div className="min-h-[300px] md:min-h-[250px] flex items-center">
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
                <div className="text-center px-4 md:px-12">
                  <Quote className="w-10 h-10 text-gold-400 mx-auto mb-6" />
                  <blockquote className="text-lg md:text-xl text-charcoal/80 leading-relaxed mb-8 font-sans italic">
                    &ldquo;{items[current].quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center">
                      <span className="text-navy-600 font-bold text-lg">
                        {items[current].name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-navy-800 font-serif">
                        {items[current].name}
                      </div>
                      <div className="text-sm text-charcoal/60 font-sans">
                        {items[current].role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6
                       w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center
                       hover:bg-warm-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 text-navy-800" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6
                       w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center
                       hover:bg-warm-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 text-navy-800" />
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
                  ? "bg-gold-400 w-8"
                  : "bg-navy-200 hover:bg-navy-300"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
