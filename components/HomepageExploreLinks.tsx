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
          { href: "/classes", title: "全部课程", description: "比较各级别的辩论与演讲课程。" },
          { href: "/pricing", title: "课程价格", description: "公开透明的课程定价与包含内容。" },
          { href: "/debate-classes-for-kids", title: "儿童辩论课", description: "4-12 年级在线小班辩论课程。" },
          { href: "/public-speaking-classes-for-kids", title: "儿童公共演讲课", description: "帮助孩子建立自信的线上演讲课。" },
          { href: "/guide-to-debate-in-canada", title: "加拿大辩论指南", description: "完整了解加拿大辩论体系与比赛路径。" },
          { href: "/team", title: "教练团队", description: "认识 DSDC 的辩论与演讲教练。" },
          { href: "/awards", title: "学生成绩", description: "浏览学生比赛成果与国际奖项。" },
          { href: "/faq", title: "常见问题", description: "上课方式、分班、作业与报名流程。" },
        ]
      : [
          { href: "/classes", title: "All Classes", description: "Compare every debate and public speaking program." },
          { href: "/pricing", title: "See Pricing", description: "Transparent tuition and what's included." },
          { href: "/debate-classes-for-kids", title: "Debate for Kids", description: "Online debate classes for Grades 4-12." },
          { href: "/public-speaking-classes-for-kids", title: "Public Speaking for Kids", description: "Build confidence with live speaking classes." },
          { href: "/guide-to-debate-in-canada", title: "Guide to Debate in Canada", description: "Our top-performing guide to the Canadian pathway." },
          { href: "/team", title: "Meet the Coaches", description: "Credentials and experience behind DSDC." },
          { href: "/awards", title: "Student Results", description: "Tournament placements and WSC outcomes." },
          { href: "/faq", title: "Read the FAQ", description: "Class levels, scheduling, and registration." },
        ];

  return (
    <section className="bg-white py-12 dark:bg-navy-900/30 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="text-center text-2xl font-bold text-navy-800 dark:text-white md:text-3xl">
            {locale === "zh" ? "继续了解 DSDC" : "Explore DSDC"}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
            {locale === "zh"
              ? "比较课程、了解教练背景，或直接阅读我们最受欢迎的指南。"
              : "Compare classes, review coaching credentials, or jump into our top guide."}
          </p>
        </AnimatedSection>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:mt-10 lg:grid-cols-4">
          {cards.map((card, index) => {
            const Icon = exploreIcons[index % exploreIcons.length];
            return (
              <Link
                key={card.href}
                href={localizeHref(card.href)}
                className="group flex h-full flex-col rounded-xl border border-warm-200 bg-warm-50 p-4 transition-colors hover:border-gold-300 hover:bg-white dark:border-navy-700 dark:bg-navy-800 dark:hover:border-gold-400 dark:hover:bg-navy-700 sm:p-5"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gold-100 text-navy-800 transition-colors group-hover:bg-gold-200 dark:bg-gold-900/30 dark:text-gold-300 dark:group-hover:bg-gold-800/40">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mb-1.5 text-base font-bold text-navy-800 dark:text-white sm:text-lg">{card.title}</h3>
                <p className="text-xs leading-relaxed text-charcoal/65 dark:text-navy-200 font-sans sm:text-sm">
                  {card.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
