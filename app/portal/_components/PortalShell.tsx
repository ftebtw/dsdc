"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  BookOpen,
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
  Shield,
  Star,
  UserSquare2,
  Users,
  X,
} from "lucide-react";
import StudentSelector from "@/app/portal/_components/StudentSelector";
import ThemeToggle from "@/components/ThemeToggle";
import { useI18n } from "@/lib/i18n";
import type { PortalRole } from "@/lib/portal/auth";

type Props = {
  role: PortalRole | null;
  name?: string | null;
  locale?: "en" | "zh";
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

type PortalCopy = {
  language: string;
  dashboard: string;
  student: string;
  noStudents: string;
  classes: string;
  attendance: string;
  resources: string;
  reportCards: string;
  legal: string;
  absent: string;
  preferences: string;
  privateSessions: string;
  adminOverview: string;
  adminPeople: string;
  adminDocuments: string;
  terms: string;
  allClasses: string;
  payroll: string;
  availability: string;
  subRequests: string;
  etransfers: string;
  pendingApprovals: string;
  loginLog: string;
  students: string;
  parents: string;
  coaches: string;
  enroll: string;
  createUser: string;
  legalDocs: string;
  teaching: string;
  scheduling: string;
  checkin: string;
  myClasses: string;
  myHours: string;
  learning: string;
  actions: string;
  makeupClasses: string;
  bookPrivateSession: string;
  mySessions: string;
  linkParent: string;
  feedback: string;
  classCredits: string;
  calendar: string;
};

const portalLabel: Record<"en" | "zh", PortalCopy> = {
  en: {
    language: "Language",
    dashboard: "Dashboard",
    student: "Student",
    noStudents: "No linked students",
    classes: "My Student's Classes",
    attendance: "Attendance",
    resources: "Resources",
    reportCards: "Report Cards",
    legal: "Legal Documents",
    absent: "Report Absence",
    preferences: "Notification Preferences",
    privateSessions: "Private Sessions",
    adminOverview: "Overview",
    adminPeople: "People",
    adminDocuments: "Documents",
    terms: "Terms",
    allClasses: "Classes",
    payroll: "Payroll",
    availability: "Availability",
    subRequests: "Sub Requests",
    etransfers: "E-Transfers",
    pendingApprovals: "Pending Approvals",
    loginLog: "Login Log",
    students: "Students",
    parents: "Parents",
    coaches: "Coaches",
    enroll: "Enroll",
    createUser: "Create User",
    legalDocs: "Legal Docs",
    teaching: "Teaching",
    scheduling: "Scheduling",
    checkin: "Check-in",
    myClasses: "My Classes",
    myHours: "My Hours",
    learning: "Learning",
    actions: "Actions",
    makeupClasses: "Make-up Classes",
    bookPrivateSession: "Book Private Session",
    mySessions: "My Sessions",
    linkParent: "Link Parent",
    feedback: "Feedback",
    classCredits: "Class Credits",
    calendar: "Calendar",
  },
  zh: {
    language: "\u8bed\u8a00",
    dashboard: "\u6982\u89c8",
    student: "\u5b66\u751f",
    noStudents: "\u6ca1\u6709\u5df2\u5173\u8054\u5b66\u751f",
    classes: "\u5b66\u751f\u8bfe\u7a0b",
    attendance: "\u51fa\u52e4",
    resources: "\u5b66\u4e60\u8d44\u6599",
    reportCards: "\u6210\u7ee9\u62a5\u544a",
    legal: "\u6cd5\u5f8b\u6587\u4ef6",
    absent: "\u62a5\u544a\u7f3a\u5e2d",
    preferences: "\u901a\u77e5\u504f\u597d",
    privateSessions: "\u79c1\u8bfe",
    adminOverview: "\u603b\u89c8",
    adminPeople: "\u4eba\u5458",
    adminDocuments: "\u6587\u4ef6",
    terms: "\u5b66\u671f",
    allClasses: "\u73ed\u7ea7",
    payroll: "\u5de5\u8d44\u5355",
    availability: "\u53ef\u7528\u65f6\u95f4",
    subRequests: "\u4ee3\u8bfe\u8bf7\u6c42",
    etransfers: "\u7535\u5b50\u8f6c\u8d26",
    pendingApprovals: "\u5f85\u5ba1\u6279",
    loginLog: "\u767b\u5f55\u8bb0\u5f55",
    students: "\u5b66\u751f",
    parents: "\u5bb6\u957f",
    coaches: "\u6559\u7ec3",
    enroll: "\u6ce8\u518c",
    createUser: "\u521b\u5efa\u7528\u6237",
    legalDocs: "\u6cd5\u5f8b\u6587\u4ef6",
    teaching: "\u6559\u5b66",
    scheduling: "\u6392\u8bfe",
    checkin: "\u7b7e\u5230",
    myClasses: "\u6211\u7684\u8bfe\u7a0b",
    myHours: "\u6211\u7684\u8bfe\u65f6",
    learning: "\u5b66\u4e60",
    actions: "\u64cd\u4f5c",
    makeupClasses: "\u8865\u8bfe",
    bookPrivateSession: "\u9884\u7ea6\u79c1\u8bfe",
    mySessions: "\u6211\u7684\u79c1\u8bfe",
    linkParent: "\u5173\u8054\u5bb6\u957f",
    feedback: "\u53cd\u9988",
    classCredits: "\u8bfe\u65f6\u79ef\u5206",
    calendar: "\u65e5\u5386",
  },
};

function roleToLabel(role: PortalRole | null): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "coach":
      return "Coach";
    case "ta":
      return "TA";
    case "student":
      return "Student";
    case "parent":
      return "Parent";
    default:
      return "Portal";
  }
}

