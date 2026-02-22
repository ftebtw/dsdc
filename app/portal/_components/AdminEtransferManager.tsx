"use client";

import { useState } from "react";

type QueueItem = {
  studentId: string;
  token: string;
  studentName: string;
  studentEmail: string;
  classesText: string;
  totalAmountCad: number;
  status: "pending_etransfer" | "etransfer_sent";
  reservedAt: string;
  expiresAt: string | null;
  sentAt: string | null;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDateTime(value: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleString();
}

export default function AdminEtransferManager({ items }: { items: QueueItem[] }) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function confirmItem(item: QueueItem) {
    setLoadingKey(`confirm:${item.studentId}:${item.token}`);
    setError(null);
    const response = await fetch("/api/portal/admin/etransfers/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: item.studentId, token: item.token }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error || "Could not confirm e-transfer.");
      setLoadingKey(null);
      return;
    }
    window.location.reload();
  }

  async function cancelItem(item: QueueItem) {
    const reason = window.prompt("Optional cancellation reason:");
    setLoadingKey(`cancel:${item.studentId}:${item.token}`);
    setError(null);
    const response = await fetch("/api/portal/admin/etransfers/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: item.studentId,
        token: item.token,
        reason: reason || undefined,
      }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error || "Could not cancel e-transfer batch.");
      setLoadingKey(null);
      return;
    }
    window.location.reload();
  }

  if (items.length === 0) {
    return <p className="text-sm text-charcoal/70 dark:text-navy-300">No pending e-transfer reservations found.</p>;
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {items.map((item) => {
        const key = `${item.studentId}:${item.token}`;
        const busy = loadingKey?.includes(key);
        return (
          <div
            key={key}
            className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy-900 dark:text-white">
                  {item.studentName} <span className="text-charcoal/65 dark:text-navy-300">({item.studentEmail})</span>
                </p>
                <p className="text-sm text-charcoal/75 dark:text-navy-200 mt-1">{item.classesText}</p>
                <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
                  Total amount: <span className="font-semibold">{formatCurrency(item.totalAmountCad)}</span>
                </p>
                <p className="text-xs text-charcoal/65 dark:text-navy-300 mt-2">
                  Reserved at: {formatDateTime(item.reservedAt)}
                </p>
                <p className="text-xs text-charcoal/65 dark:text-navy-300">
                  Expires at: {formatDateTime(item.expiresAt)}
                </p>
                <p className="text-xs text-charcoal/65 dark:text-navy-300">
                  Sent at: {formatDateTime(item.sentAt)}
                </p>
              </div>
              <div className="min-w-[180px]">
                <p
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.status === "pending_etransfer"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                  }`}
                >
                  {item.status === "pending_etransfer" ? "Awaiting Transfer" : "Transfer Sent"}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => {
                      void confirmItem(item);
                    }}
                    className="rounded-md bg-navy-800 text-white px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
                  >
                    Confirm Enrollment
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => {
                      void cancelItem(item);
                    }}
                    className="rounded-md border border-red-300 text-red-700 dark:text-red-300 px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

