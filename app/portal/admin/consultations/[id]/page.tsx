export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import AdminConsultationForm from '@/app/portal/_components/AdminConsultationForm';
import ConsultationDeleteButton from './ConsultationDeleteButton';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { formatUtcForUser } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { updateConsultation } from '@/app/portal/admin/consultations/actions';
import {
  consultationErrorMessage,
  consultationStatusClass,
  consultationStatusLabel,
  consultationToFormValues,
  preferredLanguageLabel,
  type ConsultationRecord,
} from '@/app/portal/admin/consultations/config';

export default async function AdminConsultationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const session = await requireRole(['admin']);
  const { id } = await params;
  const query = await searchParams;
  const supabase = await getSupabaseServerClient();

  const { data } = await (supabase as any).from('consultations').select('*').eq('id', id).maybeSingle();
  const consultation = (data ?? null) as ConsultationRecord | null;

  if (!consultation) {
    notFound();
  }

  const profileMap = await getProfileMap(supabase, [consultation.created_by]);
  const creator = profileMap[consultation.created_by];
  const createdByLabel =
    creator?.display_name || creator?.email || consultation.created_by || 'Unknown';
  const errorMessage = consultationErrorMessage(query.error);

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

      {query.updated === '1' ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
          Consultation updated successfully.
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <SectionCard
        title={`${consultation.student_name} Consultation`}
        description={`Consulted with ${consultation.parent_name} on ${consultation.consult_date}`}
      >
        <div className="grid gap-3 md:grid-cols-2 text-sm">
          <p>
            <span className="font-medium text-navy-800 dark:text-white">Created by:</span> {createdByLabel}
          </p>
          <p>
            <span className="font-medium text-navy-800 dark:text-white">Created at:</span>{' '}
            {formatUtcForUser(consultation.created_at, session.profile.timezone)}
          </p>
          <p>
            <span className="font-medium text-navy-800 dark:text-white">Last updated:</span>{' '}
            {formatUtcForUser(consultation.updated_at, session.profile.timezone)}
          </p>
          <p>
            <span className="font-medium text-navy-800 dark:text-white">Preferred Language:</span>{' '}
            {preferredLanguageLabel(consultation.preferred_language)}
          </p>
          <div className="md:col-span-2">
            <span className="font-medium text-navy-800 dark:text-white">Status:</span>{' '}
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${consultationStatusClass(consultation.status)}`}>
              {consultationStatusLabel(consultation.status)}
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Consultation Details" description="Edit the consultation record and save any follow-up changes.">
        <AdminConsultationForm
          formAction={updateConsultation}
          consultationId={consultation.id}
          initialValues={consultationToFormValues(consultation)}
          submitLabel="Save Changes"
          cancelHref="/portal/admin/consultations"
        />
      </SectionCard>

      <SectionCard
        title="Danger Zone"
        description="Permanently remove this consultation record. This cannot be undone."
      >
        <ConsultationDeleteButton
          consultationId={consultation.id}
          studentName={consultation.student_name}
        />
      </SectionCard>
    </div>
  );
}
