export const dynamic = 'force-dynamic';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import SectionCard from '@/app/portal/_components/SectionCard';
import OpenSignedUrlButton from '@/app/portal/_components/OpenSignedUrlButton';
import { sendPortalEmails } from '@/lib/email/send';
import { legalDocumentUploaded } from '@/lib/email/templates';
import { requireRole } from '@/lib/portal/auth';
import { shouldSendNotification } from '@/lib/portal/notifications';
import { portalPathUrl, profilePreferenceUrl } from '@/lib/portal/phase-c';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

const requiredForOptions: Database['public']['Enums']['legal_required_for'][] = [
  'all_students',
  'all_coaches',
  'trip',
  'event',
];

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

async function createLegalDocument(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();

  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const requiredFor = String(formData.get('required_for') || 'all_students') as Database['public']['Enums']['legal_required_for'];
  const changesPerEvent = formData.get('changes_per_event') === 'on';
  const fileValue = formData.get('file');
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

  if (!title || !file || !requiredForOptions.includes(requiredFor)) return;

  const bucket = process.env.PORTAL_BUCKET_LEGAL_DOCS || 'portal-legal-docs';
  const documentId = randomUUID();
  const objectPath = `legal/${documentId}/${safeFilename(file.name || 'document.pdf')}`;
  const arrayBuffer = await file.arrayBuffer();

  const uploadResult = await supabase.storage.from(bucket).upload(objectPath, arrayBuffer, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (uploadResult.error) return;

  const { error } = await supabase.from('legal_documents').insert({
    id: documentId,
    title,
    description: description || null,
    file_path: objectPath,
    required_for: requiredFor,
    changes_per_event: changesPerEvent,
  });

  if (error) {
    await supabase.storage.from(bucket).remove([objectPath]);
    return;
  }

  try {
    const recipientProfiles =
      requiredFor === 'all_coaches'
        ? (
            (
              await supabase
                .from('profiles')
                .select('id,email,role,notification_preferences')
                .in('role', ['coach', 'ta'])
            ).data ?? []
          )
        : (
            (
              await supabase
                .from('profiles')
                .select('id,email,role,notification_preferences')
                .in('role', ['student', 'parent'])
            ).data ?? []
          );

    const messages: Array<{ to: string; subject: string; html: string; text: string }> = [];
    for (const profile of recipientProfiles as Array<{
      id: string;
      email: string;
      role: string;
      notification_preferences: Record<string, unknown> | null;
    }>) {
      if (!profile.email) continue;
      if (!shouldSendNotification(profile.notification_preferences, 'general_updates', true)) continue;

      messages.push({
        to: profile.email,
        ...legalDocumentUploaded({
          documentTitle: title,
          portalUrl:
            profile.role === 'parent'
              ? portalPathUrl('/portal/parent/legal')
              : profile.role === 'student'
                ? portalPathUrl('/portal/student/legal')
                : portalPathUrl('/portal/login'),
          preferenceUrl: profilePreferenceUrl(profile.role),
        }),
      });
    }

    if (messages.length) {
      await sendPortalEmails(messages);
    }
  } catch (emailError) {
    console.error('[legal-docs] upload notification send failed', {
      error: emailError instanceof Error ? emailError.message : String(emailError),
      title,
      requiredFor,
    });
  }

  revalidatePath('/portal/admin/legal');
}

async function deleteLegalDocument(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const documentId = String(formData.get('document_id') || '');
  if (!documentId) return;

  const { data: document } = await supabase
    .from('legal_documents')
    .select('id,file_path')
    .eq('id', documentId)
    .maybeSingle();
  if (!document) return;

  const bucket = process.env.PORTAL_BUCKET_LEGAL_DOCS || 'portal-legal-docs';
  await supabase.storage.from(bucket).remove([document.file_path]);
  await supabase.from('legal_documents').delete().eq('id', documentId);

  revalidatePath('/portal/admin/legal');
}

export default async function AdminLegalDocumentsPage() {
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();

  const [{ data: documentsData }, { data: signaturesData }, { data: profilesData }] = await Promise.all([
    supabase.from('legal_documents').select('*').order('created_at', { ascending: false }),
    supabase.from('legal_signatures').select('*'),
    supabase.from('profiles').select('id,role,display_name,email').in('role', ['student', 'coach', 'ta']),
  ]);

  const documents = (documentsData ?? []) as Array<Record<string, any>>;
  const signatures = (signaturesData ?? []) as Array<Record<string, any>>;
  const profiles = (profilesData ?? []) as Array<Record<string, any>>;

  const profileMap = new Map(profiles.map((profile: any) => [profile.id, profile]));
  const students = profiles.filter((profile: any) => profile.role === 'student');
  const coaches = profiles.filter((profile: any) => profile.role === 'coach' || profile.role === 'ta');
  const signaturesByDocument = new Map<string, any[]>();

  for (const signature of signatures) {
    const list = signaturesByDocument.get(signature.document_id) ?? [];
    list.push(signature);
    signaturesByDocument.set(signature.document_id, list);
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Legal Document Management" description="Upload templates and track completion status.">
        <form action={createLegalDocument} className="grid md:grid-cols-2 gap-3">
          <input
            required
            name="title"
            placeholder="Document title"
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <select
            name="required_for"
            defaultValue="all_students"
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            {requiredForOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            placeholder="Description (optional)"
            rows={3}
            className="md:col-span-2 rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <label className="md:col-span-2 flex items-center gap-2 text-sm text-navy-700 dark:text-navy-200">
            <input type="checkbox" name="changes_per_event" />
            Changes per event
          </label>
          <input
            required
            type="file"
            name="file"
            className="md:col-span-2 rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-gold-300 file:px-3 file:py-1"
          />
          <button className="justify-self-start px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold">
            Upload Document
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Documents and Signatures" description="Completion counts for each legal template.">
        <div className="space-y-4">
          {documents.length === 0 ? (
            <p className="text-sm text-charcoal/70 dark:text-navy-300">No legal documents uploaded yet.</p>
          ) : null}
          {documents.map((document: any) => {
            const targetProfiles =
              document.required_for === 'all_coaches'
                ? coaches
                : students;
            const documentSignatures = signaturesByDocument.get(document.id) ?? [];
            const signedIds = new Set<string>();
            for (const signature of documentSignatures) {
              if (document.required_for === 'all_coaches') {
                if (signature.signer_role === 'coach' || signature.signer_role === 'ta') {
                  signedIds.add(signature.signer_id);
                }
                continue;
              }

              if (signature.signer_role === 'student') {
                signedIds.add(signature.signer_id);
                continue;
              }

              if (signature.signer_role === 'parent' && signature.signed_for_student_id) {
                signedIds.add(signature.signed_for_student_id);
              }
            }
            const unsignedProfiles = targetProfiles.filter((profile: any) => !signedIds.has(profile.id));

            return (
              <article
                key={document.id}
                className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-navy-800 dark:text-white">{document.title}</h3>
                    <p className="text-sm text-charcoal/70 dark:text-navy-300">
                      Required for: {document.required_for} | Signed: {signedIds.size}/{targetProfiles.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OpenSignedUrlButton
                      endpoint={`/api/portal/legal-documents/${document.id}/signed-url`}
                      label="Open Document"
                    />
                    <form action={deleteLegalDocument}>
                      <input type="hidden" name="document_id" value={document.id} />
                      <button className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm">Delete</button>
                    </form>
                  </div>
                </div>

                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-navy-700 dark:text-navy-200">
                    View signature details
                  </summary>
                  <div className="mt-2 grid lg:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-warm-200 dark:border-navy-600 p-3">
                      <p className="text-sm font-semibold mb-2">Signed</p>
                      {documentSignatures.length === 0 ? (
                        <p className="text-sm text-charcoal/70 dark:text-navy-300">No signatures yet.</p>
                      ) : (
                        <ul className="space-y-1 text-sm">
                          {documentSignatures.map((signature: any) => (
                            <li key={signature.id}>
                              {profileMap.get(signature.signer_id)?.display_name ||
                                profileMap.get(signature.signer_id)?.email ||
                                signature.signer_id}{' '}
                              - {new Date(signature.signed_at).toLocaleDateString()}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="rounded-lg border border-warm-200 dark:border-navy-600 p-3">
                      <p className="text-sm font-semibold mb-2">Unsigned</p>
                      {unsignedProfiles.length === 0 ? (
                        <p className="text-sm text-charcoal/70 dark:text-navy-300">All required users have signed.</p>
                      ) : (
                        <ul className="space-y-1 text-sm">
                          {unsignedProfiles.map((profile: any) => (
                            <li key={profile.id}>{profile.display_name || profile.email}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
