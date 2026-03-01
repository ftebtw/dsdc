"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  BookOpen,
  Bug,
  Calendar,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Share2,
  Settings,
  Shield,
  Star,
  UserSquare2,
  Users,
  X,
} from "lucide-react";
import BugReportModal from "@/app/portal/_components/BugReportModal";
import StudentSelector from "@/app/portal/_components/StudentSelector";
import ThemeToggle from "@/components/ThemeToggle";
import { useI18n } from "@/lib/i18n";
import type { PortalRole } from "@/lib/portal/auth";
import { portalT } from "@/lib/portal/parent-i18n";

type Props = {
  role: PortalRole | null;
  name?: string | null;
  email?: string | null;
  locale?: "en" | "zh";
  timezone?: string;
  children: ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const COMMON_TIMEZONES = [
  "America/Vancouver",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Edmonton",
  "America/Halifax",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Seoul",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
  "UTC",
] as const;


function roleToLabel(
  role: PortalRole | null,
  t: (key: string, fallback: string) => string
): string {
  switch (role) {
    case "admin":
      return t("portal.roles.admin", "Admin");
    case "coach":
      return t("portal.roles.coach", "Coach");
    case "ta":
      return t("portal.roles.ta", "TA");
    case "student":
      return t("portal.roles.student", "Student");
    case "parent":
      return t("portal.roles.parent", "Parent");
    default:
      return t("portal.roles.portal", "Portal");
  }
}

function PortalNav({
  role,
  pathname,
  sections,
  pendingPath,
  studentParam,
  isParent,
  t,
  localeUpdating,
  timezoneUpdating,
  currentLocale,
  displayTimezone,
  onLocaleChange,
  onTimezoneChange,
  onNavClick,
}: {
  role: PortalRole | null;
  pathname: string | null;
  sections: NavSection[];
  pendingPath: string | null;
  studentParam: string | null;
  isParent: boolean;
  t: (key: string, fallback: string) => string;
  localeUpdating: boolean;
  timezoneUpdating: boolean;
  currentLocale: "en" | "zh";
  displayTimezone: string;
  onLocaleChange: (nextLocale: "en" | "zh") => void;
  onTimezoneChange: (nextTimezone: string) => void;
  onNavClick: (href: string) => void;
}) {
  return (
    <>
      {isParent ? (
        <div className="mb-4 rounded-xl border border-warm-200 dark:border-navy-600/60 bg-warm-50 dark:bg-navy-900/55 p-3 shadow-sm dark:shadow-black/25">
          <StudentSelector
            label={t("portal.nav.parent.student", "Student")}
            emptyLabel={t("portal.nav.parent.noStudents", "No linked students")}
          />
        </div>
      ) : null}

      <div className="mb-4">
        <label className="block">
          <span className="block text-xs mb-1 uppercase tracking-wide text-charcoal/60 dark:text-navy-200/80">
            {t("portal.nav.parent.language", "Language")}
          </span>
          <select
            disabled={localeUpdating}
            value={currentLocale}
            onChange={(event) => {
              void onLocaleChange(event.target.value as "en" | "zh");
            }}
            className="w-full rounded-md border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-900 px-2 py-1.5 text-sm"
          >
            <option value="en">{t("portal.locale.english", "English")}</option>
            <option value="zh">{t("portal.locale.chinese", "Chinese")}</option>
          </select>
        </label>
      </div>

      <div className="mb-4">
        <label className="block">
          <span className="block text-xs mb-1 uppercase tracking-wide text-charcoal/60 dark:text-navy-200/80">
            {t("portal.displayTimezone", "Display Timezone")}
          </span>
          <select
            disabled={timezoneUpdating}
            value={displayTimezone}
            onChange={(event) => {
              void onTimezoneChange(event.target.value);
            }}
            className="w-full rounded-md border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-900 px-2 py-1.5 text-xs"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <section key={section.title}>
            <p className="px-2 mb-2 text-[11px] uppercase tracking-[0.14em] text-charcoal/50 dark:text-navy-200/60">
              {section.title}
            </p>
            <nav className="space-y-1">
              {section.items.map((link) => {
                const active = pathname?.startsWith(link.href) || pendingPath?.startsWith(link.href);
                const href =
                  role === "parent" && studentParam
                    ? `${link.href}?student=${encodeURIComponent(studentParam)}`
                    : link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={href}
                    prefetch
                    scroll={false}
                    onClick={() => onNavClick(link.href)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-gold-300 to-gold-200 text-navy-900 shadow-[0_8px_24px_rgba(217,173,74,0.28)]"
                        : "text-navy-700 dark:text-navy-100/90 hover:bg-warm-100 dark:hover:bg-navy-700/80 hover:text-navy-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </section>
        ))}
      </div>
    </>
  );
}

export default function PortalShell({
  role,
  name,
  email,
  locale = "en",
  timezone = "America/Vancouver",
  children,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale: i18nLocale, setLocale: setI18nLocale } = useI18n();
  const hideShell = pathname === "/portal/login";

  const [optimisticLocale, setOptimisticLocale] = useState<"en" | "zh">(
    locale === "zh" ? "zh" : "en"
  );
  const [displayTimezone, setDisplayTimezone] = useState(timezone);
  const [localeUpdating, setLocaleUpdating] = useState(false);
  const [timezoneUpdating, setTimezoneUpdating] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [bugModalOpen, setBugModalOpen] = useState(false);

  const currentLocale = optimisticLocale;
  const t = (key: string, fallback: string) => portalT(currentLocale, key, fallback);
  const studentParam = searchParams.get("student");

  useEffect(() => {
    const portalLocale = locale === "zh" ? "zh" : "en";
    if (i18nLocale !== portalLocale) {
      setI18nLocale(portalLocale);
    }
  }, [locale, i18nLocale, setI18nLocale]);

  useEffect(() => {
    setOptimisticLocale(locale === "zh" ? "zh" : "en");
  }, [locale]);

  useEffect(() => {
    setDisplayTimezone(timezone);
  }, [timezone]);

  useEffect(() => {
    if (i18nLocale !== optimisticLocale) {
      setOptimisticLocale(i18nLocale as "en" | "zh");
    }
  }, [i18nLocale, optimisticLocale]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileNavOpen]);

  function onLocaleChange(nextLocale: "en" | "zh") {
    if (nextLocale === currentLocale) return;

    if (typeof window !== "undefined") {
      localStorage.setItem("dsdc-portal-locale-set", "true");
    }

    // Instant update - all useI18n() components re-render immediately.
    setOptimisticLocale(nextLocale);
    setI18nLocale(nextLocale);
    setLocaleUpdating(true);

    // Fire-and-forget DB save. No router.refresh() needed - client components
    // already have the new locale via context. Server components pick it up
    // on the next navigation.
    fetch("/api/portal/profile/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    })
      .catch(() => {
        const reverted = nextLocale === "en" ? "zh" : "en";
        setOptimisticLocale(reverted);
        setI18nLocale(reverted);
      })
      .finally(() => {
        setLocaleUpdating(false);
      });
  }

  function onTimezoneChange(nextTimezone: string) {
    if (nextTimezone === displayTimezone) return;

    const previous = displayTimezone;
    setDisplayTimezone(nextTimezone);
    setTimezoneUpdating(true);

    fetch("/api/portal/profile/timezone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone: nextTimezone }),
    })
      .catch(() => {
        setDisplayTimezone(previous);
      })
      .finally(() => {
        setTimezoneUpdating(false);
      });
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasSetLocale = localStorage.getItem("dsdc-portal-locale-set");
    if (hasSetLocale) return;

    const browserLang = navigator.language || "";
    const shouldBeZh = browserLang.startsWith("zh");
    const currentDbLocale = locale === "zh" ? "zh" : "en";

    if (shouldBeZh && currentDbLocale !== "zh") {
      void onLocaleChange("zh");
    }

    localStorage.setItem("dsdc-portal-locale-set", "true");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navSections = useMemo<NavSection[]>(() => {
    if (role === "admin") {
      return [
        {
          title: t("portal.nav.admin.sectionOverview", "Overview"),
          items: [
            { href: "/portal/admin/dashboard", label: t("portal.nav.admin.dashboard", "Dashboard"), icon: LayoutDashboard },
            { href: "/portal/admin/calendar", label: t("portal.nav.admin.calendar", "Calendar"), icon: CalendarDays },
            { href: "/portal/admin/referrals", label: t("portal.nav.admin.referrals", "Referrals"), icon: Share2 },
            { href: "/portal/admin/terms", label: t("portal.nav.admin.terms", "Terms"), icon: Calendar },
            { href: "/portal/admin/classes", label: t("portal.nav.admin.classes", "Classes"), icon: BookOpen },
            { href: "/portal/admin/report-cards", label: t("portal.nav.admin.reportCards", "Report Cards"), icon: GraduationCap },
            { href: "/portal/admin/payroll", label: t("portal.nav.admin.payroll", "Payroll"), icon: ClipboardCheck },
            { href: "/portal/admin/availability", label: t("portal.nav.admin.availability", "Availability"), icon: Calendar },
            { href: "/portal/admin/subs", label: t("portal.nav.admin.subRequests", "Sub Requests"), icon: Users },
            {
              href: "/portal/admin/private-sessions",
              label: t("portal.nav.admin.privateSessions", "Private Sessions"),
              icon: ClipboardCheck,
            },
            { href: "/portal/admin/etransfers", label: t("portal.nav.admin.etransfers", "E-Transfers"), icon: Banknote },
            {
              href: "/portal/admin/pending-approvals",
              label: t("portal.nav.admin.pendingApprovals", "Pending Approvals"),
              icon: ClipboardCheck,
            },
            { href: "/portal/admin/login-log", label: t("portal.nav.admin.loginLog", "Login Log"), icon: ClipboardList },
          ],
        },
        {
          title: t("portal.nav.admin.sectionPeople", "People"),
          items: [
            { href: "/portal/admin/students", label: t("portal.nav.admin.students", "Students"), icon: GraduationCap },
            { href: "/portal/admin/parents", label: t("portal.nav.admin.parents", "Parents"), icon: Users },
            { href: "/portal/admin/coaches", label: t("portal.nav.admin.coaches", "Coaches"), icon: UserSquare2 },
            { href: "/portal/admin/enroll", label: t("portal.nav.admin.enroll", "Enroll"), icon: FileCheck2 },
            { href: "/portal/signup", label: t("portal.nav.admin.createUser", "Create User"), icon: Shield },
          ],
        },
        {
          title: t("portal.nav.admin.sectionLegal", "Legal"),
          items: [
            { href: "/portal/admin/legal", label: t("portal.nav.admin.legalDocs", "Legal Docs"), icon: FileText },
            { href: "/portal/settings", label: t("portal.settings.title", "Account Settings"), icon: Settings },
          ],
        },
      ];
    }

    if (role === "coach" || role === "ta") {
      return [
        {
          title: t("portal.nav.coach.sectionTeaching", "Teaching"),
          items: [
            { href: "/portal/coach/dashboard", label: t("portal.nav.coach.dashboard", "Dashboard"), icon: LayoutDashboard },
            { href: "/portal/coach/calendar", label: t("portal.nav.coach.calendar", "Calendar"), icon: CalendarDays },
            { href: "/portal/coach/checkin", label: t("portal.nav.coach.checkin", "Check-in"), icon: ClipboardCheck },
            { href: "/portal/coach/classes", label: t("portal.nav.coach.myClasses", "My Classes"), icon: BookOpen },
            { href: "/portal/coach/report-cards", label: t("portal.nav.coach.reportCards", "Report Cards"), icon: GraduationCap },
            { href: "/portal/coach/hours", label: t("portal.nav.coach.myHours", "My Hours"), icon: Calendar },
          ],
        },
        {
          title: t("portal.nav.coach.sectionSchedule", "Schedule"),
          items: [
            { href: "/portal/coach/availability", label: t("portal.nav.coach.availability", "Availability"), icon: Calendar },
            { href: "/portal/coach/subs", label: t("portal.nav.coach.subRequests", "Sub Requests"), icon: Users },
            {
              href: "/portal/coach/private-sessions",
              label: t("portal.nav.coach.privateSessions", "Private Sessions"),
              icon: ClipboardCheck,
            },
            { href: "/portal/preferences", label: t("portal.nav.coach.preferences", "Preferences"), icon: Shield },
            { href: "/portal/settings", label: t("portal.settings.title", "Account Settings"), icon: Settings },
          ],
        },
      ];
    }

    if (role === "student") {
      return [
        {
          title: t("portal.nav.student.sectionLearning", "Learning"),
          items: [
            { href: "/portal/student/enroll", label: t("portal.nav.student.enrollClasses", "Enroll in Classes"), icon: GraduationCap },
            { href: "/portal/calendar", label: t("portal.nav.student.calendar", "Calendar"), icon: CalendarDays },
            { href: "/portal/student/classes", label: t("portal.nav.student.myClasses", "My Classes"), icon: BookOpen },
            { href: "/portal/student/attendance", label: t("portal.nav.student.attendance", "Attendance"), icon: ClipboardCheck },
            { href: "/portal/student/resources", label: t("portal.nav.student.resources", "Resources"), icon: FileText },
            { href: "/portal/student/makeup", label: t("portal.nav.student.makeupClasses", "Make-up Classes"), icon: Calendar },
            { href: "/portal/student/credits", label: t("portal.nav.student.classCredits", "Class Credits"), icon: Star },
          ],
        },
        {
          title: t("portal.nav.student.sectionAccount", "Account"),
          items: [
            {
              href: "/portal/student/booking",
              label: t("portal.nav.student.bookPrivate", "Book Private Session"),
              icon: Calendar,
            },
            { href: "/portal/student/private-sessions", label: t("portal.nav.student.mySessions", "My Sessions"), icon: Calendar },
            { href: "/portal/student/referrals", label: t("portal.nav.student.referFriend", "Refer a Friend"), icon: Share2 },
            { href: "/portal/student/link-parent", label: t("portal.nav.student.linkParent", "Link Parent"), icon: Users },
            { href: "/portal/student/legal", label: t("portal.nav.student.legalDocs", "Legal Documents"), icon: FileCheck2 },
            { href: "/portal/student/absent", label: t("portal.nav.student.markAbsent", "Mark Absent"), icon: FileText },
            { href: "/portal/student/feedback", label: t("portal.nav.student.feedback", "Feedback"), icon: MessageSquare },
            { href: "/portal/student/report-cards", label: t("portal.nav.student.reportCards", "Report Cards"), icon: GraduationCap },
            { href: "/portal/preferences", label: t("portal.nav.student.preferences", "Preferences"), icon: Shield },
            { href: "/portal/settings", label: t("portal.settings.title", "Account Settings"), icon: Settings },
          ],
        },
      ];
    }

    if (role === "parent") {
      return [
        {
          title: t("portal.nav.parent.dashboard", "Dashboard"),
          items: [
            { href: "/portal/calendar", label: t("portal.nav.parent.calendar", "Calendar"), icon: CalendarDays },
            { href: "/portal/parent/dashboard", label: t("portal.nav.parent.dashboard", "Dashboard"), icon: Home },
            { href: "/portal/parent/enroll", label: t("portal.nav.parent.enrollClasses", "Enroll in Classes"), icon: GraduationCap },
            { href: "/portal/parent/referrals", label: t("portal.nav.parent.referFriend", "Refer a Friend"), icon: Share2 },
            { href: "/portal/parent/classes", label: t("portal.nav.parent.classes", "My Student's Classes"), icon: BookOpen },
            { href: "/portal/parent/attendance", label: t("portal.nav.parent.attendance", "Attendance"), icon: ClipboardCheck },
            { href: "/portal/parent/resources", label: t("portal.nav.parent.resources", "Resources"), icon: FileText },
            { href: "/portal/parent/private-sessions", label: t("portal.nav.parent.privateSessions", "Private Sessions"), icon: Calendar },
            { href: "/portal/parent/report-cards", label: t("portal.nav.parent.reportCards", "Report Cards"), icon: GraduationCap },
          ],
        },
        {
          title: t("portal.nav.parent.preferences", "Preferences"),
          items: [
            { href: "/portal/parent/legal", label: t("portal.nav.parent.legalDocs", "Legal Documents"), icon: FileCheck2 },
            { href: "/portal/parent/absent", label: t("portal.nav.parent.markAbsent", "Mark Absent"), icon: FileText },
            { href: "/portal/parent/preferences", label: t("portal.nav.parent.preferences", "Notification Preferences"), icon: Shield },
            { href: "/portal/settings", label: t("portal.settings.title", "Account Settings"), icon: Settings },
          ],
        },
      ];
    }

    return [];
  }, [currentLocale, role]);

  useEffect(() => {
    for (const section of navSections) {
      for (const item of section.items) {
        router.prefetch(item.href);
      }
    }
  }, [navSections, router]);

  function onNavClick(href: string) {
    if (pathname?.startsWith(href)) return;
    setPendingPath(href);
  }

  if (hideShell) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-warm-100 to-white dark:bg-[radial-gradient(circle_at_top,rgba(40,76,145,0.35),rgba(8,16,36,1)_55%)] dark:text-navy-100">
      <div className="pointer-events-none fixed inset-0 hidden dark:block bg-[radial-gradient(circle_at_20%_10%,rgba(236,197,90,0.08),transparent_45%)]" />
      <header className="fixed top-0 left-0 right-0 border-b border-warm-200/80 dark:border-navy-600/70 bg-white/90 dark:bg-navy-900/70 backdrop-blur-xl z-40 shadow-sm dark:shadow-black/30">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-charcoal/60 dark:text-navy-200/70">
              DSDC Portal
            </p>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-navy-800 dark:text-white truncate">
                {name || t("portal.shell.portalUser", "Portal User")}
              </p>
              <span className="hidden sm:inline-flex items-center rounded-full border border-gold-400/50 bg-gold-100 dark:bg-gold-900/25 px-2 py-0.5 text-[11px] font-semibold text-navy-900 dark:text-gold-100">
                {roleToLabel(role, t)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md border border-warm-300 dark:border-navy-500 dark:bg-navy-800/80 dark:text-navy-100"
              aria-label={t("portal.shell.openNavigation", "Open navigation")}
            >
              <Menu className="w-4 h-4" />
            </button>
            <ThemeToggle />
            <Link
              href="/"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-500 text-sm text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700/80 transition-colors"
            >
              {t("portal.shell.mainSite", "Main Site")}
            </Link>
            <form action="/portal/logout" method="post">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-md bg-navy-800 text-white text-sm hover:bg-navy-700 dark:bg-gold-300 dark:text-navy-900 dark:hover:bg-gold-200 transition-colors"
              >
                {t("portal.shell.logout", "Logout")}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="pt-[68px]">
        {mobileNavOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-[300px] max-w-[90vw] bg-white dark:bg-gradient-to-b dark:from-navy-900 dark:to-navy-950 shadow-xl p-4 overflow-y-auto">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-navy-900 dark:text-white">
                  {t("portal.shell.navigation", "Navigation")}
                </p>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="inline-flex items-center justify-center p-2 rounded-md border border-warm-300 dark:border-navy-500 dark:bg-navy-800/80"
                  aria-label={t("portal.shell.closeNavigation", "Close navigation")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <PortalNav
                role={role}
                pathname={pathname}
                sections={navSections}
                pendingPath={pendingPath}
                studentParam={studentParam}
                isParent={role === "parent"}
                t={t}
                localeUpdating={localeUpdating}
                timezoneUpdating={timezoneUpdating}
                currentLocale={currentLocale}
                displayTimezone={displayTimezone}
                onLocaleChange={onLocaleChange}
                onTimezoneChange={onTimezoneChange}
                onNavClick={onNavClick}
              />
              <div className="mt-4 pt-3 border-t border-warm-200 dark:border-navy-700">
                <button
                  type="button"
                  onClick={() => setBugModalOpen(true)}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-charcoal/50 dark:text-navy-400 hover:text-navy-700 dark:hover:text-navy-200 transition-colors w-full rounded-md hover:bg-warm-50 dark:hover:bg-navy-800"
                >
                  <Bug className="w-3.5 h-3.5" />
                  {t("portal.reportBug", "Report a Bug")}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <aside className="hidden lg:block fixed left-0 top-[68px] bottom-0 w-[290px] border-r border-warm-200 dark:border-navy-600/65 bg-white/80 dark:bg-navy-900/55 backdrop-blur-xl">
          <div className="h-full overflow-y-auto p-4">
            <div className="rounded-2xl border border-warm-200 dark:border-navy-600/70 bg-white/90 dark:bg-navy-800/55 shadow-md dark:shadow-black/25 p-4">
              <PortalNav
                role={role}
                pathname={pathname}
                sections={navSections}
                pendingPath={pendingPath}
                studentParam={studentParam}
                isParent={role === "parent"}
                t={t}
                localeUpdating={localeUpdating}
                timezoneUpdating={timezoneUpdating}
                currentLocale={currentLocale}
                displayTimezone={displayTimezone}
                onLocaleChange={onLocaleChange}
                onTimezoneChange={onTimezoneChange}
                onNavClick={onNavClick}
              />
              <div className="mt-4 pt-3 border-t border-warm-200 dark:border-navy-700">
                <button
                  type="button"
                  onClick={() => setBugModalOpen(true)}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-charcoal/50 dark:text-navy-400 hover:text-navy-700 dark:hover:text-navy-200 transition-colors w-full rounded-md hover:bg-warm-50 dark:hover:bg-navy-800"
                >
                  <Bug className="w-3.5 h-3.5" />
                  {t("portal.reportBug", "Report a Bug")}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 lg:ml-[290px] px-4 sm:px-6 lg:px-8 py-7">
          <div className="max-w-6xl">{children}</div>
        </main>
      </div>
      <BugReportModal
        open={bugModalOpen}
        onClose={() => setBugModalOpen(false)}
        userEmail={email || "unknown"}
        userRole={role || "unknown"}
      />
    </div>
  );
}
