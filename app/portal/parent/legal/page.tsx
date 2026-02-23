export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import OpenSignedUrlButton from '@/app/portal/_components/OpenSignedUrlButton';
import { requireRole } from '@/lib/portal/auth';
import { getParentSelection } from '@/lib/portal/parent';
import { parentT } from '@/lib/portal/parent-i18n';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function ParentLegalPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const session = await requireRole(['parent']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const locale = session.profile.locale === 'zh' ? 'zh' : 'en';

  const { linkedStudents, selectedStudentId, selectedStudent } = await getParentSelection(
    supabase,
    session.userId,
    params.student
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

  if (!selectedStudentId || params.student !== selectedStudentId) {
    redirect(`/portal/parent/legal?student=${selectedStudentId}`);
  }

  const documents = ((await supabase
    .from('legal_documents')
    .select('*')
    .in('required_for', ['all_students', 'trip', 'event'])
    .order('created_at', { ascending: false })).data ?? []) as Array<Record<string, any>>;
  const documentIds = documents.map((document: any) => document.id);

  const signatures = documentIds.length
    ? (((await supabase
        .from('legal_signatures')
        .select('*')
        .in('document_id', documentIds)).data ?? []) as Array<Record<string, any>>)
    : ([] as Array<Record<string, any>>);

  const signatureByDocument = new Map<string, any>();
  for (const signature of signatures) {
    const isRelevant =
      signature.signer_id === selectedStudentId ||
      signature.signed_for_student_id === selectedStudentId;
    if (!isRelevant) continue;

    const existing = signatureByDocument.get(signature.document_id);
    if (!existing) {
      signatureByDocument.set(signature.document_id, signature);
      continue;
    }
    if (
      (existing.signer_id !== selectedStudentId && signature.signer_id === selectedStudentId) ||
      (existing.signer_id !== selectedStudentId &&
        signature.signer_id !== selectedStudentId &&
        new Date(signature.signed_at).getTime() > new Date(existing.signed_at).getTime())
    ) {
      signatureByDocument.set(signature.document_id, signature);
    }
  }

  return (
    <SectionCard
      title={parentT(locale, 'portal.parent.legal.title', 'Legal Documents')}
      description={`${parentT(locale, 'portal.parent.selectedStudent', 'Selected student')}: ${
        selectedStudent?.display_name || selectedStudent?.email || selectedStudentId
      }`}
    >
      <div className="space-y-4">
        {documents.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {parentT(locale, 'portal.parent.common.noLegalDocs', 'No legal documents assigned right now.')}
          </p>
        ) : null}
        {documents.map((document: any) => {
          const signature = signatureByDocument.get(document.id);
          const signedByStudent = signature?.signer_id === selectedStudentId;
          return (
            <article
              key={document.id}
              className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
            >
              <h3 className="font-semibold text-navy-800 dark:text-white">{document.title}</h3>
              {document.description ? (
                <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">{document.description}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <OpenSignedUrlButton
                  endpoint={`/api/portal/legal-documents/${document.id}/signed-url`}
                  label={parentT(locale, 'portal.parent.legal.openDocument', 'Open Document')}
                />
                {signature ? (
                  <>
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                      {signedByStudent
                        ? parentT(locale, 'portal.parent.legal.signedByStudent', 'Signed by student')
                        : parentT(locale, 'portal.parent.legal.signedByParent', 'Signed by parent')}{' '}
                      {new Date(signature.signed_at).toLocaleDateString()}
                    </span>
                    <OpenSignedUrlButton
                      endpoint={`/api/portal/signatures/${signature.id}/signed-url`}
                      label={parentT(locale, 'portal.parent.legal.viewSignature', 'View Signature')}
                    />
                  </>
                ) : (
                  <Link
                    href={`/portal/parent/legal/${document.id}?student=${selectedStudentId}`}
                    className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-sm font-semibold"
                  >
                    {parentT(locale, 'portal.parent.legal.signNow', 'Sign Now')}
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </SectionCard>
  );
}
