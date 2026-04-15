"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, UserCheck, Monitor } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

const stepIcons = [Phone, UserCheck, Monitor];

function splitMissionFacts(text: string): string[] {
  return (
    text
      .replace(/[\u201C\u201D]/g, "")
      .match(/[^.!?\u3002\uFF01\uFF1F]+[.!?\u3002\uFF01\uFF1F]?/gu)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? [text]
  );
}

export default function HowItWorksMission() {
  const { t, messages } = useI18n();
  const steps = ((messages.howItWorks as { steps?: Array<{ step: string; title: string; description: string }> } | undefined)?.steps ??
    []) as Array<{ step: string; title: string; description: string }>;
  const missionFactsText = t("mission.geoFacts");
  const missionFacts = splitMissionFacts(missionFactsText);

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-navy-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-warm-200/70 bg-white px-5 py-8 shadow-sm sm:px-8 md:py-10 dark:border-navy-700/80 dark:[background:linear-gradient(135deg,_rgba(23,35,61,0.98)_0%,_rgba(16,26,46,0.98)_38%,_rgba(10,16,31,1)_100%)] dark:shadow-[0_18px_52px_rgba(0,0,0,0.28)]">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            {/* How It Works */}
            <AnimatedSection>
              <div className="flex h-full flex-col">
                <div className="mb-8">
                  <h2 className="text-3xl md:text-[2.2rem] font-bold text-navy-800 dark:text-white">
                    {t("howItWorks.title")}
                  </h2>
                  <p className="mt-3 text-base md:text-lg text-charcoal/65 dark:text-navy-100/90 font-sans">
                    {t("howItWorks.subtitle")}
                  </p>
                </div>
                <ol className="relative space-y-7 md:space-y-8">
                  <div className="absolute left-[22px] top-4 bottom-4 w-px bg-gold-200 dark:bg-gold-500/25" aria-hidden="true" />
                  {steps.map((step, i) => {
                    const Icon = stepIcons[i];
                    return (
                      <li key={step.step} className="relative flex items-start gap-5">
                        <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-400 shadow-md ring-4 ring-white dark:ring-navy-900/85">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="pt-1">
                          <div className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300 font-sans">
                            Step {step.step}
                          </div>
                          <h3 className="mt-1.5 text-xl md:text-[1.35rem] font-bold text-navy-800 dark:text-white font-serif leading-tight">
                            {step.title}
                          </h3>
                          <p className="mt-2 text-base md:text-[1.0625rem] text-charcoal/70 dark:text-navy-100/90 leading-relaxed font-sans">
                            {step.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <div className="mt-auto pt-8">
                  <p className="mb-4 text-sm md:text-base text-charcoal/70 dark:text-navy-200/85 leading-relaxed font-sans">
                    Ready to begin? The free consultation takes about 15 minutes and there&rsquo;s no commitment.
                  </p>
                  <Link
                    href="/book"
                    className="inline-flex w-fit items-center px-6 py-3 bg-navy-800 dark:bg-gold-300 text-white dark:text-navy-950 font-semibold rounded-lg hover:bg-navy-700 dark:hover:bg-gold-200 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Book Your Free Call
                  </Link>
                </div>
              </div>
            </AnimatedSection>

            {/* Mission */}
            <AnimatedSection delay={0.15}>
              <div className="flex h-full flex-col">
                <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                  <div className="relative hidden shrink-0 overflow-hidden rounded-2xl border border-white/60 shadow-lg sm:block dark:border-navy-700/70">
                    <Image
                      src="/images/photos/wsc-group-1.jpg"
                      alt="DSDC students at the World Scholar's Cup competition"
                      width={320}
                      height={320}
                      className="h-40 w-40 object-cover md:h-44 md:w-44"
                      loading="lazy"
                      sizes="176px"
                    />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-[2.2rem] font-bold text-navy-800 dark:text-white">
                      {t("mission.title")}
                    </h2>
                    <p className="mt-3 text-base md:text-lg text-charcoal/75 dark:text-navy-100/90 leading-relaxed font-sans">
                      {t("mission.text")}
                    </p>
                  </div>
                </div>
                <div
                  className="about-dsdc mb-5 rounded-[1.35rem] border border-warm-200/80 bg-warm-50/80 p-5 shadow-sm dark:border-navy-700/80 dark:bg-navy-950/55 dark:shadow-[0_14px_32px_rgba(0,0,0,0.18)]"
                  itemScope
                  itemType="https://schema.org/EducationalOrganization"
                >
                  <meta itemProp="description" content={missionFactsText} />
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-warm-300 dark:bg-gold-500/30" />
                    <span className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600 dark:text-gold-300 font-sans">
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
                        <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-gold-400 shadow-[0_0_0_4px_rgba(229,179,58,0.16)] dark:bg-gold-300" />
                        <p className="text-sm md:text-[0.95rem] leading-6 text-charcoal/80 dark:text-navy-100/90">
                          {fact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mb-6 text-sm md:text-base text-charcoal/70 dark:text-navy-200/85 leading-relaxed font-sans">
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
                  className="mt-auto inline-flex w-fit items-center px-6 py-3 bg-navy-800 dark:bg-gold-300 text-white dark:text-navy-950 font-semibold rounded-lg hover:bg-navy-700 dark:hover:bg-gold-200 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
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
