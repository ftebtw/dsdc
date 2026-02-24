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
  },
  {
    key: "debate",
    icon: Scale,
    image: "/images/photos/wsc-students-2.jpg",
  },
  {
    key: "wsc",
    icon: Globe,
    image: "/images/photos/wsc-students-1.jpg",
  },
];

export default function ClassesOverview() {
  const { t } = useI18n();

  return (
    <section className="py-20 md:py-28 bg-warm-100 dark:bg-navy-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-navy-800 dark:text-white">
            {t("classesOverview.title")}
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {classData.map((cls, i) => {
            const Icon = cls.icon;
            return (
              <AnimatedSection key={cls.key} delay={i * 0.15} className="h-full">
                <Link href="/classes" className="group block h-full">
                  <div className="relative h-full rounded-2xl overflow-hidden aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <Image
                      src={cls.image}
                      alt={t(`classesOverview.${cls.key}.title`)}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/45 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 min-h-[200px] md:min-h-[220px] flex flex-col justify-end">
                      <div className="flex items-start gap-3 mb-3 min-h-[60px]">
                        <div className="w-10 h-10 bg-gold-400/90 rounded-xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-navy-900" />
                        </div>
                        <h3 className="text-xl font-bold text-white font-serif leading-tight line-clamp-2">
                          {t(`classesOverview.${cls.key}.title`)}
                        </h3>
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed font-sans line-clamp-3 min-h-[72px]">
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href="/classes"
              className="px-8 py-3.5 bg-navy-800 text-white font-semibold rounded-lg
                         hover:bg-navy-700 transition-all duration-200 shadow-md text-center"
            >
              {t("classesOverview.viewAll")}
            </Link>
            <Link
              href="/book"
              className="px-8 py-3.5 bg-gold-400 text-navy-900 font-semibold rounded-lg
                         hover:bg-gold-300 transition-all duration-200 shadow-md text-center"
            >
              {t("classesOverview.bookCta")}
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
