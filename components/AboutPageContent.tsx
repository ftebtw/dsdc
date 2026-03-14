"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, MapPin, Trophy, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const aboutHighlights = [
  { icon: MapPin, titleKey: "aboutPage.highlights.founded.title", bodyKey: "aboutPage.highlights.founded.body" },
  { icon: Users, titleKey: "aboutPage.highlights.students.title", bodyKey: "aboutPage.highlights.students.body" },
  { icon: BookOpen, titleKey: "aboutPage.highlights.programs.title", bodyKey: "aboutPage.highlights.programs.body" },
  { icon: Trophy, titleKey: "aboutPage.highlights.results.title", bodyKey: "aboutPage.highlights.results.body" },
];

export default function AboutPageContent() {
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
            {t("aboutPage.title")}
          </h1>
          <p className="mx-auto max-w-3xl text-lg font-sans leading-relaxed text-white/80">
            {t("aboutPage.subtitle")}
          </p>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="mb-5 text-3xl font-bold text-navy-800 dark:text-white">
                {t("mission.title")}
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-charcoal/75 dark:text-navy-200">
                {t("mission.text")}
              </p>
              <div className="rounded-2xl border border-warm-200 bg-warm-50 p-6 dark:border-navy-700 dark:bg-navy-800/70">
                <h3 className="mb-3 text-xl font-semibold text-navy-800 dark:text-white">
                  {t("aboutPage.factsTitle")}
                </h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200">
                  {t("mission.geoFacts")}
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/team"
                  className="inline-flex items-center justify-center rounded-lg bg-navy-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-700 dark:bg-gold-300 dark:text-navy-900 dark:hover:bg-gold-200"
                >
                  {t("aboutPage.teamCta")}
                </Link>
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center rounded-lg border border-navy-300 px-6 py-3 font-semibold text-navy-800 transition-colors hover:bg-warm-50 dark:border-navy-600 dark:text-white dark:hover:bg-navy-800"
                >
                  {t("aboutPage.bookCta")}
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src="/images/photos/wsc-group-1.jpg"
                  alt="DSDC students at the World Scholar's Cup competition"
                  width={900}
                  height={675}
                  className="h-full w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {aboutHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.titleKey}
                      className="rounded-2xl border border-warm-200 bg-white p-5 shadow-sm dark:border-navy-700 dark:bg-navy-800/80"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 dark:bg-gold-500/20">
                        <Icon className="h-5 w-5 text-gold-500 dark:text-gold-400" />
                      </div>
                      <h3 className="mb-2 text-base font-semibold text-navy-800 dark:text-white">
                        {t(item.titleKey)}
                      </h3>
                      <p className="text-sm leading-relaxed text-charcoal/70 dark:text-navy-200">
                        {t(item.bodyKey)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
