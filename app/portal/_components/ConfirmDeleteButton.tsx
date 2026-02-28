"use client";

import { useState, type ReactNode } from "react";

type Props = {
  action: string | ((formData: FormData) => void | Promise<void>);
  hiddenFields?: Record<string, string>;
  confirmMessage?: string;
  className?: string;
  children: ReactNode;
};

export default function ConfirmDeleteButton({
  action,
  hiddenFields = {},
  confirmMessage = "Are you sure you want to delete this? This action cannot be undone.",
  className = "px-3 py-1.5 rounded-md bg-red-600 text-white text-sm",
  children,
}: Props) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={className}>
        {children}
      </button>
    );
  }

  return (
    <>
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        formAction={action}
        formNoValidate
        title={confirmMessage}
        className="px-3 py-1.5 rounded-md bg-red-700 text-white text-sm font-semibold animate-pulse"
      >
        Confirm Delete
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
      >
        Cancel
      </button>
    </>
  );
}
