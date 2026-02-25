import SectionCard from '@/app/portal/_components/SectionCard';
import AccountSettingsForm from '@/app/portal/_components/AccountSettingsForm';
import { requireSession } from '@/lib/portal/auth';

export const dynamic = 'force-dynamic';

export default async function PortalSettingsPage() {
  const session = await requireSession();

  return (
    <div className="space-y-6">
      <SectionCard title="Account Settings" description="Manage your account details.">
        <AccountSettingsForm
          displayName={session.profile.display_name ?? ''}
          email={session.profile.email}
          timezone={session.profile.timezone || 'America/Vancouver'}
        />
      </SectionCard>
    </div>
  );
}
