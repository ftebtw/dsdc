export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import AnonymousFeedbackForm from '@/app/portal/_components/AnonymousFeedbackForm';
import EnrollmentRequiredBanner from '@/app/portal/_components/EnrollmentRequiredBanner';
import { requireRole } from '@/lib/portal/auth';
import { hasActiveEnrollment } from '@/lib/portal/enrollment-status';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function StudentFeedbackPage() {
  const session = await requireRole(['student']);
  const supabase = await getSupabaseServerClient();
  const enrolled = await hasActiveEnrollment(supabase as any, session.userId);

  if (!enrolled) {
    return (
      <SectionCard
        title="Anonymous Feedback"
        description="Send feedback anonymously. Your account identity is not stored in the feedback record."
      >
        <EnrollmentRequiredBanner role="student" locale={session.profile.locale === "zh" ? "zh" : "en"} />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Anonymous Feedback"
      description="Send feedback anonymously. Your account identity is not stored in the feedback record."
    >
      <AnonymousFeedbackForm />
    </SectionCard>
  );
}
