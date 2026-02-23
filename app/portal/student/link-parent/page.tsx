export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import StudentLinkParentForm from '@/app/portal/_components/StudentLinkParentForm';
import { requireRole } from '@/lib/portal/auth';

export default async function StudentLinkParentPage() {
  await requireRole(['student']);

  return (
    <SectionCard
      title="Link to Parent"
      description="Enter an invite code from your parent to link accounts."
    >
      <StudentLinkParentForm />
    </SectionCard>
  );
}
