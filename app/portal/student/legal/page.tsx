import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import OpenSignedUrlButton from '@/app/portal/_components/OpenSignedUrlButton';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function StudentLegalPage() {
  const session = await requireRole(['student']);
  const supabase = await getSupabaseServerClient();

  const { data: documentsData } = await supabase
    .from('legal_documents')
    .select('*')
    .in('required_for', ['all_students', 'trip', 'event'])
    .order('created_at', { ascending: false });
  const documents = (documentsData ?? []) as any[];

  const documentIds = documents.map((document: any) => document.id);
  const signatures = documentIds.length
    ? (((await supabase
        .from('legal_signatures')
        .select('*')
        .in('document_id', documentIds)).data ?? []) as any[])
    : ([] as any[]);

  const signatureByDocument = new Map<string, any>();
  for (const signature of signatures) {
    const isRelevant =
      signature.signer_id === session.userId ||
      signature.signed_for_student_id === session.userId;
    if (!isRelevant) continue;
    if (!signatureByDocument.has(signature.document_id)) {
      signatureByDocument.set(signature.document_id, signature);
      continue;
    }
    const existing = signatureByDocument.get(signature.document_id);
    if (
      existing.signer_id !== session.userId &&
      signature.signer_id === session.userId
    ) {
      signatureByDocument.set(signature.document_id, signature);
    }
  }

  return (
    <SectionCard title="Legal Documents" description="Review required documents and submit your digital signature.">
      <div className="space-y-4">
        {documents.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">No legal documents assigned right now.</p>
        ) : null}
        {documents.map((document: any) => {
          const signature = signatureByDocument.get(document.id);
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
                  label="Open Document"
                />
                {signature ? (
                  <>
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                      Signed {new Date(signature.signed_at).toLocaleDateString()}
                    </span>
                    <OpenSignedUrlButton
                      endpoint={`/api/portal/signatures/${signature.id}/signed-url`}
                      label="View Signature"
                    />
                  </>
                ) : (
                  <Link
                    href={`/portal/student/legal/${document.id}`}
                    className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-sm font-semibold"
                  >
                    Sign Document
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
