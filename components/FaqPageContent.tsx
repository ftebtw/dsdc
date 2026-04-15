"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { faqEntries } from "@/lib/faqEntries";

export default function FaqPageContent() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 pb-16 pt-32 md:pb-20 md:pt-40">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-5 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            {t("faqPage.title")}
          </h1>
          <p className="mx-auto max-w-3xl text-lg font-sans leading-relaxed text-white/80">
            {t("faqPage.subtitle")}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="mb-10 text-center text-base text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed max-w-2xl mx-auto">
            Click any question below to jump to the full answer, or book a free
            consultation if you want to talk through your child&apos;s situation
            directly.
          </p>

          <ul className="space-y-3">
            {faqEntries.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/faq/${entry.slug}`}
                  className="group flex flex-col gap-2 rounded-2xl border border-warm-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-md dark:border-navy-700 dark:bg-navy-800 sm:flex-row sm:items-start sm:gap-5"
                >
                  <div className="flex-1">
                    <h2 className="text-lg md:text-xl font-bold text-navy-800 dark:text-white font-serif transition-colors group-hover:text-gold-500 dark:group-hover:text-gold-300">
                      {entry.question}
                    </h2>
                    <p className="mt-2 text-sm md:text-base text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed line-clamp-2">
                      {entry.answer}
                    </p>
                  </div>
                  <span className="shrink-0 self-start rounded-full bg-gold-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-600 dark:bg-gold-500/15 dark:text-gold-300">
                    Read more →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-navy-800 py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-5 text-2xl md:text-3xl font-bold text-white">
            Can&apos;t find your question?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-white/80 font-sans leading-relaxed">
            Book a free 15-minute consultation and we&apos;ll answer anything specific to your
            child&apos;s grade, goals, and schedule.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/book"
              className="rounded-lg bg-gold-400 px-8 py-3.5 text-center font-semibold text-navy-900 shadow-md transition-all duration-200 hover:bg-gold-300"
            >
              Book a Free Consultation
            </Link>
            <Link
              href="/classes"
              className="rounded-lg border-2 border-white px-8 py-3.5 text-center font-semibold text-white transition-all duration-200 hover:bg-white hover:text-navy-800"
            >
              View Our Classes
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
