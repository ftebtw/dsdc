export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import AdminConsultationForm from '@/app/portal/_components/AdminConsultationForm';
import { requireRole } from '@/lib/portal/auth';
import { createConsultation } from '@/app/portal/admin/consultations/actions';
import {
  consultationErrorMessage,
  emptyConsultationValues,
} from '@/app/portal/admin/consultations/config';

export default async function AdminConsultationNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(['admin']);
  const params = await searchParams;
  const errorMessage = consultationErrorMessage(params.error);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/portal/admin/consultations"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {'<- Back to Consultations'}
        </Link>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <SectionCard title="New Consultation" description="Fill this out during or right after a parent consultation call.">
        <AdminConsultationForm
          formAction={createConsultation}
          initialValues={emptyConsultationValues()}
          submitLabel="Save Consultation"
          cancelHref="/portal/admin/consultations"
        />
      </SectionCard>
    </div>
  );
}
