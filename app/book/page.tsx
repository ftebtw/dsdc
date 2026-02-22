"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Video, CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import ContactForm from "@/components/ContactForm";
import AnimatedSection from "@/components/AnimatedSection";

export default function BookPage() {
  const { t, messages } = useI18n();
  const expectItems = ((messages.bookPage as { expectItems?: string[] } | undefined)?.expectItems ??
    []) as string[];

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
      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calendly + What to Expect */}
            <div className="space-y-8">
              <AnimatedSection>
                <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-lg p-5 sm:p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gold-400/10 dark:bg-gold-500/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gold-500 dark:text-gold-400" />
                    </div>
                    <h3 className="text-xl font-bold text-navy-800 dark:text-white font-serif">{t("bookPage.scheduleOnline")}</h3>
                  </div>

                  {/* Calendly iframe placeholder */}
                    <div className="rounded-xl border-2 border-dashed border-warm-300 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center p-4 sm:p-8 text-center">
                      <Calendar className="w-16 h-16 text-navy-300 dark:text-navy-500 mb-4" />
                    <p className="text-navy-600 dark:text-navy-200 font-semibold mb-2">{t("bookPage.calendlyWidgetTitle")}</p>
                    <p className="text-charcoal/50 dark:text-navy-300 text-sm mb-6">{t("bookPage.calendlyWidgetSubtitle")}</p>
                    <code className="text-[10px] sm:text-xs bg-navy-800 dark:bg-navy-700 text-gold-400 px-3 sm:px-4 py-2 rounded-lg font-mono break-all">
                      {t("bookPage.calendlyPlaceholderUrl")}
                    </code>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-6">
                    <div className="flex items-center gap-2 text-sm text-charcoal/60 dark:text-navy-300">
                      <Clock className="w-4 h-4 text-gold-500 dark:text-gold-400" />
                      <span className="font-sans">{t("bookPage.consultationDuration")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-charcoal/60 dark:text-navy-300">
                      <Video className="w-4 h-4 text-gold-500 dark:text-gold-400" />
                      <span className="font-sans">{t("bookPage.consultationMode")}</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* What to Expect */}
              <AnimatedSection delay={0.15}>
                <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-lg p-5 sm:p-8 md:p-10">
                  <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-6 font-serif">
                    {t("bookPage.expectTitle")}
                  </h3>
                  <ul className="space-y-4">
                    {expectItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gold-400 dark:text-gold-500 shrink-0 mt-0.5" />
                        <span className="text-charcoal/70 dark:text-navy-200 font-sans">{item}</span>
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
