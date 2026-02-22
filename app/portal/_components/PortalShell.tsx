"use client";

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, type ReactNode } from 'react';
import type { PortalRole } from '@/lib/portal/auth';
import StudentSelector from '@/app/portal/_components/StudentSelector';

type Props = {
  role: PortalRole | null;
  name?: string | null;
  locale?: 'en' | 'zh';
  children: ReactNode;
};

const parentLabel = {
  en: {
    language: 'Language',
    student: 'Student',
    noStudents: 'No linked students',
    dashboard: 'Dashboard',
    classes: "My Student's Classes",
    attendance: 'Attendance',
    resources: 'Resources',
    reportCards: 'Report Cards',
    legal: 'Legal Documents',
    absent: 'Mark Absent',
    preferences: 'Notification Preferences',
  },
  zh: {
    language: '\u8bed\u8a00',
    student: '\u5b66\u751f',
    noStudents: '\u6ca1\u6709\u5df2\u5173\u8054\u5b66\u751f',
    dashboard: '\u6982\u89c8',
    classes: '\u5b66\u751f\u8bfe\u7a0b',
    attendance: '\u51fa\u52e4',
    resources: '\u5b66\u4e60\u8d44\u6599',
    reportCards: '\u6210\u7ee9\u62a5\u544a',
    legal: '\u6cd5\u5f8b\u6587\u4ef6',
    absent: '\u8bf7\u5047',
    preferences: '\u901a\u77e5\u504f\u597d',
  },
} as const;

export default function PortalShell({ role, name, locale = 'en', children }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hideShell = pathname === '/portal/login';
  const [localeUpdating, setLocaleUpdating] = useState(false);

  if (hideShell) {
    return <>{children}</>;
  }

  const currentParentLocale = locale === 'zh' ? 'zh' : 'en';
  const studentParam = searchParams.get('student');
  const parentCopy = parentLabel[currentParentLocale];

  const links = useMemo(() => {
    if (role === 'admin') {
      return [
        { href: '/portal/admin/dashboard', label: 'Dashboard' },
        { href: '/portal/admin/terms', label: 'Terms' },
        { href: '/portal/admin/classes', label: 'Classes' },
        { href: '/portal/admin/students', label: 'Students' },
        { href: '/portal/admin/coaches', label: 'Coaches' },
        { href: '/portal/admin/enroll', label: 'Enroll' },
        { href: '/portal/admin/legal', label: 'Legal Docs' },
        { href: '/portal/signup', label: 'Create User' },
      ];
    }

    if (role === 'coach' || role === 'ta') {
      return [
        { href: '/portal/coach/dashboard', label: 'Dashboard' },
        { href: '/portal/coach/checkin', label: 'Check-in' },
        { href: '/portal/coach/classes', label: 'My Classes' },
      ];
    }

    if (role === 'student') {
      return [
        { href: '/portal/student/classes', label: 'My Classes' },
        { href: '/portal/student/attendance', label: 'Attendance' },
        { href: '/portal/student/resources', label: 'Resources' },
        { href: '/portal/student/booking', label: 'Book Private Session' },
        { href: '/portal/student/report-cards', label: 'Report Cards' },
        { href: '/portal/student/legal', label: 'Legal Documents' },
        { href: '/portal/student/absent', label: 'Mark Absent' },
        { href: '/portal/student/feedback', label: 'Feedback' },
        { href: '/portal/student/makeup', label: 'Make-up Classes' },
      ];
    }

    if (role === 'parent') {
      return [
        { href: '/portal/parent/dashboard', label: parentCopy.dashboard },
        { href: '/portal/parent/classes', label: parentCopy.classes },
        { href: '/portal/parent/attendance', label: parentCopy.attendance },
        { href: '/portal/parent/resources', label: parentCopy.resources },
        { href: '/portal/parent/report-cards', label: parentCopy.reportCards },
        { href: '/portal/parent/legal', label: parentCopy.legal },
        { href: '/portal/parent/absent', label: parentCopy.absent },
        { href: '/portal/parent/preferences', label: parentCopy.preferences },
      ];
    }

    return [];
  }, [parentCopy, role]);

  async function onLocaleChange(nextLocale: 'en' | 'zh') {
    if (nextLocale === currentParentLocale) return;
    setLocaleUpdating(true);
    await fetch('/api/portal/profile/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: nextLocale }),
    });
    setLocaleUpdating(false);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-warm-100 dark:bg-navy-900">
      <header className="border-b border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-900 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300">DSDC Portal</p>
            <p className="font-semibold text-navy-800 dark:text-white">{name || 'Portal User'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">
              Main Site
            </Link>
            <form action="/portal/logout" method="post">
              <button type="submit" className="px-3 py-1.5 rounded-md bg-navy-800 text-white text-sm">Logout</button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px,1fr] gap-6">
        <aside className="rounded-xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-4 h-fit">
          {role === 'parent' ? (
            <div className="mb-4 space-y-3">
              <StudentSelector label={parentCopy.student} emptyLabel={parentCopy.noStudents} />
              <label className="block">
                <span className="block text-xs mb-1 uppercase tracking-wide text-charcoal/60 dark:text-navy-300">
                  {parentCopy.language}
                </span>
                <select
                  disabled={localeUpdating}
                  value={currentParentLocale}
                  onChange={(event) => onLocaleChange(event.target.value as 'en' | 'zh')}
                  className="w-full rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-2 py-1.5 text-sm"
                >
                  <option value="en">English</option>
                  <option value="zh">{'\u4e2d\u6587'}</option>
                </select>
              </label>
            </div>
          ) : null}
          <nav className="space-y-1">
            {links.map((link) => {
              const active = pathname?.startsWith(link.href);
              const href =
                role === 'parent' && studentParam
                  ? `${link.href}?student=${encodeURIComponent(studentParam)}`
                  : link.href;
              return (
                <Link
                  key={link.href}
                  href={href}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-gold-300 text-navy-900'
                      : 'text-navy-700 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}

