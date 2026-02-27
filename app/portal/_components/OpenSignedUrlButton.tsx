"use client";

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { portalT } from '@/lib/portal/parent-i18n';

export default function OpenSignedUrlButton({
  endpoint,
  label,
}: {
  endpoint: string;
  label: string;
}) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onOpen() {
    setLoading(true);
    setError(null);
    const response = await fetch(endpoint);
    const data = (await response.json()) as { error?: string; url?: string };
    setLoading(false);

    if (!response.ok || !data.url) {
      setError(data.error || t('portal.openSignedUrl.openError', 'Unable to open file.'));
      return;
    }

    window.open(data.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onOpen}
        disabled={loading}
        className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm disabled:opacity-70"
      >
        {loading ? t('portal.openSignedUrl.opening', 'Opening...') : label}
      </button>
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </div>
  );
}
