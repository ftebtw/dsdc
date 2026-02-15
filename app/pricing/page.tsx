"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Users, Mic, Globe, Trophy, User, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "@/components/AnimatedSection";

const groupTiers = [
  {
    key: "noviceIntermediate",
    price: "30",
    icon: Users,
    highlight: false,
  },
  {
    key: "publicSpeaking",
    price: "30",
    icon: Mic,
    highlight: false,
  },
  {
    key: "wsc",
    price: "40",
    icon: Globe,
    highlight: true,
  },
  {
    key: "advanced",
    price: "50",
    icon: Trophy,
    highlight: false,
  },
];

export default function PricingPage() {
  const { t } = useI18n();

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-400/20 text-gold-300 text-sm font-medium mb-6"
          >
            <Check className="w-4 h-4" />
            No hidden fees · All rates plus GST
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            {t("pricingPage.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 font-sans max-w-2xl mx-auto"
          >
            {t("pricingPage.subtitle")}
          </motion.p>
        </div>
      </section>

      {/* Group classes grid */}
      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-navy-800 dark:text-white">
              {t("pricingPage.groupClasses")}
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {groupTiers.map((tier, i) => {
              const Icon = tier.icon;
              return (
                <AnimatedSection key={tier.key} delay={i * 0.08}>
                  <div
                    className={`relative rounded-2xl border-2 p-6 sm:p-8 h-full flex flex-col transition-all duration-300 hover:shadow-xl ${
                      tier.highlight
                        ? "border-gold-400 bg-white dark:bg-navy-800 shadow-lg dark:border-gold-500"
                        : "border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 hover:border-gold-200 dark:hover:border-gold-600"
                    }`}
                  >
                    {tier.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gold-400 text-navy-900 text-xs font-bold">
                        Popular
                      </div>
                    )}
                    <div className="w-12 h-12 rounded-xl bg-gold-400/10 dark:bg-gold-500/20 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-gold-500 dark:text-gold-400" />
                    </div>
                    <h3 className="text-lg font-bold text-navy-800 dark:text-white mb-1 font-serif">
                      {t(`pricingPage.${tier.key}`)}
                    </h3>
                    <p className="text-sm text-charcoal/50 dark:text-navy-300 mb-6 font-sans flex-grow">
                      {t(`pricingPage.${tier.key}Desc`)}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-navy-800 dark:text-white">${tier.price}</span>
                      <span className="text-charcoal/50 dark:text-navy-300 text-sm font-sans">
                        {t("pricingPage.perHour")}
                      </span>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Private coaching */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="rounded-2xl border-2 border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800 p-8 sm:p-10 text-center">
              <div className="w-14 h-14 rounded-xl bg-navy-100 dark:bg-navy-700 flex items-center justify-center mx-auto mb-5">
                <User className="w-7 h-7 text-navy-600 dark:text-navy-200" />
              </div>
              <h2 className="text-2xl font-bold text-navy-800 dark:text-white mb-2 font-serif">
                {t("pricingPage.privateCoaching")}
              </h2>
              <p className="text-charcoal/60 dark:text-navy-200 mb-6 font-sans">
                {t("pricingPage.privateDesc")}
              </p>
              <p className="text-xl font-bold text-navy-800 dark:text-white mb-2">
                {t("pricingPage.varies")}
              </p>
              <p className="text-sm text-charcoal/50 dark:text-navy-300 font-sans">
                {t("pricingPage.privateNote")}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-navy-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <div className="flex justify-center mb-6">
              <MessageCircle className="w-12 h-12 text-gold-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {t("pricingPage.cta")}
            </h2>
            <p className="text-white/60 mb-8 font-sans">
              {t("pricingPage.ctaSubtext")}
            </p>
            <Link
              href="/book"
              className="inline-block px-10 py-4 bg-gold-300 text-navy-900 font-bold text-lg rounded-lg hover:bg-gold-200 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {t("pricingPage.cta")}
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
