"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";
import { faqEntries } from "@/lib/faqEntries";

const HOMEPAGE_FAQ_LIMIT = 4;

export default function FAQ() {
  const { t, messages, locale } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const allItems = ((messages.faq as { items?: Array<{ q: string; a: string }> } | undefined)?.items ?? []) as Array<{
    q: string;
    a: string;
  }>;
  const items = allItems.slice(0, HOMEPAGE_FAQ_LIMIT);
  const hasMore = allItems.length > HOMEPAGE_FAQ_LIMIT;
  // Per-question deep links only exist for the EN locale right now. faqEntries
  // is ordered to match messages.faq.items, so we index-align to get the slug.
  const getSlug = (index: number) =>
    locale === "en" && index < faqEntries.length ? faqEntries[index].slug : null;

  return (
    <section className="faq-section py-12 md:py-16 bg-white dark:bg-navy-900/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="text-3xl md:text-[2.2rem] font-bold text-center mb-10 text-navy-800 dark:text-white">
            {t("faq.title")}
          </h2>
        </AnimatedSection>

        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            const shouldShowBeginnersLink = i === 3;
            const shouldShowCanadaGuideLink = i === 3;
            const slug = getSlug(i);
            return (
              <AnimatedSection key={i} delay={i * 0.05}>
                <div className="bg-white dark:bg-navy-800 rounded-xl overflow-hidden shadow-sm border border-warm-200 dark:border-navy-700">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-warm-50 dark:hover:bg-navy-700/50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-navy-800 dark:text-navy-100 font-semibold pr-3 sm:pr-4 text-sm sm:text-base font-sans">
                      {item.q}
                    </span>
                    <span className="shrink-0 w-8 h-8 rounded-full bg-navy-800 dark:bg-navy-600 flex items-center justify-center">
                      {isOpen ? <Minus className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
                    </span>
                  </button>
                  {isOpen ? (
                    <div className="overflow-hidden">
                      <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm sm:text-base text-charcoal/70 dark:text-navy-200 leading-relaxed font-sans">
                        {item.a}
                      </p>
                      {shouldShowBeginnersLink ? (
                        <p className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-3 text-sm font-medium text-navy-700 dark:text-gold-300">
                          {t("faq.beginnersLinkLead")}{" "}
                          <Link
                            href="/debate-classes-for-beginners"
                            className="underline underline-offset-4 hover:text-gold-400 transition-colors"
                          >
                            {t("faq.beginnersLinkText")}
                          </Link>
                          .
                        </p>
                      ) : null}
                      {shouldShowCanadaGuideLink ? (
                        <p className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-3 text-sm font-medium text-navy-700 dark:text-gold-300">
                          {t("faq.guideLinkLead")}{" "}
                          <Link
                            href="/guide-to-debate-in-canada"
                            className="underline underline-offset-4 hover:text-gold-400 transition-colors"
                          >
                            {t("faq.guideLinkText")}
                          </Link>
                          .
                        </p>
                      ) : null}
                      {slug ? (
                        <p className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-3 text-sm font-semibold">
                          <Link
                            href={`/faq/${slug}`}
                            className="inline-flex items-center gap-1 text-navy-800 underline underline-offset-4 hover:text-gold-500 dark:text-gold-300 dark:hover:text-gold-200"
                          >
                            Read the full answer →
                          </Link>
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </AnimatedSection>
            );
          })}
        </div>
        {hasMore ? (
          <div className="mt-8 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy-800 underline underline-offset-4 transition-colors hover:text-gold-500 dark:text-gold-300 dark:hover:text-gold-200"
            >
              Read every question on our FAQ page →
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
