export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/portal/auth';
import PortalSignupForm from '@/app/portal/_components/PortalSignupForm';

export default async function PortalSignupPage() {
  await requireRole(['admin']);
  return <PortalSignupForm />;
}
