"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Globe, Mic, Swords, GraduationCap, Clock, Users, MessageSquare, PenLine, CheckCircle, ClipboardList } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import AnimatedSection from "@/components/AnimatedSection";

const classIcons = [BookOpen, Swords, GraduationCap, Trophy, Globe, Mic];
const classImages = [
  "/images/photos/wsc-students-1.jpg",
  "/images/photos/wsc-students-2.jpg",
  "/images/photos/wsc-group-2.jpg",
  "/images/photos/wsc-students-3.jpg",
  "/images/photos/wsc-students-4.jpg",
  "/images/photos/dsdc-class-photo.jpg",
];
const typicalIcons = [Users, Clock, BookOpen, Swords, MessageSquare, ClipboardList];

export default function ClassesPage() {
  const { t, locale } = useI18n();

  const en = require("@/messages/en.json");
  const zh = require("@/messages/zh.json");
  const msgs = locale === "zh" ? zh : en;
  const classes = msgs.classesPage.classes as Array<{
    name: string;
    grades: string;
    schedule?: string;
    category: string;
    description: string;
  }>;
  const typicalItems = msgs.classesPage.typicalClassItems as Array<{ title: string; description: string }>;

  const debateClasses = classes.filter((c) => c.category === "debate");
  const otherClasses = classes.filter((c) => c.category === "other");

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            {t("classesPage.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-white/80 font-sans mb-4"
          >
            {t("classesPage.subtitle")}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base text-gold-400 font-sans"
          >
            {t("classesPage.online")}
          </motion.p>
        </div>
      </section>

      {/* What a Typical Class Looks Like */}
      <section className="py-20 md:py-28 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 md:mb-16 text-navy-800 dark:text-white">
              {t("classesPage.typicalClassTitle")}
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {typicalItems.map((item, i) => {
              const Icon = typicalIcons[i];
              return (
                <AnimatedSection key={i} delay={i * 0.08}>
                  <div className="text-center p-5 sm:p-6 md:p-8 rounded-2xl bg-warm-50 dark:bg-navy-800 border border-warm-200 dark:border-navy-700">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gold-400/10 dark:bg-gold-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-gold-500 dark:text-gold-400" />
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-navy-800 dark:text-white mb-2 font-serif">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-charcoal/50 dark:text-navy-300 font-sans leading-relaxed">{item.description}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
          {/* Pricing note */}
          <AnimatedSection delay={0.3}>
            <div className="mt-10 md:mt-12 text-center">
              <p className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 bg-gold-50 dark:bg-gold-900/30 border border-gold-200 dark:border-gold-700 rounded-2xl text-sm sm:text-base text-gold-700 dark:text-gold-300 font-medium font-sans text-center leading-relaxed max-w-2xl mx-auto">
                <CheckCircle className="w-5 h-5 shrink-0" />
                {t("classesPage.pricingNote")}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Debate Classes */}
      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-navy-800 dark:text-white">
              {t("classesPage.debateTitle")}
            </h2>
          </AnimatedSection>

          <div className="space-y-12">
            {debateClasses.map((cls, i) => {
              const Icon = classIcons[i];
              const isEven = i % 2 === 0;
              return (
                <AnimatedSection key={cls.name} delay={i * 0.1}>
                  <div className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 items-center`}>
                    <div className="w-full lg:w-1/2">
                      <div className="rounded-2xl overflow-hidden aspect-[16/10] shadow-lg">
                        <img src={classImages[i]} alt={`${cls.name} class`} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="w-full lg:w-1/2">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="w-10 h-10 bg-gold-400/10 rounded-xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gold-500" />
                        </div>
                        <span className="px-3 py-1 bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-200 text-xs font-semibold rounded-full">
                          {cls.grades}
                        </span>
                        {cls.schedule && (
                          <span className="hidden sm:flex px-3 py-1 bg-gold-50 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300 text-xs font-medium rounded-full items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {cls.schedule}
                          </span>
                        )}
                      </div>
                      {cls.schedule && (
                        <p className="sm:hidden text-xs text-gold-600 dark:text-gold-400 font-medium mb-2 font-sans flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {cls.schedule}
                        </p>
                      )}
                      <h3 className="text-2xl md:text-3xl font-bold text-navy-800 dark:text-white mb-4 font-serif">
                        {cls.name}
                      </h3>
                      <p className="text-charcoal/70 dark:text-navy-200 leading-relaxed text-lg font-sans">
                        {cls.description}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Other Classes */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-navy-800 dark:text-white">
              {t("classesPage.otherTitle")}
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherClasses.map((cls, i) => {
              const Icon = classIcons[i + 4];
              return (
                <AnimatedSection key={cls.name} delay={i * 0.15}>
                  <div className="bg-warm-50 dark:bg-navy-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={classImages[i + 4]} alt={`${cls.name} class`} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5 sm:p-8">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="w-10 h-10 bg-gold-400/10 rounded-xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gold-500" />
                        </div>
                        <span className="px-3 py-1 bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-200 text-xs font-semibold rounded-full">
                          {cls.grades}
                        </span>
                        {cls.schedule && (
                          <span className="hidden sm:flex px-3 py-1 bg-gold-50 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300 text-xs font-medium rounded-full items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {cls.schedule}
                          </span>
                        )}
                      </div>
                      {cls.schedule && (
                        <p className="sm:hidden text-xs text-gold-600 dark:text-gold-400 font-medium mb-2 font-sans flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {cls.schedule}
                        </p>
                      )}
                      <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-3 font-serif">{cls.name}</h3>
                      <p className="text-charcoal/70 dark:text-navy-200 leading-relaxed font-sans">{cls.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Not Sure CTA */}
      <section className="py-16 md:py-20 bg-navy-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">{t("classesPage.unsure")}</h2>
            <Link
              href="/book"
              className="inline-block px-10 py-4 bg-gold-400 text-navy-900 font-semibold text-lg rounded-lg hover:bg-gold-300 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {t("classesPage.bookCta")}
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
