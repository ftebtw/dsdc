import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';

export default async function StudentReportCardsPlaceholderPage() {
  await requireRole(['student']);

  return (
    <SectionCard title="Report Cards" description="This feature is planned for Phase D.">
      <p className="text-sm text-charcoal/70 dark:text-navy-300">Report cards are coming soon.</p>
    </SectionCard>
  );
}
