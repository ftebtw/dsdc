"use client";

import Link from "next/link";
import Image from "next/image";
import { Mic, Scale, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "./AnimatedSection";

const classData = [
  {
    key: "publicSpeaking",
    icon: Mic,
    image: "/images/photos/dsdc-class-photo.jpg",
    alt: "Online public speaking class for students",
  },
  {
    key: "debate",
    icon: Scale,
    image: "/images/photos/wsc-students-2.jpg",
    alt: "Students participating in an online debate class",
  },
  {
    key: "wsc",
    icon: Globe,
    image: "/images/photos/wsc-students-1.jpg",
    alt: "DSDC students at the World Scholar's Cup competition",
  },
];

export default function ClassesOverview() {
  const { t } = useI18n();

  return (
    <section className="py-12 md:py-16 bg-warm-100 dark:bg-navy-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-navy-800 dark:text-white">
            {t("classesOverview.title")}
          </h2>
          <p className="text-center text-sm md:text-base text-charcoal/70 dark:text-navy-300 font-sans mb-8">
            Explore our{" "}
            <Link href="/online-debate-classes" className="text-navy-800 dark:text-gold-300 font-semibold hover:underline">
              online debate classes
            </Link>
            .
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7 items-stretch">
          {classData.map((cls, i) => {
            const Icon = cls.icon;
            const targetHref = cls.key === "wsc" ? "/world-scholars-cup-coaching" : "/classes";
            return (
              <AnimatedSection key={cls.key} delay={i * 0.15} className="h-full">
                <Link href={targetHref} className="group block h-full">
                  <div className="relative h-full rounded-2xl overflow-hidden aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <Image
                      src={cls.image}
                      alt={cls.alt}
                      width={600}
                      height={450}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/92 via-navy-900/55 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 flex flex-col justify-end">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-gold-400/90 rounded-xl flex items-center justify-center">
                          <Icon className="w-4 h-4 text-navy-900" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white font-serif leading-tight">
                          {t(`classesOverview.${cls.key}.title`)}
                        </h3>
                      </div>
                      <p className="text-white/85 text-sm leading-relaxed font-sans line-clamp-2">
                        {t(`classesOverview.${cls.key}.description`)}
                      </p>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>

        <AnimatedSection delay={0.3}>
          <div className="flex justify-center mt-8">
            <Link
              href="/classes"
              className="px-8 py-3.5 bg-navy-800 text-white font-semibold rounded-lg
                         hover:bg-navy-700 transition-all duration-200 shadow-md text-center dark:bg-gold-300 dark:text-navy-950 dark:hover:bg-gold-200"
            >
              {t("classesOverview.viewAll")}
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
