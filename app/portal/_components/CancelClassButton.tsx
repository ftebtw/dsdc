"use client";

import { useState } from "react";

type Props = {
  classId: string;
  className: string;
  scheduleDay: string;
};

function getNextOccurrence(scheduleDay: string): string {
  const dayMap: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };
  const targetDay = dayMap[scheduleDay] ?? 0;
  const today = new Date();
  const todayDay = today.getDay();
  const daysUntil = (targetDay - todayDay + 7) % 7 || 7;
  const next = new Date(today);
  next.setDate(today.getDate() + daysUntil);
  return next.toISOString().split("T")[0];
}

export default function CancelClassButton({ classId, className, scheduleDay }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => getNextOccurrence(scheduleDay));
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit() {
    if (!reason.trim()) {
      setError("Please provide a reason for the cancellation.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/portal/admin/classes/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, cancellationDate: date, reason: reason.trim() }),
      });

      const data = (await response.json()) as {
        error?: string;
        creditsIssued?: number;
        emailsSent?: number;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel class.");
      }

      setSuccess(
        `Session cancelled. ${data.creditsIssued ?? 0} credit(s) issued, ${data.emailsSent ?? 0} notification(s) sent.`
      );
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-md border border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20"
      >
        Cancel Session
      </button>
    );
  }

  return (
    <div className="lg:col-span-4 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 space-y-3">
      <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
        Cancel a session of {className}
      </h4>

      {success ? (
        <div className="rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 p-3">
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setSuccess(null);
            }}
            className="mt-2 text-xs text-green-600 dark:text-green-400 underline"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                Date to cancel
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-amber-300 dark:border-amber-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                Reason (sent to all enrolled students and parents)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Coach unavailable, holiday, weather..."
                className="w-full rounded-lg border border-amber-300 dark:border-amber-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 disabled:opacity-60"
            >
              {loading ? "Cancelling..." : "Cancel Session & Notify"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
            >
              Back
            </button>
          </div>

          <p className="text-xs text-amber-600 dark:text-amber-400">
            This will issue 1 class credit to each enrolled student and send an email notification to all enrolled students and their parents.
          </p>
        </>
      )}
    </div>
  );
}