function PortalNav({
  role,
  pathname,
  sections,
  pendingPath,
  studentParam,
  isParent,
  copy,
  localeUpdating,
  currentLocale,
  onLocaleChange,
  onNavClick,
}: {
  role: PortalRole | null;
  pathname: string | null;
  sections: NavSection[];
  pendingPath: string | null;
  studentParam: string | null;
  isParent: boolean;
  copy: PortalCopy;
  localeUpdating: boolean;
  currentLocale: "en" | "zh";
  onLocaleChange: (nextLocale: "en" | "zh") => Promise<void>;
  onNavClick: (href: string) => void;
}) {
  return (
    <>
      {isParent ? (
        <div className="mb-4 rounded-xl border border-warm-200 dark:border-navy-600/60 bg-warm-50 dark:bg-navy-900/55 p-3 shadow-sm dark:shadow-black/25">
          <StudentSelector label={copy.student} emptyLabel={copy.noStudents} />
        </div>
      ) : null}

      <div className="mb-4">
        <label className="block">
          <span className="block text-xs mb-1 uppercase tracking-wide text-charcoal/60 dark:text-navy-200/80">
            {copy.language}
          </span>
          <select
            disabled={localeUpdating}
            value={currentLocale}
            onChange={(event) => {
              void onLocaleChange(event.target.value as "en" | "zh");
            }}
            className="w-full rounded-md border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-900 px-2 py-1.5 text-sm"
          >
            <option value="en">English</option>
            <option value="zh">{"\u4e2d\u6587"}</option>
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

export default function PortalShell({ role, name, locale = "en", children }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale: i18nLocale, setLocale: setI18nLocale } = useI18n();
  const hideShell = pathname === "/portal/login";

  const [optimisticLocale, setOptimisticLocale] = useState<"en" | "zh">(
    locale === "zh" ? "zh" : "en"
  );
  const [localeUpdating, setLocaleUpdating] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const currentLocale = optimisticLocale;
  const copy = portalLabel[currentLocale];
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

  async function onLocaleChange(nextLocale: "en" | "zh") {
    if (nextLocale === currentLocale) return;

    if (typeof window !== "undefined") {
      localStorage.setItem("dsdc-portal-locale-set", "true");
    }

    setOptimisticLocale(nextLocale);
    setI18nLocale(nextLocale);
    setLocaleUpdating(true);

    try {
      const response = await fetch("/api/portal/profile/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });

      if (!response.ok) {
        throw new Error("Failed to update locale.");
      }
    } catch {
      const reverted = nextLocale === "en" ? "zh" : "en";
      setOptimisticLocale(reverted);
      setI18nLocale(reverted);
    }

    setLocaleUpdating(false);
    router.refresh();
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
          title: copy.adminOverview,
          items: [
            { href: "/portal/admin/dashboard", label: copy.dashboard, icon: LayoutDashboard },
            { href: "/portal/calendar", label: copy.calendar, icon: CalendarDays },
            { href: "/portal/admin/terms", label: copy.terms, icon: Calendar },
            { href: "/portal/admin/classes", label: copy.allClasses, icon: BookOpen },
            { href: "/portal/admin/report-cards", label: copy.reportCards, icon: GraduationCap },
            { href: "/portal/admin/payroll", label: copy.payroll, icon: ClipboardCheck },
            { href: "/portal/admin/availability", label: copy.availability, icon: Calendar },
            { href: "/portal/admin/subs", label: copy.subRequests, icon: Users },
            {
              href: "/portal/admin/private-sessions",
              label: copy.privateSessions,
              icon: ClipboardCheck,
            },
            { href: "/portal/admin/etransfers", label: copy.etransfers, icon: Banknote },
            {
              href: "/portal/admin/pending-approvals",
              label: copy.pendingApprovals,
              icon: ClipboardCheck,
            },
            { href: "/portal/admin/login-log", label: copy.loginLog, icon: ClipboardList },
          ],
        },
        {
          title: copy.adminPeople,
          items: [
            { href: "/portal/admin/students", label: copy.students, icon: GraduationCap },
            { href: "/portal/admin/parents", label: copy.parents, icon: Users },
            { href: "/portal/admin/coaches", label: copy.coaches, icon: UserSquare2 },
            { href: "/portal/admin/enroll", label: copy.enroll, icon: FileCheck2 },
            { href: "/portal/signup", label: copy.createUser, icon: Shield },
          ],
        },
        {
          title: copy.adminDocuments,
          items: [{ href: "/portal/admin/legal", label: copy.legalDocs, icon: FileText }],
        },
      ];
    }

    if (role === "coach" || role === "ta") {
      return [
        {
          title: copy.teaching,
          items: [
            { href: "/portal/coach/dashboard", label: copy.dashboard, icon: LayoutDashboard },
            { href: "/portal/calendar", label: copy.calendar, icon: CalendarDays },
            { href: "/portal/coach/checkin", label: copy.checkin, icon: ClipboardCheck },
            { href: "/portal/coach/classes", label: copy.myClasses, icon: BookOpen },
            { href: "/portal/coach/report-cards", label: copy.reportCards, icon: GraduationCap },
            { href: "/portal/coach/hours", label: copy.myHours, icon: Calendar },
          ],
        },
        {
          title: copy.scheduling,
          items: [
            { href: "/portal/coach/availability", label: copy.availability, icon: Calendar },
            { href: "/portal/coach/subs", label: copy.subRequests, icon: Users },
            {
              href: "/portal/coach/private-sessions",
              label: copy.privateSessions,
              icon: ClipboardCheck,
            },
            { href: "/portal/preferences", label: copy.preferences, icon: Shield },
          ],
        },
      ];
    }

    if (role === "student") {
      return [
        {
          title: copy.learning,
          items: [
            { href: "/portal/calendar", label: copy.calendar, icon: CalendarDays },
            { href: "/portal/student/classes", label: copy.myClasses, icon: BookOpen },
            { href: "/portal/student/attendance", label: copy.attendance, icon: ClipboardCheck },
            { href: "/portal/student/resources", label: copy.resources, icon: FileText },
            { href: "/portal/student/makeup", label: copy.makeupClasses, icon: Calendar },
            { href: "/portal/student/credits", label: copy.classCredits, icon: Star },
          ],
        },
        {
          title: copy.actions,
          items: [
            {
              href: "/portal/student/booking",
              label: copy.bookPrivateSession,
              icon: Calendar,
            },
            { href: "/portal/student/private-sessions", label: copy.mySessions, icon: Calendar },
            { href: "/portal/student/link-parent", label: copy.linkParent, icon: Users },
            { href: "/portal/student/legal", label: copy.legal, icon: FileCheck2 },
            { href: "/portal/student/absent", label: copy.absent, icon: FileText },
            { href: "/portal/student/feedback", label: copy.feedback, icon: MessageSquare },
            { href: "/portal/student/report-cards", label: copy.reportCards, icon: GraduationCap },
            { href: "/portal/preferences", label: copy.preferences, icon: Shield },
          ],
        },
      ];
    }

    if (role === "parent") {
      return [
        {
          title: copy.dashboard,
          items: [
            { href: "/portal/calendar", label: copy.calendar, icon: CalendarDays },
            { href: "/portal/parent/dashboard", label: copy.dashboard, icon: Home },
            { href: "/portal/parent/classes", label: copy.classes, icon: BookOpen },
            { href: "/portal/parent/attendance", label: copy.attendance, icon: ClipboardCheck },
            { href: "/portal/parent/resources", label: copy.resources, icon: FileText },
            { href: "/portal/parent/private-sessions", label: copy.privateSessions, icon: Calendar },
            { href: "/portal/parent/report-cards", label: copy.reportCards, icon: GraduationCap },
          ],
        },
        {
          title: copy.preferences,
          items: [
            { href: "/portal/parent/legal", label: copy.legal, icon: FileCheck2 },
            { href: "/portal/parent/absent", label: copy.absent, icon: FileText },
            { href: "/portal/parent/preferences", label: copy.preferences, icon: Shield },
          ],
        },
      ];
    }

    return [];
  }, [copy, role]);

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
                {name || "Portal User"}
              </p>
              <span className="hidden sm:inline-flex items-center rounded-full border border-gold-400/50 bg-gold-100 dark:bg-gold-900/25 px-2 py-0.5 text-[11px] font-semibold text-navy-900 dark:text-gold-100">
                {roleToLabel(role)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md border border-warm-300 dark:border-navy-500 dark:bg-navy-800/80 dark:text-navy-100"
              aria-label="Open navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
            <ThemeToggle />
            <Link
              href="/"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-500 text-sm text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700/80 transition-colors"
            >
              Main Site
            </Link>
            <form action="/portal/logout" method="post">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-md bg-navy-800 text-white text-sm hover:bg-navy-700 dark:bg-gold-300 dark:text-navy-900 dark:hover:bg-gold-200 transition-colors"
              >
                Logout
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
                <p className="font-semibold text-navy-900 dark:text-white">Navigation</p>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="inline-flex items-center justify-center p-2 rounded-md border border-warm-300 dark:border-navy-500 dark:bg-navy-800/80"
                  aria-label="Close navigation"
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
                copy={copy}
                localeUpdating={localeUpdating}
                currentLocale={currentLocale}
                onLocaleChange={onLocaleChange}
                onNavClick={onNavClick}
              />
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
                copy={copy}
                localeUpdating={localeUpdating}
                currentLocale={currentLocale}
                onLocaleChange={onLocaleChange}
                onNavClick={onNavClick}
              />
            </div>
          </div>
        </aside>

        <main className="min-w-0 lg:ml-[290px] px-4 sm:px-6 lg:px-8 py-7">
          <div className="max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
