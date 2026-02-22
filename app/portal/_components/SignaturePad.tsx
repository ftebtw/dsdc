"use client";

import { useRef, useState } from 'react';
import ReactSignatureCanvas from 'react-signature-canvas';

type Props = {
  onSave: (dataUrl: string) => Promise<void> | void;
  width?: number;
  height?: number;
};

export default function SignaturePad({ onSave, width = 560, height = 220 }: Props) {
  const padRef = useRef<ReactSignatureCanvas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveSignature() {
    if (!padRef.current || padRef.current.isEmpty()) {
      setError('Please draw your signature first.');
      return;
    }

    setLoading(true);
    setError(null);
    const dataUrl = padRef.current.getTrimmedCanvas().toDataURL('image/png');
    try {
      await onSave(dataUrl);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save signature.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white p-2 overflow-x-auto">
        <ReactSignatureCanvas
          ref={padRef}
          penColor="#11294a"
          backgroundColor="#ffffff"
          canvasProps={{ width, height, className: 'touch-none' }}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            padRef.current?.clear();
            setError(null);
          }}
          className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => void saveSignature()}
          disabled={loading}
          className="px-3 py-1.5 rounded-md bg-navy-800 text-white text-sm disabled:opacity-70"
        >
          {loading ? 'Saving...' : 'Sign & Submit'}
        </button>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
