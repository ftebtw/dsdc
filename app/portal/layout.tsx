import type { ReactNode } from 'react';
import PortalShell from './_components/PortalShell';
import { getCurrentSessionProfile } from '@/lib/portal/auth';

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSessionProfile();
  return (
    <PortalShell
      role={session?.profile.role ?? null}
      name={session?.profile.display_name}
      locale={session?.profile.locale ?? 'en'}
    >
      {children}
    </PortalShell>
  );
}
