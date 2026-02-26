"use client";

import Link from "next/link";
import { portalT } from "@/lib/portal/parent-i18n";

type Props = {
  role: "student" | "parent";
  locale?: "en" | "zh";
};

export default function EnrollmentRequiredBanner({ role, locale = "en" }: Props) {
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const enrollUrl = role === "parent" ? "/portal/parent/enroll" : "/portal/student/enroll";

  const title =
    role === "parent"
      ? t("portal.enrollmentRequired.parentTitle", "Enroll Your Student in Classes")
      : t("portal.enrollmentRequired.title", "Enroll in Classes to Get Started");

  const description =
    role === "parent"
      ? t(
          "portal.enrollmentRequired.parentDescription",
          "Your student needs at least one class enrollment to access this section. Select classes and complete payment to get started."
        )
      : t(
          "portal.enrollmentRequired.description",
          "You need at least one class enrollment to access this page. Select classes and complete payment to unlock full portal access."
        );

  return (
    <div className="space-y-4 rounded-xl border-2 border-dashed border-gold-400 bg-gold-50 p-6 text-center dark:border-gold-600 dark:bg-gold-900/20">
      <h2 className="text-xl font-bold text-navy-900 dark:text-white">{title}</h2>
      <p className="mx-auto max-w-md text-sm text-charcoal/70 dark:text-navy-300">{description}</p>
      <Link
        href={enrollUrl}
        className="inline-flex items-center rounded-xl bg-gradient-to-r from-gold-400 to-gold-300 px-6 py-3 font-bold text-navy-900 shadow-md transition-all hover:shadow-lg"
      >
        {t("portal.enrollmentRequired.cta", "Browse and Enroll in Classes")}
      </Link>
    </div>
  );
}
