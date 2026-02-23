export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import LegalSignForm from '@/app/portal/_components/LegalSignForm';
import OpenSignedUrlButton from '@/app/portal/_components/OpenSignedUrlButton';
import { requireRole } from '@/lib/portal/auth';
import { getParentSelection } from '@/lib/portal/parent';
import { parentT } from '@/lib/portal/parent-i18n';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function ParentLegalSignPage({
  params,
  searchParams,
}: {
  params: Promise<{ documentId: string }>;
  searchParams: Promise<{ student?: string }>;
}) {
  const { documentId } = await params;
  const search = await searchParams;
  const session = await requireRole(['parent']);
  const supabase = await getSupabaseServerClient();
  const locale = session.profile.locale === 'zh' ? 'zh' : 'en';

  const { linkedStudents, selectedStudentId, selectedStudent } = await getParentSelection(
    supabase,
    session.userId,
    search.student
  );
  if (!linkedStudents.length) {
    return (
      <SectionCard title={parentT(locale, 'portal.parent.legal.title', 'Legal Documents')}>
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {parentT(locale, 'portal.parent.common.noLinkedStudents', 'No linked students found.')}
        </p>
      </SectionCard>
    );
  }

  if (!selectedStudentId || search.student !== selectedStudentId) {
    redirect(`/portal/parent/legal/${documentId}?student=${selectedStudentId}`);
  }

  const { data: document } = await supabase
    .from('legal_documents')
    .select('*')
    .eq('id', documentId)
    .in('required_for', ['all_students', 'trip', 'event'])
    .maybeSingle();
  if (!document) notFound();

  const { data: signaturesData } = await supabase
    .from('legal_signatures')
    .select('*')
    .eq('document_id', documentId)
    .order('signed_at', { ascending: false });
  const signatures = (signaturesData ?? []) as Array<Record<string, any>>;
  const existingSignature =
    signatures.find((signature) => signature.signer_id === selectedStudentId) ||
    signatures.find((signature) => signature.signed_for_student_id === selectedStudentId) ||
    null;

  return (
    <SectionCard
      title={`${parentT(locale, 'portal.parent.legal.signTitle', 'Sign')} - ${document.title}`}
      description={`${parentT(locale, 'portal.parent.selectedStudent', 'Selected student')}: ${
        selectedStudent?.display_name || selectedStudent?.email || selectedStudentId
      }`}
    >
      {existingSignature ? (
        <div className="space-y-3">
          <p className="text-sm text-green-700">
            {parentT(locale, 'portal.parent.legal.alreadySigned', 'This document is already signed.')}
          </p>
          <OpenSignedUrlButton
            endpoint={`/api/portal/signatures/${existingSignature.id}/signed-url`}
            label={parentT(locale, 'portal.parent.legal.viewSignature', 'View Signature')}
          />
          <Link
            href={`/portal/parent/legal?student=${selectedStudentId}`}
            className="inline-block text-sm underline text-navy-700 dark:text-navy-200"
          >
            {parentT(locale, 'portal.parent.backToLegal', 'Back to legal documents')}
          </Link>
        </div>
      ) : (
        <LegalSignForm
          documentId={documentId}
          signedForStudentId={selectedStudentId}
          doneRedirect={`/portal/parent/legal?student=${selectedStudentId}`}
        />
      )}
    </SectionCard>
  );
}
