"use client";

import Link from "next/link";
import { BookOpen, Compass, FileText, HelpCircle, MessageSquare, Star, Trophy, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { addZhPrefix, hasChineseVersion } from "@/lib/localeRouting";
import AnimatedSection from "./AnimatedSection";

const exploreIcons = [Compass, BookOpen, Users, Trophy, HelpCircle, MessageSquare, FileText, Star];

export default function HomepageExploreLinks() {
  const { locale } = useI18n();
  const localizeHref = (href: string) => (locale === "zh" && hasChineseVersion(href) ? addZhPrefix(href) : href);

  const cards =
    locale === "zh"
      ? [
          {
            href: "/about",
            title: "了解 DSDC",
            description: "查看我们的理念、背景与为什么越来越多家庭选择线上辩论训练。",
          },
          {
            href: "/pricing",
            title: "课程价格",
            description: "直接比较公开透明的课程定价，了解不同项目适合哪些学生。",
          },
          {
            href: "/team",
            title: "教练团队",
            description: "认识来自顶尖大学和高水平辩论背景的 DSDC 教练。",
          },
          {
            href: "/awards",
            title: "学生成绩",
            description: "浏览学生在辩论、演讲与 World Scholar's Cup 的比赛成果。",
          },
          {
            href: "/faq",
            title: "常见问题",
            description: "快速了解上课方式、分班、设备、作业和报名流程。",
          },
          {
            href: "/debate-classes-canada",
            title: "加拿大辩论课程",
            description: "查看 DSDC 如何为加拿大各地家庭提供在线辩论与公共演讲课程。",
          },
          {
            href: "/online-debate-classes",
            title: "在线辩论课程",
            description: "看看 DSDC 的线上小班辩论课如何帮助学生持续进步。",
          },
          {
            href: "/guide-to-debate-in-canada",
            title: "加拿大辩论指南",
            description: "阅读最受欢迎的入门文章，了解加拿大辩论生态和比赛路径。",
          },
          {
            href: "/public-speaking-classes-for-kids",
            title: "青少年公共演讲课",
            description: "通过在线公共演讲课帮助孩子建立自信和领导力，适合4-9年级学生。",
          },
          {
            href: "/world-scholars-cup-coaching",
            title: "世界学者杯辅导",
            description: "加拿大顶尖 WSC 辅导项目，资格赛通过率 100%。",
          },
          {
            href: "/debate-classes-for-beginners",
            title: "初学者辩论课",
            description: "无需经验。我们的入门辩论课专为腼腆和初次接触辩论的学生设计。",
          },
        ]
      : [
          {
            href: "/about",
            title: "About DSDC",
            description: "Learn how DSDC started, what we teach, and why families choose our online model.",
          },
          {
            href: "/pricing",
            title: "See Pricing",
            description: "Compare transparent tuition and understand which programs fit your child's goals.",
          },
          {
            href: "/team",
            title: "Meet the Coaches",
            description: "See the credentials and experience behind DSDC's debate and public speaking team.",
          },
          {
            href: "/awards",
            title: "Student Results",
            description: "Browse tournament placements, awards, and World Scholar's Cup outcomes from DSDC students.",
          },
          {
            href: "/faq",
            title: "Read the FAQ",
            description: "Get quick answers on class levels, scheduling, homework, Zoom setup, and registration.",
          },
          {
            href: "/debate-classes-canada",
            title: "Debate Classes Canada",
            description: "See how DSDC serves families across Canada with live online debate and speaking programs.",
          },
          {
            href: "/online-debate-classes",
            title: "Online Debate Classes",
            description: "Explore how DSDC runs live online classes for students across Canada and beyond.",
          },
          {
            href: "/guide-to-debate-in-canada",
            title: "Guide to Debate in Canada",
            description: "Read our top-performing guide on formats, tournaments, and the Canadian debate pathway.",
          },
          {
            href: "/public-speaking-classes-for-kids",
            title: "Public Speaking for Kids",
            description: "Build confidence and leadership skills with live online public speaking classes for Grades 4-9.",
          },
          {
            href: "/world-scholars-cup-coaching",
            title: "World Scholar's Cup Coaching",
            description: "Prepare for the World Scholar's Cup with Canada's top WSC coaching program. 100% qualification rate.",
          },
          {
            href: "/debate-classes-for-beginners",
            title: "Debate for Beginners",
            description: "No experience needed. Our beginner debate classes are designed for shy and first-time students.",
          },
        ];

  return (
    <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            {locale === "zh" ? "继续了解 DSDC 的课程与资源" : "Explore DSDC Programs and Resources"}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
            {locale === "zh"
              ? "如果你正在比较课程、了解教练背景，或只是想先弄清楚加拿大辩论体系，这些页面会是最好的下一步。"
              : "If you're comparing classes, reviewing coaching quality, or trying to understand the Canadian debate pathway, these pages are the best next steps."}
          </p>
        </AnimatedSection>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => {
            const Icon = exploreIcons[index % exploreIcons.length];
            return (
              <AnimatedSection key={card.href} delay={index * 0.05}>
                <Link
                  href={localizeHref(card.href)}
                  className="group block h-full rounded-2xl border border-warm-200 bg-warm-50 p-6 shadow-sm transition-colors hover:border-gold-300 hover:bg-white hover:shadow-md dark:border-navy-700 dark:bg-navy-800 dark:hover:border-gold-400 dark:hover:bg-navy-700"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-navy-800 transition-colors group-hover:bg-gold-200 dark:bg-gold-900/30 dark:text-gold-300 dark:group-hover:bg-gold-800/40">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
                    {card.description}
                  </p>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
