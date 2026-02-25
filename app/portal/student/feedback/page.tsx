export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import AnonymousFeedbackForm from '@/app/portal/_components/AnonymousFeedbackForm';
import EnrollmentRequiredBanner from '@/app/portal/_components/EnrollmentRequiredBanner';
import { requireRole } from '@/lib/portal/auth';
import { hasActiveEnrollment } from '@/lib/portal/enrollment-status';
import { portalT } from '@/lib/portal/parent-i18n';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function StudentFeedbackPage() {
  const session = await requireRole(['student']);
  const locale = (session.profile.locale === 'zh' ? 'zh' : 'en') as 'en' | 'zh';
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const supabase = await getSupabaseServerClient();
  const enrolled = await hasActiveEnrollment(supabase as any, session.userId);

  if (!enrolled) {
    return (
      <SectionCard
        title={t('portal.student.feedback.title', 'Anonymous Feedback')}
        description={t(
          'portal.student.feedback.description',
          'Send feedback anonymously. Your account identity is not stored in the feedback record.'
        )}
      >
        <EnrollmentRequiredBanner role="student" locale={session.profile.locale === "zh" ? "zh" : "en"} />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={t('portal.student.feedback.title', 'Anonymous Feedback')}
      description={t(
        'portal.student.feedback.description',
        'Send feedback anonymously. Your account identity is not stored in the feedback record.'
      )}
    >
      <AnonymousFeedbackForm />
    </SectionCard>
  );
}
