"use client";

import { useRouter } from 'next/navigation';
import SignaturePad from '@/app/portal/_components/SignaturePad';
import OpenSignedUrlButton from '@/app/portal/_components/OpenSignedUrlButton';
import { useI18n } from '@/lib/i18n';
import { portalT } from '@/lib/portal/parent-i18n';

export default function LegalSignForm({
  documentId,
  signedForStudentId,
  doneRedirect,
}: {
  documentId: string;
  signedForStudentId?: string;
  doneRedirect: string;
}) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const router = useRouter();

  async function onSave(dataUrl: string) {
    const response = await fetch('/api/portal/legal/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId,
        dataUrl,
        signedForStudentId: signedForStudentId || undefined,
      }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(data.error || t('portal.legalSign.submitError', 'Could not submit signature.'));
    }
    router.push(doneRedirect);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <OpenSignedUrlButton
        endpoint={`/api/portal/legal-documents/${documentId}/signed-url`}
        label={t('portal.legalSign.openDocument', 'Open Document')}
      />
      <p className="text-sm text-charcoal/70 dark:text-navy-300">
        {t('portal.legalSign.reviewHint', 'Review the document, then draw your signature below.')}
      </p>
      <SignaturePad onSave={onSave} />
    </div>
  );
}
