import SectionCard from '@/app/portal/_components/SectionCard';
import AnonymousFeedbackForm from '@/app/portal/_components/AnonymousFeedbackForm';
import { requireRole } from '@/lib/portal/auth';

export default async function StudentFeedbackPage() {
  await requireRole(['student']);

  return (
    <SectionCard
      title="Anonymous Feedback"
      description="Send feedback anonymously. Your account identity is not stored in the feedback record."
    >
      <AnonymousFeedbackForm />
    </SectionCard>
  );
}
