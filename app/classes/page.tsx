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
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              {t("classesPage.typicalClassTitle")}
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {typicalItems.map((item, i) => {
              const Icon = typicalIcons[i];
              return (
                <AnimatedSection key={i} delay={i * 0.08}>
                  <div className="text-center p-4 rounded-xl bg-warm-50 border border-warm-200">
                    <div className="w-10 h-10 bg-gold-400/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5 text-gold-500" />
                    </div>
                    <h4 className="text-sm font-bold text-navy-800 mb-1 font-serif">{item.title}</h4>
                    <p className="text-xs text-charcoal/50 font-sans">{item.description}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
          {/* Pricing note */}
          <AnimatedSection delay={0.3}>
            <div className="mt-8 text-center">
              <p className="inline-flex items-center gap-2 px-6 py-3 bg-gold-50 border border-gold-200 rounded-full text-sm text-gold-700 font-medium font-sans">
                <CheckCircle className="w-4 h-4" />
                {t("classesPage.pricingNote")}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Debate Classes */}
      <section className="py-16 md:py-24 bg-warm-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
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
                        <span className="px-3 py-1 bg-navy-100 text-navy-700 text-xs font-semibold rounded-full">
                          {cls.grades}
                        </span>
                        {cls.schedule && (
                          <span className="px-3 py-1 bg-gold-50 text-gold-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {cls.schedule}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-navy-800 mb-4 font-serif">
                        {cls.name}
                      </h3>
                      <p className="text-charcoal/70 leading-relaxed text-lg font-sans">
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
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              {t("classesPage.otherTitle")}
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherClasses.map((cls, i) => {
              const Icon = classIcons[i + 4];
              return (
                <AnimatedSection key={cls.name} delay={i * 0.15}>
                  <div className="bg-warm-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={classImages[i + 4]} alt={`${cls.name} class`} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-8">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="w-10 h-10 bg-gold-400/10 rounded-xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gold-500" />
                        </div>
                        <span className="px-3 py-1 bg-navy-100 text-navy-700 text-xs font-semibold rounded-full">
                          {cls.grades}
                        </span>
                        {cls.schedule && (
                          <span className="px-3 py-1 bg-gold-50 text-gold-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {cls.schedule}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-navy-800 mb-3 font-serif">{cls.name}</h3>
                      <p className="text-charcoal/70 leading-relaxed font-sans">{cls.description}</p>
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
