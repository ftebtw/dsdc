import Link from 'next/link';
import { notFound } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import LegalSignForm from '@/app/portal/_components/LegalSignForm';
import OpenSignedUrlButton from '@/app/portal/_components/OpenSignedUrlButton';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function StudentLegalSignPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const session = await requireRole(['student']);
  const supabase = await getSupabaseServerClient();

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
    .eq('document_id', documentId);
  const signatures = (signaturesData ?? []) as Array<Record<string, any>>;
  const existingSignature =
    signatures.find((signature) => signature.signer_id === session.userId) ||
    signatures.find((signature) => signature.signed_for_student_id === session.userId) ||
    null;

  return (
    <SectionCard title={`Sign - ${document.title}`} description={document.description || undefined}>
      {existingSignature ? (
        <div className="space-y-3">
          <p className="text-sm text-green-700">This document is already signed.</p>
          <OpenSignedUrlButton endpoint={`/api/portal/signatures/${existingSignature.id}/signed-url`} label="View Signature" />
          <Link href="/portal/student/legal" className="inline-block text-sm underline text-navy-700 dark:text-navy-200">
            Back to legal documents
          </Link>
        </div>
      ) : (
        <LegalSignForm documentId={documentId} doneRedirect="/portal/student/legal" />
      )}
    </SectionCard>
  );
}
