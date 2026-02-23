"use client";

import { useMemo, useState } from "react";

type PreviewResponse = {
  profile: {
    id: string;
    email: string;
    display_name: string | null;
    role: string;
  };
  impact: {
    activeEnrollments: number;
    assignedClasses: string[];
    attendanceRecords: number;
    reportCardsWritten: number;
    privateSessions: number;
    linkedUsers: string[];
    legalSignatures: number;
  };
};

type Props = {
  userId: string;
  displayName?: string | null;
};

export default function AdminDeleteUserButton({ userId, displayName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [preview, setPreview] = useState<PreviewResponse | null>(null);

  const expectedName = useMemo(
    () =>
      preview?.profile.display_name?.trim() ||
      displayName?.trim() ||
      preview?.profile.email ||
      "",
    [displayName, preview]
  );
  const canDelete = confirmName.trim().toLowerCase() === expectedName.trim().toLowerCase() && expectedName.length > 0;

  function reset() {
    setIsOpen(false);
    setStep(1);
    setLoading(false);
    setDeleteLoading(false);
    setError(null);
    setConfirmName("");
    setPreview(null);
  }

  async function openPreview() {
    setLoading(true);
    setError(null);
    setIsOpen(true);
    setStep(1);
    const response = await fetch("/api/portal/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const payload = (await response.json()) as PreviewResponse & { error?: string };
    setLoading(false);
    if (!response.ok) {
      setError(payload.error || "Could not load delete impact.");
      return;
    }
    setPreview(payload);
  }

  async function executeDelete() {
    if (!canDelete) return;
    setDeleteLoading(true);
    setError(null);
    const response = await fetch("/api/portal/admin/delete-user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        confirmName: confirmName.trim(),
      }),
    });
    const payload = (await response.json()) as { deleted?: boolean; error?: string };
    setDeleteLoading(false);
    if (!response.ok || !payload.deleted) {
      setError(payload.error || "Could not delete user.");
      return;
    }
    window.location.reload();
  }

  const impactRows = preview
    ? [
        preview.impact.activeEnrollments > 0
          ? `Remove ${preview.impact.activeEnrollments} active/pending enrollments`
          : null,
        preview.impact.assignedClasses.length > 0
          ? `Unassign ${preview.impact.assignedClasses.length} classes (${preview.impact.assignedClasses.join(", ")})`
          : null,
        preview.impact.attendanceRecords > 0
          ? `Clear ${preview.impact.attendanceRecords} attendance records (records preserved, author cleared)`
          : null,
        preview.impact.reportCardsWritten > 0
          ? `Clear ${preview.impact.reportCardsWritten} report cards (records preserved, author cleared)`
          : null,
        preview.impact.privateSessions > 0
          ? `Delete ${preview.impact.privateSessions} pending/confirmed private sessions`
          : null,
        preview.impact.linkedUsers.length > 0
          ? `Unlink ${preview.impact.linkedUsers.length} linked users (${preview.impact.linkedUsers.join(", ")})`
          : null,
        preview.impact.legalSignatures > 0
          ? `Delete ${preview.impact.legalSignatures} legal signatures`
          : null,
      ].filter((row): row is string => Boolean(row))
    : [];

  return (
    <>
      <button
        type="button"
        onClick={() => {
          void openPreview();
        }}
        className="text-xs text-red-600 border border-red-300 rounded px-2 py-1 hover:bg-red-50 dark:text-red-300 dark:border-red-500/70 dark:hover:bg-red-900/20"
      >
        Delete
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-xl rounded-xl border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 p-5 shadow-2xl">
            {step === 1 ? (
              <>
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                  Delete User: {preview?.profile.display_name || preview?.profile.email || displayName || "User"}
                </h3>
                <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
                  {preview ? `${preview.profile.email} (${preview.profile.role})` : "Loading impact summary..."}
                </p>

                <div className="mt-4 rounded-lg border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800/60 p-3">
                  {loading ? (
                    <p className="text-sm text-charcoal/70 dark:text-navy-300">Loading impact summary...</p>
                  ) : impactRows.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-sm text-charcoal/80 dark:text-navy-200">
                      {impactRows.map((row) => (
                        <li key={row}>{row}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-charcoal/70 dark:text-navy-300">
                      No related records found.
                    </p>
                  )}
                </div>

                <p className="mt-3 text-sm font-medium text-red-700 dark:text-red-300">
                  This action cannot be undone.
                </p>
                {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={reset}
                    className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!preview || loading}
                    onClick={() => setStep(2)}
                    className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-semibold disabled:opacity-60"
                  >
                    I Understand, Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">Final Confirmation</h3>
                <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-2">
                  Type the user's name to confirm deletion.
                </p>
                <p className="mt-1 text-sm font-medium text-charcoal dark:text-navy-100">
                  Must match: "{expectedName}"
                </p>
                <input
                  type="text"
                  value={confirmName}
                  onChange={(event) => setConfirmName(event.target.value)}
                  className="mt-3 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm"
                  placeholder="Type name exactly"
                />
                {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={reset}
                    className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!canDelete || deleteLoading}
                    onClick={() => {
                      void executeDelete();
                    }}
                    className="px-3 py-1.5 rounded-md bg-red-700 text-white text-sm font-bold disabled:opacity-60"
                  >
                    {deleteLoading ? "Deleting..." : "Permanently Delete"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
