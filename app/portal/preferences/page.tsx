import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';

export default async function PortalPreferencesPage() {
  const session = await requireRole(['admin', 'coach', 'ta', 'student', 'parent']);

  if (session.profile.role === 'parent') {
    return (
      <SectionCard title="Preferences" description="Parents manage notification options in the parent portal.">
        <Link href="/portal/parent/preferences" className="underline text-navy-700 dark:text-navy-200 text-sm">
          Go to Parent Preferences
        </Link>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Preferences" description="Email preference automation for this role will be expanded in Phase E.">
      <p className="text-sm text-charcoal/70 dark:text-navy-300">
        You can contact admin to opt out of non-critical portal notifications.
      </p>
    </SectionCard>
  );
}
