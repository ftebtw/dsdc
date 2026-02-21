"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Users, Mic, Globe, Trophy, User, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "@/components/AnimatedSection";
import {
  BASE_FX_FALLBACK,
  GROUP_TIERS,
  SUPPORTED_CURRENCIES,
  convertCadPrice,
  formatDisplayPrice,
  type GroupTierKey,
  type SupportedCurrency,
} from "@/lib/pricing";

const tierIcons: Record<GroupTierKey, typeof Users> = {
  noviceIntermediate: Users,
  publicSpeaking: Mic,
  wsc: Globe,
  advanced: Trophy,
};

type FxResponse = {
  rates: Record<SupportedCurrency, number>;
  source: "live" | "cache" | "fallback";
  lastUpdated: string;
};

export default function PricingPage() {
  const { t, locale } = useI18n();
  const [currency, setCurrency] = useState<SupportedCurrency>("CAD");
  const [rates, setRates] = useState<Record<SupportedCurrency, number>>(BASE_FX_FALLBACK);
  const [rateSource, setRateSource] = useState<FxResponse["source"]>("fallback");

  useEffect(() => {
    let ignore = false;

    const loadRates = async () => {
      try {
        const res = await fetch("/api/fx-rates", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as FxResponse;
        if (!ignore && data?.rates) {
          setRates(data.rates);
          setRateSource(data.source);
        }
      } catch {
        // fall back to built-in rates silently
      }
    };

    loadRates();
    return () => {
      ignore = true;
    };
  }, []);

  const groupTiers = useMemo(
    () =>
      GROUP_TIERS.map((tier) => ({
        ...tier,
        icon: tierIcons[tier.key],
      })),
    []
  );

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
            {t("pricingPage.noHiddenFees")}
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-800 dark:text-white">
                {t("pricingPage.groupClasses")}
              </h2>
              <div className="flex items-center gap-3">
                <label htmlFor="currency" className="text-sm font-medium text-navy-700 dark:text-navy-200">
                  {t("pricingPage.currency")}
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                  className="px-3 py-2 rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-sm text-navy-800 dark:text-navy-100"
                >
                  {SUPPORTED_CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {t(`pricingPage.currencyOptions.${code}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {groupTiers.map((tier, i) => {
              const Icon = tier.icon;
              return (
                <AnimatedSection key={tier.key} delay={i * 0.08}>
                  <div
                    className="relative rounded-2xl border-2 p-6 sm:p-8 h-full flex flex-col transition-all duration-300 hover:shadow-xl border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 hover:border-gold-200 dark:hover:border-gold-600"
                  >
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
                      <span className="text-3xl font-bold text-navy-800 dark:text-white">
                        {formatDisplayPrice(
                          convertCadPrice(tier.baseCadPrice, currency, rates),
                          currency,
                          locale
                        )}
                      </span>
                      <span className="text-charcoal/50 dark:text-navy-300 text-sm font-sans">
                        {t("pricingPage.perHour")}
                      </span>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
          <AnimatedSection delay={0.12}>
            <p className="mt-5 text-sm text-charcoal/60 dark:text-navy-300 font-sans">
              {t("pricingPage.currencyDisclaimer")}
              {rateSource !== "live" && ` ${t("pricingPage.currencyFallback")}`}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Private coaching */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="rounded-2xl border border-gold-300/60 dark:border-gold-500/50 bg-gold-50/70 dark:bg-navy-800/90 p-6 sm:p-8 text-center shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-gold-400/20 dark:bg-gold-500/20 flex items-center justify-center mx-auto mb-4">
                <User className="w-7 h-7 text-gold-700 dark:text-gold-300" />
              </div>
              <h2 className="text-2xl font-bold text-navy-800 dark:text-white font-serif">
                {t("pricingPage.privateCoaching")}
              </h2>
              <p className="mt-2 text-charcoal/70 dark:text-navy-200 font-sans">
                {t("pricingPage.privateDesc")}
              </p>
              <div className="my-5 h-px w-20 mx-auto bg-gold-300/70 dark:bg-gold-500/40" />
              <p className="text-3xl font-bold text-navy-900 dark:text-white leading-none">
                {t("pricingPage.varies")}
              </p>
              <p className="mt-3 max-w-xl mx-auto text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
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
