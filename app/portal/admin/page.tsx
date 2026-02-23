export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

export default function PortalAdminIndexPage() {
  redirect('/portal/admin/dashboard');
}
