import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';
import PortalShell from './_components/PortalShell';
import PayrollReviewBanner from './_components/PayrollReviewBanner';
import { getCurrentSessionProfile } from '@/lib/portal/auth';
import { parseYearMonthKey } from '@/lib/portal/payroll-submissions';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

function PortalSkeleton() {
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-navy-950">
      <div className="h-14 border-b border-warm-200/80 dark:border-navy-600/70 bg-white/90 dark:bg-navy-900/70" />
    </div>
  );
}

async function fetchSidebarBadgeCounts(role: string | undefined): Promise<Record<string, number>> {
  if (!role) return {};
  try {
    const supabase = await getSupabaseServerClient();
    if (role === 'admin') {
      const [{ count: requestsCount }, { count: weeklyCount }] = await Promise.all([
        (supabase as any)
          .from('feedback_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending_admin'),
        (supabase as any)
          .from('class_feedback')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending_admin'),
      ]);
      return {
        '/portal/admin/feedback': (requestsCount ?? 0) + (weeklyCount ?? 0),
      };
    }
    if (role === 'coach' || role === 'ta') {
      // RLS scopes the query to the coach's class team, so a plain
      // pending_coach count is what the coach owes.
      const [{ count: feedbackCount }, { count: payrollCount }] = await Promise.all([
        (supabase as any)
          .from('feedback_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending_coach'),
        (supabase as any)
          .from('payroll_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'draft'),
      ]);
      return {
        '/portal/coach/feedback': feedbackCount ?? 0,
        '/portal/coach/payroll-review': payrollCount ?? 0,
      };
    }
    return {};
  } catch (error) {
    console.error('[portal-layout] badge count fetch failed', error);
    return {};
  }
}

async function fetchPendingPayrollForBanner(role: string | undefined, userId: string | undefined) {
  if (!userId || (role !== 'coach' && role !== 'ta')) return null;
  try {
    const supabase = await getSupabaseServerClient();
    const { data } = await (supabase as any)
      .from('payroll_submissions')
      .select('id,year_month,computed_hours')
      .eq('coach_id', userId)
      .eq('status', 'draft')
      .order('year_month', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    const label = parseYearMonthKey(data.year_month)?.label ?? data.year_month;
    return {
      id: data.id as string,
      monthLabel: label,
      computedHours: Number(data.computed_hours),
    };
  } catch (error) {
    console.error('[portal-layout] payroll banner fetch failed', error);
    return null;
  }
}

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSessionProfile();
  const [badgeCounts, pendingPayroll] = await Promise.all([
    fetchSidebarBadgeCounts(session?.profile.role),
    fetchPendingPayrollForBanner(session?.profile.role, session?.userId),
  ]);
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <PortalShell
        role={session?.profile.role ?? null}
        name={session?.profile.display_name}
        email={session?.profile.email}
        locale={session?.profile.locale ?? 'en'}
        timezone={session?.profile.timezone ?? 'America/Vancouver'}
        badgeCounts={badgeCounts}
      >
        {pendingPayroll ? (
          <PayrollReviewBanner
            submissionId={pendingPayroll.id}
            monthLabel={pendingPayroll.monthLabel}
            computedHours={pendingPayroll.computedHours}
          />
        ) : null}
        {children}
      </PortalShell>
    </Suspense>
  );
}
