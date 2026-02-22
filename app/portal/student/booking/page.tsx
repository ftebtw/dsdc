import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';

export default async function StudentBookingPlaceholderPage() {
  await requireRole(['student']);

  return (
    <SectionCard title="Private Session Booking" description="This feature is planned for Phase C.">
      <p className="text-sm text-charcoal/70 dark:text-navy-300">
        Private session booking is coming soon.
      </p>
    </SectionCard>
  );
}
