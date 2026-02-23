"use client";

import { useState } from "react";

type PendingApprovalItem = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  classesText: string;
  classCount: number;
  submittedAt: string;
  approvalExpiresAt: string | null;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function formatExpiry(value: string | null): { text: string; urgent: boolean } {
  if (!value) return { text: "Not set", urgent: true };
  const now = Date.now();
  const expiresAt = new Date(value).getTime();
  if (!Number.isFinite(expiresAt)) return { text: "Invalid", urgent: true };
  const diffMs = expiresAt - now;
  if (diffMs <= 0) return { text: "Expired", urgent: true };

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { text: `${hours}h ${minutes}m remaining`, urgent: diffMs <= 6 * 60 * 60 * 1000 };
}

export default function AdminPendingApprovalsManager({
  items,
}: {
  items: PendingApprovalItem[];
}) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function approve(item: PendingApprovalItem) {
    setLoadingKey(`approve:${item.studentId}`);
    setError(null);

    const response = await fetch("/api/portal/admin/pending-approvals/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: item.studentId }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error || "Could not approve enrollment request.");
      setLoadingKey(null);
      return;
    }

    window.location.reload();
  }

  async function reject(item: PendingApprovalItem) {
    const reason = window.prompt("Optional rejection reason:");
    setLoadingKey(`reject:${item.studentId}`);
    setError(null);

    const response = await fetch("/api/portal/admin/pending-approvals/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: item.studentId,
        reason: reason || undefined,
      }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error || "Could not reject enrollment request.");
      setLoadingKey(null);
      return;
    }

    window.location.reload();
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-charcoal/70 dark:text-navy-300">
        No pending approvals found.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {items.map((item) => {
        const busy = loadingKey === `approve:${item.studentId}` || loadingKey === `reject:${item.studentId}`;
        const expiry = formatExpiry(item.approvalExpiresAt);
        return (
          <div
            key={item.studentId}
            className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy-900 dark:text-white">
                  {item.studentName}{" "}
                  <span className="text-charcoal/65 dark:text-navy-300">({item.studentEmail})</span>
                </p>
                <p className="text-sm text-charcoal/75 dark:text-navy-200 mt-1">{item.classesText}</p>
                <p className="text-xs text-charcoal/65 dark:text-navy-300 mt-2">
                  Submitted at: {formatDateTime(item.submittedAt)}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    expiry.urgent
                      ? "text-red-600 dark:text-red-300 font-semibold"
                      : "text-charcoal/65 dark:text-navy-300"
                  }`}
                >
                  Expires: {formatDateTime(item.approvalExpiresAt ?? item.submittedAt)} (
                  {expiry.text})
                </p>
                <p className="text-xs text-charcoal/65 dark:text-navy-300">
                  Classes pending: {item.classCount}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    void approve(item);
                  }}
                  className="rounded-md bg-navy-800 text-white px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    void reject(item);
                  }}
                  className="rounded-md border border-red-300 text-red-700 dark:text-red-300 px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
