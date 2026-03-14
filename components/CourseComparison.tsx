"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "@/components/AnimatedSection";
import {
  BASE_FX_FALLBACK,
  convertCadPrice,
  formatDisplayPrice,
} from "@/lib/pricing";

type ClassItem = {
  name: string;
  grades: string;
  schedule?: string;
  category: string;
  description: string;
};

const priceByIndex = [720, 720, 1200, 1200, 960, 720];

export default function CourseComparison() {
  const { t, messages, locale } = useI18n();
  const classes = ((messages.classesPage as { classes?: ClassItem[] } | undefined)?.classes ??
    []) as ClassItem[];

  const courses = classes.map((course, index) => ({
    ...course,
    price: formatDisplayPrice(
      convertCadPrice(priceByIndex[index] ?? 720, "CAD", BASE_FX_FALLBACK),
      "CAD",
      locale
    ),
    badgeKey: index === 1 ? "comparePage.badges.mostPopular" : null,
  }));

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
            {t("comparePage.title")}
          </h1>
          <p className="mx-auto max-w-3xl text-lg font-sans leading-relaxed text-white/80">
            {t("comparePage.subtitle")}
          </p>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-8 rounded-2xl border border-gold-200 bg-gold-50/80 p-5 text-sm text-gold-900 dark:border-gold-500/40 dark:bg-navy-800/80 dark:text-gold-200">
              {t("comparePage.note")}
            </div>
          </AnimatedSection>

          <div className="grid gap-6 md:hidden">
            {courses.map((course, index) => (
              <AnimatedSection key={course.name} delay={index * 0.06}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-bold text-navy-800 dark:text-white">
                        {course.name}
                      </h2>
                      <p className="mt-1 text-sm text-charcoal/60 dark:text-navy-300">
                        {course.grades}
                      </p>
                    </div>
                    {course.badgeKey ? (
                      <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-800 dark:bg-gold-500/20 dark:text-gold-200">
                        {t(course.badgeKey)}
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-3 text-sm text-charcoal/75 dark:text-navy-200">
                    <p><span className="font-semibold text-navy-800 dark:text-white">{t("comparePage.fields.category")}:</span> {t(`comparePage.categories.${course.category}`)}</p>
                    <p><span className="font-semibold text-navy-800 dark:text-white">{t("comparePage.fields.schedule")}:</span> {course.schedule || t("comparePage.fallbackSchedule")}</p>
                    <p><span className="font-semibold text-navy-800 dark:text-white">{t("comparePage.fields.price")}:</span> {course.price}{t("comparePage.perTermSuffix")}</p>
                    <p className="leading-relaxed">{course.description}</p>
                  </div>

                  <Link
                    href="/book"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-gold-400 px-5 py-3 font-semibold text-navy-900 transition-colors hover:bg-gold-300"
                  >
                    {t("comparePage.bookCta")}
                  </Link>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="hidden md:block">
            <div className="overflow-hidden rounded-3xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-navy-800 text-white">
                  <tr>
                    {[
                      "course",
                      "grades",
                      "category",
                      "schedule",
                      "price",
                      "description",
                      "action",
                    ].map((key) => (
                      <th key={key} className="px-5 py-4 text-sm font-semibold">
                        {t(`comparePage.fields.${key}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => (
                    <motion.tr
                      key={course.name}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{ duration: 0.35, delay: index * 0.03 }}
                      className="border-t border-warm-200 align-top dark:border-navy-700"
                    >
                      <td className="px-5 py-5">
                        <div className="flex flex-col gap-2">
                          <span className="font-semibold text-navy-800 dark:text-white">
                            {course.name}
                          </span>
                          {course.badgeKey ? (
                            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-800 dark:bg-gold-500/20 dark:text-gold-200">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {t(course.badgeKey)}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-5 text-charcoal/75 dark:text-navy-200">{course.grades}</td>
                      <td className="px-5 py-5 text-charcoal/75 dark:text-navy-200">{t(`comparePage.categories.${course.category}`)}</td>
                      <td className="px-5 py-5 text-charcoal/75 dark:text-navy-200">{course.schedule || t("comparePage.fallbackSchedule")}</td>
                      <td className="px-5 py-5 font-semibold text-navy-800 dark:text-white">{course.price}{t("comparePage.perTermSuffix")}</td>
                      <td className="px-5 py-5 text-sm leading-relaxed text-charcoal/75 dark:text-navy-200">{course.description}</td>
                      <td className="px-5 py-5">
                        <Link
                          href="/book"
                          className="inline-flex items-center justify-center rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-300"
                        >
                          {t("comparePage.bookCta")}
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
