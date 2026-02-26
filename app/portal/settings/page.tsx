import SectionCard from '@/app/portal/_components/SectionCard';
import AccountSettingsForm from '@/app/portal/_components/AccountSettingsForm';
import { requireSession } from '@/lib/portal/auth';
import { portalT } from '@/lib/portal/parent-i18n';

export const dynamic = 'force-dynamic';

export default async function PortalSettingsPage() {
  const session = await requireSession();
  const locale = (session.profile.locale === "zh" ? "zh" : "en") as "en" | "zh";
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);

  return (
    <div className="space-y-6">
      <SectionCard
        title={t("portal.settings.title", "Account Settings")}
        description={t("portal.settings.description", "Manage your account details.")}
      >
        <AccountSettingsForm
          displayName={session.profile.display_name ?? ''}
          email={session.profile.email}
          timezone={session.profile.timezone || 'America/Vancouver'}
          locale={locale}
        />
      </SectionCard>
    </div>
  );
}
