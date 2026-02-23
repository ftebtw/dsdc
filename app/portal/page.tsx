export const dynamic = 'force-dynamic';

import { redirectByCurrentRole } from '@/lib/portal/auth';

export default async function PortalRootPage() {
  await redirectByCurrentRole();
  return null;
}
