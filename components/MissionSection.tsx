"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

function splitMissionFacts(text: string): string[] {
  return (
    text
      .replace(/[\u201C\u201D]/g, "")
      .match(/[^.!?\u3002\uFF01\uFF1F]+[.!?\u3002\uFF01\uFF1F]?/gu)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? [text]
  );
}

export default function MissionSection() {
  const { t } = useI18n();
  const missionFactsText = t("mission.geoFacts");
  const missionFacts = splitMissionFacts(missionFactsText);

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-navy-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-warm-200/70 bg-white px-5 py-10 shadow-sm sm:px-8 md:py-12 dark:border-navy-700/80 dark:[background:linear-gradient(135deg,_rgba(23,35,61,0.98)_0%,_rgba(16,26,46,0.98)_38%,_rgba(10,16,31,1)_100%)] dark:shadow-[0_18px_52px_rgba(0,0,0,0.28)]">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-center">
            <AnimatedSection>
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/60 shadow-xl dark:border-navy-700/70">
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
                <h2 className="text-3xl md:text-[2.2rem] font-bold mb-4 text-navy-800 dark:text-white">
                  {t("mission.title")}
                </h2>
                <p className="max-w-2xl text-base md:text-lg text-charcoal/70 dark:text-navy-100/90 leading-relaxed mb-6 font-sans">
                  {t("mission.text")}
                </p>
                <div
                  className="about-dsdc mb-6 rounded-[1.35rem] border border-warm-200/80 bg-warm-50/80 p-5 shadow-sm dark:border-navy-700/80 dark:bg-navy-950/55 dark:shadow-[0_14px_32px_rgba(0,0,0,0.18)]"
                  itemScope
                  itemType="https://schema.org/EducationalOrganization"
                >
                  <meta itemProp="description" content={missionFactsText} />
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-warm-300 dark:bg-gold-500/30" />
                    <span className="text-xs font-bold uppercase tracking-[0.24em] text-gold-600 dark:text-gold-300 font-sans">
                      {t("aboutPage.factsTitle")}
                    </span>
                    <div className="h-px flex-1 bg-warm-300 dark:bg-gold-500/30" />
                  </div>
                  <div className="grid gap-2.5">
                    {missionFacts.map((fact, index) => (
                      <div
                        key={`${fact}-${index}`}
                        className="flex items-start gap-3 rounded-xl border border-warm-200/70 bg-white/80 px-4 py-2.5 dark:border-navy-700/70 dark:bg-navy-900/70"
                      >
                        <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-gold-400 shadow-[0_0_0_4px_rgba(229,179,58,0.16)] dark:bg-gold-300 dark:shadow-[0_0_0_4px_rgba(229,179,58,0.12)]" />
                        <p className="text-sm sm:text-[0.92rem] leading-6 text-charcoal/80 dark:text-navy-100/90">
                          {fact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm md:text-base text-charcoal/70 dark:text-navy-200/85 leading-relaxed mb-6 font-sans">
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
                  className="inline-flex items-center px-5 py-2.5 bg-navy-800 dark:bg-gold-300 text-white dark:text-navy-950 font-semibold
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
