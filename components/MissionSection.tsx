"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

function splitMissionFacts(text: string): string[] {
  return (
    text
      .replace(/[“”]/g, "")
      .match(/[^.!?。！？]+[.!?。！？]?/gu)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? [text]
  );
}

export default function MissionSection() {
  const { t } = useI18n();
  const missionFactsText = t("mission.geoFacts");
  const missionFacts = splitMissionFacts(missionFactsText);

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-navy-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-warm-200/70 bg-white px-6 py-14 shadow-sm sm:px-10 md:py-16 dark:border-navy-700/80 dark:bg-[radial-gradient(circle_at_top_left,_rgba(229,179,58,0.12),_rgba(18,28,49,0.98)_40%,_rgba(10,16,31,1)_100%)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-12 lg:gap-16 items-center">
            <AnimatedSection>
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/60 shadow-xl dark:border-navy-700/70">
                <div className="relative aspect-[4/3]">
                  <Image
                    src="/images/photos/wsc-group-1.jpg"
                    alt="DSDC students at the World Scholar's Cup competition"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/35 via-transparent to-transparent" />
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-navy-800 dark:text-white">
                  {t("mission.title")}
                </h2>
                <p className="max-w-2xl text-lg text-charcoal/70 dark:text-navy-100/90 leading-relaxed mb-8 font-sans">
                  {t("mission.text")}
                </p>
                <div
                  className="about-dsdc mb-8 rounded-[1.5rem] border border-warm-200/80 bg-warm-50/80 p-6 shadow-sm dark:border-navy-700/80 dark:bg-navy-950/55 dark:shadow-[0_18px_40px_rgba(0,0,0,0.2)]"
                  itemScope
                  itemType="https://schema.org/EducationalOrganization"
                >
                  <meta itemProp="description" content={missionFactsText} />
                  <div className="mb-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-warm-300 dark:bg-gold-500/30" />
                    <span className="text-xs font-bold uppercase tracking-[0.24em] text-gold-600 dark:text-gold-300 font-sans">
                      {t("aboutPage.factsTitle")}
                    </span>
                    <div className="h-px flex-1 bg-warm-300 dark:bg-gold-500/30" />
                  </div>
                  <div className="grid gap-3">
                    {missionFacts.map((fact, index) => (
                      <div
                        key={`${fact}-${index}`}
                        className="flex items-start gap-3 rounded-xl border border-warm-200/70 bg-white/80 px-4 py-3 dark:border-navy-700/70 dark:bg-navy-900/70"
                      >
                        <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-gold-400 shadow-[0_0_0_4px_rgba(229,179,58,0.16)] dark:bg-gold-300 dark:shadow-[0_0_0_4px_rgba(229,179,58,0.12)]" />
                        <p className="text-sm sm:text-[0.95rem] leading-7 text-charcoal/80 dark:text-navy-100/90">
                          {fact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-base text-charcoal/70 dark:text-navy-200/85 leading-relaxed mb-8 font-sans">
                  We serve students{" "}
                  <Link href="/debate-classes-canada" className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors">
                    across Canada
                  </Link>{" "}
                  and around the world through live online classes. Looking for Vancouver-specific programs? Explore our{" "}
                  <Link href="/debate-classes-vancouver" className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors">
                    Vancouver debate classes page
                  </Link>
                  .
                </p>
                <Link
                  href="/team"
                  className="inline-flex items-center px-6 py-3 bg-navy-800 dark:bg-gold-300 text-white dark:text-navy-950 font-semibold
                           rounded-lg hover:bg-navy-700 dark:hover:bg-gold-200 transition-all duration-200 shadow-md
                           hover:shadow-lg hover:-translate-y-0.5"
                >
                  {t("mission.cta")}
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
