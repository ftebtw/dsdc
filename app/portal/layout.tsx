import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';
import PortalShell from './_components/PortalShell';
import { getCurrentSessionProfile } from '@/lib/portal/auth';
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
      const { count } = await (supabase as any)
        .from('feedback_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending_admin');
      return {
        '/portal/admin/feedback': count ?? 0,
      };
    }
    if (role === 'coach' || role === 'ta') {
      // RLS scopes the query to the coach's class team, so a plain
      // pending_coach count is what the coach owes.
      const { count } = await (supabase as any)
        .from('feedback_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending_coach');
      return {
        '/portal/coach/feedback': count ?? 0,
      };
    }
    return {};
  } catch (error) {
    console.error('[portal-layout] badge count fetch failed', error);
    return {};
  }
}

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSessionProfile();
  const badgeCounts = await fetchSidebarBadgeCounts(session?.profile.role);
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
        {children}
      </PortalShell>
    </Suspense>
  );
}
