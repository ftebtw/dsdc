"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

export default function FAQ() {
  const { t, locale } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const en = require("@/messages/en.json");
  const zh = require("@/messages/zh.json");
  const msgs = locale === "zh" ? zh : en;
  const items = msgs.faq.items as Array<{ q: string; a: string }>;

  return (
    <section className="py-20 md:py-28 bg-warm-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t("faq.title")}
          </h2>
        </AnimatedSection>

        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <AnimatedSection key={i} delay={i * 0.05}>
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-warm-200">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-warm-50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-navy-800 font-semibold pr-3 sm:pr-4 text-sm sm:text-base font-sans">{item.q}</span>
                    <span className="shrink-0 w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center">
                      {isOpen ? (
                        <Minus className="w-4 h-4 text-white" />
                      ) : (
                        <Plus className="w-4 h-4 text-white" />
                      )}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm sm:text-base text-charcoal/70 leading-relaxed font-sans">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
