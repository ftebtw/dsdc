import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { parentT } from '@/lib/portal/parent-i18n';

export default async function ParentReportCardsPlaceholderPage() {
  const session = await requireRole(['parent']);
  const locale = session.profile.locale === 'zh' ? 'zh' : 'en';

  return (
    <SectionCard title={parentT(locale, 'portal.parent.reportCards.title', 'Report Cards')}>
      <p className="text-sm text-charcoal/70 dark:text-navy-300">
        {parentT(locale, 'portal.parent.reportCards.comingSoon', 'Report cards are coming soon.')}
      </p>
    </SectionCard>
  );
}
