"use client";

import Link from "next/link";

type Props = {
  role: "student" | "parent";
  locale?: "en" | "zh";
};

const copy = {
  en: {
    title: "Enroll in Classes to Get Started",
    description:
      "You need at least one class enrollment to access this page. Select classes and complete payment to unlock full portal access.",
    cta: "Browse and Enroll in Classes",
    parentTitle: "Enroll Your Student in Classes",
    parentDescription:
      "Your student needs at least one class enrollment to access this section. Select classes and complete payment to get started.",
  },
  zh: {
    title: "报名课程以开始使用",
    description:
      "您需要至少报名一门课程才能访问此页面。请选择课程并完成付款以解锁完整门户功能。",
    cta: "浏览并报名课程",
    parentTitle: "为您的学生报名课程",
    parentDescription:
      "您的学生需要至少报名一门课程才能访问此部分。请选择课程并完成付款以开始使用。",
  },
} as const;

export default function EnrollmentRequiredBanner({ role, locale = "en" }: Props) {
  const c = copy[locale] || copy.en;
  const enrollUrl = role === "parent" ? "/portal/parent/enroll" : "/portal/student/enroll";

  return (
    <div className="space-y-4 rounded-xl border-2 border-dashed border-gold-400 bg-gold-50 p-6 text-center dark:border-gold-600 dark:bg-gold-900/20">
      <h2 className="text-xl font-bold text-navy-900 dark:text-white">
        {role === "parent" ? c.parentTitle : c.title}
      </h2>
      <p className="mx-auto max-w-md text-sm text-charcoal/70 dark:text-navy-300">
        {role === "parent" ? c.parentDescription : c.description}
      </p>
      <Link
        href={enrollUrl}
        className="inline-flex items-center rounded-xl bg-gradient-to-r from-gold-400 to-gold-300 px-6 py-3 font-bold text-navy-900 shadow-md transition-all hover:shadow-lg"
      >
        {c.cta}
      </Link>
    </div>
  );
}
