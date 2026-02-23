"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Banknote,
  Calendar,
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
  UserSquare2,
  Users,
  X,
} from "lucide-react";
import type { PortalRole } from "@/lib/portal/auth";
import ThemeToggle from "@/components/ThemeToggle";
import StudentSelector from "@/app/portal/_components/StudentSelector";

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

type ParentCopy = {
  language: string;
  student: string;
  noStudents: string;
  dashboard: string;
  classes: string;
  attendance: string;
  resources: string;
  reportCards: string;
  legal: string;
  absent: string;
  preferences: string;
  privateSessions: string;
};

const parentLabel = {
  en: {
    language: "Language",
    student: "Student",
    noStudents: "No linked students",
    dashboard: "Dashboard",
    classes: "My Student's Classes",
    attendance: "Attendance",
    resources: "Resources",
    reportCards: "Report Cards",
    legal: "Legal Documents",
    absent: "Mark Absent",
    preferences: "Notification Preferences",
    privateSessions: "Private Sessions",
  },
  zh: {
    language: "\u8bed\u8a00",
    student: "\u5b66\u751f",
    noStudents: "\u6ca1\u6709\u5df2\u5173\u8054\u5b66\u751f",
    dashboard: "\u6982\u89c8",
    classes: "\u5b66\u751f\u8bfe\u7a0b",
    attendance: "\u51fa\u52e4",
    resources: "\u5b66\u4e60\u8d44\u6599",
    reportCards: "\u6210\u7ee9\u62a5\u544a",
    legal: "\u6cd5\u5f8b\u6587\u4ef6",
    absent: "\u8bf7\u5047",
    preferences: "\u901a\u77e5\u504f\u597d",
    privateSessions: "\u79c1\u8bfe",
  },
} as const;

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
  parentCopy,
  localeUpdating,
  currentParentLocale,
  onLocaleChange,
  onNavClick,
}: {
  role: PortalRole | null;
  pathname: string | null;
  sections: NavSection[];
  pendingPath: string | null;
  studentParam: string | null;
  isParent: boolean;
  parentCopy: ParentCopy;
  localeUpdating: boolean;
  currentParentLocale: "en" | "zh";
  onLocaleChange: (nextLocale: "en" | "zh") => Promise<void>;
  onNavClick: (href: string) => void;
}) {
  return (
    <>
      {isParent ? (
        <div className="mb-4 space-y-3 rounded-xl border border-warm-200 dark:border-navy-600/60 bg-warm-50 dark:bg-navy-900/55 p-3 shadow-sm dark:shadow-black/25">
          <StudentSelector label={parentCopy.student} emptyLabel={parentCopy.noStudents} />
          <label className="block">
            <span className="block text-xs mb-1 uppercase tracking-wide text-charcoal/60 dark:text-navy-200/80">
              {parentCopy.language}
            </span>
            <select
              disabled={localeUpdating}
              value={currentParentLocale}
              onChange={(event) => onLocaleChange(event.target.value as "en" | "zh")}
              className="w-full rounded-md border border-warm-300 dark:border-navy-500 bg-white dark:bg-navy-900 px-2 py-1.5 text-sm"
            >
              <option value="en">English</option>
              <option value="zh">{"\u4e2d\u6587"}</option>
            </select>
          </label>
        </div>
      ) : null}

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
  const hideShell = pathname === "/portal/login";
  const [localeUpdating, setLocaleUpdating] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const currentParentLocale = locale === "zh" ? "zh" : "en";
  const studentSessionsLabel = locale === "zh" ? "我的私课" : "My Sessions";
  const studentParam = searchParams.get("student");
  const parentCopy = parentLabel[currentParentLocale];

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

  const navSections = useMemo<NavSection[]>(() => {
    if (role === "admin") {
      return [
        {
          title: "Overview",
          items: [
            { href: "/portal/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/portal/admin/terms", label: "Terms", icon: Calendar },
            { href: "/portal/admin/classes", label: "Classes", icon: BookOpen },
            { href: "/portal/admin/report-cards", label: "Report Cards", icon: GraduationCap },
            { href: "/portal/admin/payroll", label: "Payroll", icon: ClipboardCheck },
            { href: "/portal/admin/availability", label: "Availability", icon: Calendar },
            { href: "/portal/admin/subs", label: "Sub Requests", icon: Users },
            { href: "/portal/admin/private-sessions", label: "Private Sessions", icon: ClipboardCheck },
            { href: "/portal/admin/etransfers", label: "E-Transfers", icon: Banknote },
            { href: "/portal/admin/pending-approvals", label: "Pending Approvals", icon: ClipboardCheck },
            { href: "/portal/admin/login-log", label: "Login Log", icon: ClipboardList },
          ],
        },
        {
          title: "People",
          items: [
            { href: "/portal/admin/students", label: "Students", icon: GraduationCap },
            { href: "/portal/admin/coaches", label: "Coaches", icon: UserSquare2 },
            { href: "/portal/admin/enroll", label: "Enroll", icon: FileCheck2 },
            { href: "/portal/signup", label: "Create User", icon: Shield },
          ],
        },
        {
          title: "Documents",
          items: [{ href: "/portal/admin/legal", label: "Legal Docs", icon: FileText }],
        },
      ];
    }

    if (role === "coach" || role === "ta") {
      return [
        {
          title: "Teaching",
          items: [
            { href: "/portal/coach/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/portal/coach/checkin", label: "Check-in", icon: ClipboardCheck },
            { href: "/portal/coach/classes", label: "My Classes", icon: BookOpen },
            { href: "/portal/coach/report-cards", label: "Report Cards", icon: GraduationCap },
            { href: "/portal/coach/hours", label: "My Hours", icon: Calendar },
          ],
        },
        {
          title: "Scheduling",
          items: [
            { href: "/portal/coach/availability", label: "Availability", icon: Calendar },
            { href: "/portal/coach/subs", label: "Sub Requests", icon: Users },
            { href: "/portal/coach/private-sessions", label: "Private Sessions", icon: ClipboardCheck },
            { href: "/portal/preferences", label: "Preferences", icon: Shield },
          ],
        },
      ];
    }

    if (role === "student") {
      return [
        {
          title: "Learning",
          items: [
            { href: "/portal/student/classes", label: "My Classes", icon: BookOpen },
            { href: "/portal/student/attendance", label: "Attendance", icon: ClipboardCheck },
            { href: "/portal/student/resources", label: "Resources", icon: FileText },
            { href: "/portal/student/makeup", label: "Make-up Classes", icon: Calendar },
          ],
        },
        {
          title: "Actions",
          items: [
            { href: "/portal/student/booking", label: "Book Private Session", icon: Calendar },
            { href: "/portal/student/private-sessions", label: studentSessionsLabel, icon: Calendar },
            { href: "/portal/student/link-parent", label: "Link Parent", icon: Users },
            { href: "/portal/student/legal", label: "Legal Documents", icon: FileCheck2 },
            { href: "/portal/student/absent", label: "Mark Absent", icon: FileText },
            { href: "/portal/student/feedback", label: "Feedback", icon: MessageSquare },
            { href: "/portal/student/report-cards", label: "Report Cards", icon: GraduationCap },
            { href: "/portal/preferences", label: "Preferences", icon: Shield },
          ],
        },
      ];
    }

    if (role === "parent") {
      return [
        {
          title: parentCopy.dashboard,
          items: [
            { href: "/portal/parent/dashboard", label: parentCopy.dashboard, icon: Home },
            { href: "/portal/parent/classes", label: parentCopy.classes, icon: BookOpen },
            { href: "/portal/parent/attendance", label: parentCopy.attendance, icon: ClipboardCheck },
            { href: "/portal/parent/resources", label: parentCopy.resources, icon: FileText },
            { href: "/portal/parent/private-sessions", label: parentCopy.privateSessions, icon: Calendar },
            { href: "/portal/parent/report-cards", label: parentCopy.reportCards, icon: GraduationCap },
          ],
        },
        {
          title: parentCopy.preferences,
          items: [
            { href: "/portal/parent/legal", label: parentCopy.legal, icon: FileCheck2 },
            { href: "/portal/parent/absent", label: parentCopy.absent, icon: FileText },
            { href: "/portal/parent/preferences", label: parentCopy.preferences, icon: Shield },
          ],
        },
      ];
    }

    return [];
  }, [parentCopy, role, studentSessionsLabel]);

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

  async function onLocaleChange(nextLocale: "en" | "zh") {
    if (nextLocale === currentParentLocale) return;
    setLocaleUpdating(true);
    await fetch("/api/portal/profile/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    });
    setLocaleUpdating(false);
    router.refresh();
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
            <p className="text-xs uppercase tracking-[0.16em] text-charcoal/60 dark:text-navy-200/70">DSDC Portal</p>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-navy-800 dark:text-white truncate">{name || "Portal User"}</p>
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
            <Link href="/" className="hidden sm:inline-flex px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-500 text-sm text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700/80 transition-colors">
              Main Site
            </Link>
            <form action="/portal/logout" method="post">
              <button type="submit" className="px-3 py-1.5 rounded-md bg-navy-800 text-white text-sm hover:bg-navy-700 dark:bg-gold-300 dark:text-navy-900 dark:hover:bg-gold-200 transition-colors">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="pt-[68px]">
        {mobileNavOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={() => setMobileNavOpen(false)} />
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
                parentCopy={parentCopy}
                localeUpdating={localeUpdating}
                currentParentLocale={currentParentLocale}
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
                parentCopy={parentCopy}
                localeUpdating={localeUpdating}
                currentParentLocale={currentParentLocale}
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
