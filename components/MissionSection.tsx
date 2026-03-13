"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

export default function MissionSection() {
  const { t } = useI18n();

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-navy-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <AnimatedSection>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <Image
                src="/images/photos/wsc-group-1.jpg"
                alt="DSDC students at the World Scholar's Cup competition"
                width={800}
                height={600}
                className="w-full h-full object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/30 to-transparent" />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-navy-800 dark:text-white">
                {t("mission.title")}
              </h2>
              <p className="text-lg text-charcoal/70 dark:text-navy-200 leading-relaxed mb-8 font-sans">
                {t("mission.text")}
              </p>
              <p className="text-base text-charcoal/70 dark:text-navy-300 leading-relaxed mb-8 font-sans">
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
                className="inline-flex items-center px-6 py-3 bg-navy-800 dark:bg-navy-700 text-white font-semibold
                           rounded-lg hover:bg-navy-700 dark:hover:bg-navy-600 transition-all duration-200 shadow-md
                           hover:shadow-lg hover:-translate-y-0.5"
              >
                {t("mission.cta")}
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
