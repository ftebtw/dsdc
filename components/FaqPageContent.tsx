"use client";

import FAQ from "@/components/FAQ";
import { useI18n } from "@/lib/i18n";

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
      <FAQ />
    </>
  );
}
