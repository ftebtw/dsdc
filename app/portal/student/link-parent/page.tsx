export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import StudentLinkParentForm from '@/app/portal/_components/StudentLinkParentForm';
import { requireRole } from '@/lib/portal/auth';
import { portalT } from '@/lib/portal/parent-i18n';

export default async function StudentLinkParentPage() {
  const session = await requireRole(['student']);
  const locale = (session.profile.locale === 'zh' ? 'zh' : 'en') as 'en' | 'zh';
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);

  return (
    <SectionCard
      title={t('portal.student.linkParent.title', 'Link to Parent')}
      description={t('portal.student.linkParent.description', 'Enter an invite code from your parent to link accounts.')}
    >
      <StudentLinkParentForm />
    </SectionCard>
  );
}
