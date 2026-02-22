import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import RolePreferencesForm from '@/app/portal/_components/RolePreferencesForm';
import { requireRole } from '@/lib/portal/auth';

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export default async function PortalPreferencesPage() {
  const session = await requireRole(['coach', 'ta', 'student', 'parent']);

  if (session.profile.role === 'parent') {
    return (
      <SectionCard title="Preferences" description="Parents manage notification options in the parent portal.">
        <Link
          href="/portal/parent/preferences"
          className="underline text-navy-700 dark:text-navy-200 text-sm"
        >
          Go to Parent Preferences
        </Link>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Preferences" description="Update notification preferences for this portal account.">
      <RolePreferencesForm
        role={session.profile.role as 'coach' | 'ta' | 'student'}
        initialPreferences={asObject(session.profile.notification_preferences)}
      />
    </SectionCard>
  );
}
