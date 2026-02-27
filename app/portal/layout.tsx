import { Suspense, type ReactNode } from 'react';
import PortalShell from './_components/PortalShell';
import { getCurrentSessionProfile } from '@/lib/portal/auth';

function PortalSkeleton() {
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-navy-950">
      <div className="h-14 border-b border-warm-200/80 dark:border-navy-600/70 bg-white/90 dark:bg-navy-900/70" />
    </div>
  );
}

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSessionProfile();
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <PortalShell
        role={session?.profile.role ?? null}
        name={session?.profile.display_name}
        email={session?.profile.email}
        locale={session?.profile.locale ?? 'en'}
        timezone={session?.profile.timezone ?? 'America/Vancouver'}
      >
        {children}
      </PortalShell>
    </Suspense>
  );
}
