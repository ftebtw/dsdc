"use client";

import { useState } from 'react';

type Props = {
  sessionId: string;
};

export default function AdminGeneratePaymentLinkButton({ sessionId }: Props) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const response = await fetch(`/api/portal/private-sessions/${sessionId}/checkout`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
      });
      const payload = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !payload.checkoutUrl) {
        setError(payload.error || 'Could not generate the payment link.');
        return;
      }
      setUrl(payload.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write blocked — user can manually copy the visible URL.
    }
  }

  if (url) {
    return (
      <div className="space-y-2">
        <div className="break-all rounded-md border border-emerald-300 bg-white px-3 py-2 text-sm font-mono text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100">
          {url}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md border border-emerald-400 bg-white px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100 dark:hover:bg-emerald-900/50"
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-warm-300 bg-white px-3 py-1.5 text-sm font-medium text-navy-800 hover:bg-warm-50 dark:border-navy-600 dark:bg-navy-800 dark:text-navy-100 dark:hover:bg-navy-700"
          >
            Open in new tab
          </a>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-md border border-warm-300 px-3 py-1.5 text-sm font-medium text-navy-800 hover:bg-warm-50 dark:border-navy-600 dark:text-navy-100 dark:hover:bg-navy-800 disabled:opacity-50"
          >
            {loading ? 'Regenerating…' : 'Generate new link'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-50"
      >
        {loading ? 'Generating…' : 'Generate payment link'}
      </button>
      {error ? <span className="text-sm text-red-700 dark:text-red-300">{error}</span> : null}
    </div>
  );
}
