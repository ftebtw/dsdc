export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

export default function PortalCoachIndexPage() {
  redirect('/portal/coach/dashboard');
}
