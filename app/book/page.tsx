"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Video, CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import ContactForm from "@/components/ContactForm";
import AnimatedSection from "@/components/AnimatedSection";

export default function BookPage() {
  const { t, locale } = useI18n();

  const en = require("@/messages/en.json");
  const zh = require("@/messages/zh.json");
  const msgs = locale === "zh" ? zh : en;
  const expectItems = msgs.bookPage.expectItems as string[];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            {t("bookPage.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-white/80 font-sans"
          >
            {t("bookPage.subtitle")}
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 bg-warm-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calendly + What to Expect */}
            <div className="space-y-8">
              <AnimatedSection>
                <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gold-400/10 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gold-500" />
                    </div>
                    <h3 className="text-xl font-bold text-navy-800 font-serif">Schedule Online</h3>
                  </div>

                  {/* Calendly iframe placeholder */}
                  <div className="rounded-xl border-2 border-dashed border-warm-300 bg-warm-50 min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center p-4 sm:p-8 text-center">
                    <Calendar className="w-16 h-16 text-navy-300 mb-4" />
                    <p className="text-navy-600 font-semibold mb-2">Calendly Booking Widget</p>
                    <p className="text-charcoal/50 text-sm mb-6">Replace this placeholder with your Calendly embed</p>
                    <code className="text-[10px] sm:text-xs bg-navy-800 text-gold-400 px-3 sm:px-4 py-2 rounded-lg font-mono break-all">
                      https://calendly.com/dsdc-placeholder
                    </code>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-6">
                    <div className="flex items-center gap-2 text-sm text-charcoal/60">
                      <Clock className="w-4 h-4 text-gold-500" />
                      <span className="font-sans">15 minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-charcoal/60">
                      <Video className="w-4 h-4 text-gold-500" />
                      <span className="font-sans">Via Zoom</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* What to Expect */}
              <AnimatedSection delay={0.15}>
                <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 md:p-10">
                  <h3 className="text-xl font-bold text-navy-800 mb-6 font-serif">
                    {t("bookPage.expectTitle")}
                  </h3>
                  <ul className="space-y-4">
                    {expectItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                        <span className="text-charcoal/70 font-sans">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            </div>

            {/* Contact form */}
            <AnimatedSection delay={0.2}>
              <ContactForm />
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
