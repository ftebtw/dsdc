export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

export default function ParentPortalIndexPage() {
  redirect('/portal/parent/dashboard');
}
