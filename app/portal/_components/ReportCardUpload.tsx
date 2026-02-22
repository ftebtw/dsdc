"use client";

import { useState } from 'react';
import type { Database } from '@/lib/supabase/database.types';

type ReportCardRow = Database['public']['Tables']['report_cards']['Row'];

type Props = {
  studentId: string;
  classId: string;
  termId: string;
  disabled?: boolean;
  buttonLabel?: string;
  onUploaded?: (row: ReportCardRow) => void;
};

export default function ReportCardUpload({
  studentId,
  classId,
  termId,
  disabled = false,
  buttonLabel = 'Upload PDF',
  onUploaded,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || disabled) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('studentId', studentId);
    formData.append('classId', classId);
    formData.append('termId', termId);
    formData.append('file', file);

    const response = await fetch('/api/portal/report-cards/upload', {
      method: 'POST',
      body: formData,
    });
    const data = (await response.json()) as { error?: string; reportCard?: ReportCardRow };

    setLoading(false);
    if (!response.ok || !data.reportCard) {
      setError(data.error || 'Upload failed.');
      return;
    }

    setFile(null);
    onUploaded?.(data.reportCard);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="file"
        accept="application/pdf,.pdf"
        disabled={disabled || loading}
        onChange={(event) => setFile(event.target.files?.[0] || null)}
        className="text-xs file:mr-2 file:rounded file:border-0 file:bg-gold-300 file:px-2.5 file:py-1"
      />
      <button
        type="submit"
        disabled={disabled || loading || !file}
        className="px-3 py-1.5 rounded-md bg-navy-800 text-white text-xs font-semibold disabled:opacity-60"
      >
        {loading ? 'Uploading...' : buttonLabel}
      </button>
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </form>
  );
}
