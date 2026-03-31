"use client";

import Link from "next/link";
import Image from "next/image";
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

function classImageAlt(className: string): string {
  const normalized = className.toLowerCase();
  if (normalized.includes("novice")) return "Online debate class for elementary school students";
  if (normalized.includes("junior")) return "Online debate class for middle school students";
  if (normalized.includes("senior") || normalized.includes("advanced")) return "Competitive debate training for high school students";
  if (normalized.includes("world scholar") || normalized.includes("wsc")) return "DSDC students at the World Scholar's Cup competition";
  if (normalized.includes("public speaking")) return "Online public speaking class for students";
  return "Students participating in an online debate class";
}

export default function ClassesPage() {
  const { t, messages, locale } = useI18n();
  const classes = ((messages.classesPage as { classes?: Array<{
    name: string;
    grades: string;
    schedule?: string;
    category: string;
    description: string;
  }> } | undefined)?.classes ?? []) as Array<{
    name: string;
    grades: string;
    schedule?: string;
    category: string;
    description: string;
  }>;
  const typicalItems = ((messages.classesPage as {
    typicalClassItems?: Array<{ title: string; description: string }>;
  } | undefined)?.typicalClassItems ?? []) as Array<{ title: string; description: string }>;
  const testimonialItems = ((messages.testimonials as {
    items?: Array<{ name: string; role: string; quote: string }>;
  } | undefined)?.items ?? []).slice(0, 3) as Array<{ name: string; role: string; quote: string }>;

  const debateClasses = classes.filter((c) => c.category === "debate");
  const otherClasses = classes.filter((c) => c.category === "other");
  const seoFaqItems =
    locale === "zh"
      ? [
          {
            question: "哪些学生适合报名 DSDC 的在线辩论课程？",
            answer:
              "我们的课程适合 4 至 12 年级的学生，从零基础入门到高水平竞赛训练都有清晰路径。无论孩子想提升自信、写作能力还是比赛成绩，都可以找到合适级别。",
          },
          {
            question: "你们同时提供辩论课和公共演讲课程吗？",
            answer:
              "提供。家长可以选择在线辩论课程、公共演讲课程、世界学者杯备赛以及高级竞赛项目，我们会根据年龄与经验推荐最合适的课程。",
          },
          {
            question: "一门公共演讲或辩论课程通常包含什么？",
            answer:
              "大多数课程会包含热身活动、时事或沟通技巧讲解、结构化演讲或辩论练习，以及课后书面反馈，让学生每周都知道自己如何进步。",
          },
          {
            question: "害羞或完全没有经验的学生适合吗？",
            answer:
              "非常适合。很多学生都是零基础开始的。我们的入门课程会用支持性强、循序渐进的方式帮助学生建立表达自信。",
          },
          {
            question: "和短期夏令营式 debate camp 相比，有什么不同？",
            answer:
              "短期营队可以帮助孩子快速接触辩论，但按学期进行的课程通常更能带来长期成长，因为学生会持续练习、反复获得反馈，并逐步晋级到更高水平。",
          },
          {
            question: "如何判断孩子适合哪一门课？",
            answer:
              "最好的方式是先比较课程层级，或者预约免费咨询。我们会根据孩子的年级、表达自信和目标，推荐最合适的课程。",
          },
        ]
      : [
          {
            question: "What students are your online debate classes best for?",
            answer:
              "Our programs are designed for students in Grades 4 through 12, from complete beginners to highly competitive debaters. Families choose DSDC when they want confidence-building, academic growth, and structured coaching.",
          },
          {
            question: "Do you offer both debate classes and a public speaking course?",
            answer:
              "Yes. We offer online debate classes, a dedicated public speaking course, World Scholar's Cup coaching, and advanced competitive programs for students who want more rigorous training.",
          },
          {
            question: "What happens in a typical debate or public speaking class?",
            answer:
              "Students usually begin with a warm-up or lesson, then move into structured speeches, practice debates, or presentation drills. Coaches provide written feedback after class so students know exactly what to improve.",
          },
          {
            question: "Are these debate classes for kids beginner-friendly?",
            answer:
              "Absolutely. Many students start with no experience at all. Our novice and public speaking options are designed to help shy students build skill and confidence gradually.",
          },
          {
            question: "How do these programs compare with a debate camp?",
            answer:
              "A debate camp can be a useful introduction, but weekly classes usually lead to stronger results because students practice over an entire term, receive repeated feedback, and move through a clear progression of levels.",
          },
          {
            question: "How do we choose the right class and get started?",
            answer:
              "Start by comparing the class levels or booking a free consultation. We'll recommend the right fit based on your child's grade, confidence level, and long-term goals.",
          },
        ];

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
            Online Debate & Public Speaking Classes
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
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-sm sm:text-base text-white/85 font-sans mt-4"
          >
            DSDC offers online debate and public speaking classes for students of all ages and experience levels - no experience needed.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/compare"
              className="px-8 py-3.5 bg-gold-300 text-navy-900 font-semibold rounded-lg
                         hover:bg-gold-200 transition-all duration-200 shadow-md text-center"
            >
              {t("classesPage.compareCta")}
            </Link>
            <Link
              href="/book"
              className="px-8 py-3.5 border border-white text-white font-semibold rounded-lg
                         hover:bg-white hover:text-navy-800 transition-all duration-200 text-center"
            >
              {t("classesPage.bookCta")}
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-navy-800 dark:text-white">
              {locale === "zh" ? "为什么家长选择 DSDC 在线辩论课程" : "Online Debate Classes for Kids That Build Real Skills"}
            </h2>
          </AnimatedSection>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            {locale === "zh" ? (
              <>
                <p>
                  很多家长在寻找在线辩论课程时，并不只是想要一项课外活动，而是希望孩子能持续建立自信、表达能力和批判性思维。DSDC 的课程正是围绕这些长期能力来设计的，让学生在每周稳定练习中不断成长。
                </p>
                <p>
                  我们的课程体系包含适合低龄学生的辩论入门课、专门提升舞台表现力的公共演讲课程，以及面向高水平学生的竞技辩论训练。无论您是在寻找适合初学者的课程，还是更系统的长期训练路径，都可以在这里找到清晰的下一步。
                </p>
                <p>
                  也有家长最初是通过搜索类似 debate camp 的短期项目来接触辩论。短期营队当然有价值，但按学期进行的课程通常更能帮助孩子真正进步，因为他们能在更长时间里反复实践、获得反馈，并把技能变成稳定习惯。
                </p>
                <p>
                  如果您正在比较不同选择，可以查看我们的{" "}
                  <Link href="/online-debate-classes" className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    在线辩论课程页面
                  </Link>
                  、了解{" "}
                  <Link href="/debate-classes-vancouver" className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    温哥华辩论课程
                  </Link>
                  ，或者直接{" "}
                  <Link href="/book" className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    预约免费咨询
                  </Link>
                  ，我们会帮助您找到最适合孩子的项目。
                </p>
              </>
            ) : (
              <>
                <p>
                  Families searching for online debate classes usually want more than a one-time enrichment activity.
                  They want debate classes for kids that build confidence, strengthen critical thinking, and turn
                  speaking practice into a weekly habit. That is exactly how DSDC designs its programs.
                </p>
                <p>
                  Our lineup includes beginner-friendly debate classes for kids, a dedicated public speaking course for
                  students who want stage confidence first, and advanced competitive training for debaters aiming at
                  provincials, nationals, and international tournaments. We also offer a clear pathway from beginner
                  fundamentals to high-level debate coaching.
                </p>
                <p>
                  Some parents begin by searching for a debate camp or short summer intensive. Those can be a helpful
                  spark, but term-based programs usually create stronger improvement because students practice across an
                  entire semester, receive written feedback every week, and progress through clearly defined levels.
                </p>
                <p>
                  If you&apos;re comparing options, explore our{" "}
                  <Link href="/online-debate-classes" className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    online debate classes
                  </Link>
                  , learn about our{" "}
                  <Link href="/debate-classes-vancouver" className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    Vancouver debate classes
                  </Link>
                  , or{" "}
                  <Link href="/book" className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    book a free consultation
                  </Link>
                  {" "}and we&apos;ll recommend the right fit.
                </p>
              </>
            )}
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 auto-rows-fr">
            {typicalItems.map((item, i) => {
              const Icon = typicalIcons[i];
              return (
                <AnimatedSection key={i} delay={i * 0.08} className="h-full">
                  <div className="h-full min-h-[220px] sm:min-h-[230px] text-center p-5 sm:p-6 md:p-8 rounded-2xl bg-warm-50 dark:bg-navy-800 border border-warm-200 dark:border-navy-700 flex flex-col items-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gold-400/10 dark:bg-gold-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-gold-500 dark:text-gold-400" />
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-navy-800 dark:text-white mb-2 font-serif min-h-[2.5rem] flex items-center justify-center">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-charcoal/50 dark:text-navy-300 font-sans leading-relaxed max-w-[34ch] mx-auto flex-1">
                      {item.description}
                    </p>
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
              const Icon = classIcons[i % classIcons.length];
              const image = classImages[i % classImages.length];
              const isEven = i % 2 === 0;
              const isNoviceClass = i === 0 || /novice/i.test(cls.name);
              return (
                <AnimatedSection key={cls.name} delay={i * 0.1}>
                  <div className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 items-center`}>
                    <div className="w-full lg:w-1/2">
                      <div className="rounded-2xl overflow-hidden aspect-[16/10] shadow-lg">
                        <Image
                          src={image}
                          alt={classImageAlt(cls.name)}
                          width={600}
                          height={400}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
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
                      {isNoviceClass ? (
                        <p className="mt-3 text-sm font-medium text-navy-700 dark:text-gold-300">
                          New to debate?{" "}
                          <Link href="/debate-classes-for-beginners" className="underline underline-offset-4 hover:text-gold-400 transition-colors">
                            Perfect for beginners
                          </Link>
                          .
                        </p>
                      ) : null}
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

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:auto-rows-fr">
            {otherClasses.map((cls, i) => {
              const Icon = classIcons[(i + 4) % classIcons.length];
              const image = classImages[(i + 4) % classImages.length];
              const isWscClass = /world scholar|wsc/i.test(`${cls.name} ${cls.description}`);
              return (
                <AnimatedSection key={cls.name} delay={i * 0.15} className="h-full">
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-warm-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-navy-800">
                    <div className="aspect-[16/9] shrink-0 overflow-hidden">
                      <Image
                        src={image}
                        alt={classImageAlt(cls.name)}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-8">
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
                      <p className="flex-1 text-charcoal/70 dark:text-navy-200 leading-relaxed font-sans">{cls.description}</p>
                      {isWscClass ? (
                        <p className="mt-3 text-sm font-medium text-navy-700 dark:text-gold-300">
                          {" "}
                          <Link href="/world-scholars-cup-coaching" className="underline underline-offset-4 hover:text-gold-400 transition-colors">
                            Learn more about our WSC coaching
                          </Link>
                          .
                        </p>
                      ) : null}
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
              {locale === "zh" ? "学生和家庭如何评价 DSDC" : "What Families Say About DSDC"}
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonialItems.map((item, index) => (
              <AnimatedSection key={`${item.name}-${index}`} delay={index * 0.08} className="h-full">
                <article className="h-full rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
                  <p className="text-base leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">&ldquo;{item.quote}&rdquo;</p>
                  <div className="mt-5 border-t border-warm-200 pt-4 dark:border-navy-700">
                    <p className="font-bold text-navy-800 dark:text-white">{item.name}</p>
                    <p className="text-sm text-charcoal/55 dark:text-navy-300">{item.role}</p>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
              {locale === "zh" ? "课程常见问题" : "Class FAQs"}
            </h2>
          </AnimatedSection>
          <div className="space-y-3">
            {seoFaqItems.map((item, index) => (
              <AnimatedSection key={item.question} delay={index * 0.04}>
                <details className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
                  <summary className="flex cursor-pointer list-none items-center justify-between p-4 sm:p-5 transition-colors hover:bg-warm-50 dark:hover:bg-navy-700/50">
                    <span className="pr-4 text-sm sm:text-base font-semibold text-navy-800 dark:text-navy-100 font-sans">
                      {item.question}
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                      +
                    </span>
                  </summary>
                  <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:px-5 sm:pb-5 sm:text-base font-sans">
                    {item.answer}
                  </p>
                </details>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Not Sure CTA */}
      <section className="py-16 md:py-20 bg-navy-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">{t("classesPage.unsure")}</h2>
            <p className="text-white/75 font-sans mb-8">
              {t("classesPage.comparePrompt")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book"
                className="inline-block px-10 py-4 bg-gold-400 text-navy-900 font-semibold text-lg rounded-lg hover:bg-gold-300 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {t("classesPage.bookCta")}
              </Link>
              <Link
                href="/register"
                className="inline-block px-10 py-4 bg-white text-navy-800 font-semibold text-lg rounded-lg hover:bg-warm-50 transition-all duration-200"
              >
                {t("nav.register")}
              </Link>
              <Link
                href="/compare"
                className="inline-block px-10 py-4 border border-white text-white font-semibold text-lg rounded-lg hover:bg-white hover:text-navy-800 transition-all duration-200"
              >
                {t("classesPage.compareCta")}
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
