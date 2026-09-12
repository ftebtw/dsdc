"use client";

import { useMemo, useState } from "react";

type StatusValue = "pending_coach" | "pending_admin" | "approved" | "cancelled";

type FeedbackRow = {
  id: string;
  class_id: string;
  student_id: string;
  requested_by: string;
  request_message: string;
  status: StatusValue;
  coach_response: string | null;
  coach_responded_at: string | null;
  admin_reviewed_by: string | null;
  admin_reviewed_at: string | null;
  admin_rejection_notes: string | null;
  rejection_count: number;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

type Person = { id: string; name: string; email?: string };

export type FeedbackRequestManagerProps = {
  mode: "requester" | "coach" | "admin";
  currentUserId: string;
  currentUserRole: "student" | "parent" | "coach" | "ta" | "admin";
  initialRequests: FeedbackRow[];
  /** Class options the requester can pick from (with the student they'd file about) */
  enrollments?: Array<{ classId: string; className: string; studentId: string; studentName: string }>;
  classMap: Record<string, string>;
  studentMap: Record<string, string>;
  requesterMap: Record<string, Person>;
  adminMap: Record<string, string>;
  coachMap: Record<string, string>;
  /** For coaches: the primary coach per class (used to label "assigned to") */
  classPrimaryCoach: Record<string, string | null>;
};

const STATUS_LABELS: Record<StatusValue, string> = {
  pending_coach: "Waiting on coach",
  pending_admin: "Waiting on admin review",
  approved: "Approved · sent",
  cancelled: "Cancelled",
};

const STATUS_PILL: Record<StatusValue, string> = {
  pending_coach: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  pending_admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  cancelled: "bg-warm-200 text-charcoal/70 dark:bg-navy-800 dark:text-navy-300",
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function FeedbackRequestManager(props: FeedbackRequestManagerProps) {
  const {
    mode,
    currentUserId,
    currentUserRole,
    initialRequests,
    enrollments = [],
    classMap,
    studentMap,
    requesterMap,
    adminMap,
    coachMap,
    classPrimaryCoach,
  } = props;

  const [rows, setRows] = useState<FeedbackRow[]>(initialRequests);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Create form (requester)
  const [selectedEnrollmentIndex, setSelectedEnrollmentIndex] = useState<number>(0);
  const [message, setMessage] = useState("");

  // Coach draft state
  const [responseDraft, setResponseDraft] = useState<Record<string, string>>({});

  // Admin review state
  const [rejectDraft, setRejectDraft] = useState<Record<string, string>>({});
  const [rejectOpen, setRejectOpen] = useState<Record<string, boolean>>({});

  const activeRows = useMemo(
    () => rows.filter((r) => r.status !== "cancelled"),
    [rows]
  );
  const archivedRows = useMemo(
    () => rows.filter((r) => r.status === "cancelled" || r.status === "approved"),
    [rows]
  );

  async function createRequest() {
    if (!enrollments[selectedEnrollmentIndex]) {
      setError("Pick a class first.");
      return;
    }
    if (message.trim().length < 3) {
      setError("Add a short message describing what you'd like feedback on.");
      return;
    }
    const enrollment = enrollments[selectedEnrollmentIndex];
    setCreating(true);
    setError(null);

    const response = await fetch("/api/portal/feedback-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId: enrollment.classId,
        studentId: enrollment.studentId,
        message: message.trim(),
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; request?: FeedbackRow };
    setCreating(false);
    if (!response.ok || !data.request) {
      setError(data.error || "Could not send the request.");
      return;
    }
    setRows((prev) => [data.request!, ...prev]);
    setMessage("");
  }

  async function coachRespond(row: FeedbackRow) {
    const draft = (responseDraft[row.id] ?? "").trim();
    if (draft.length < 3) {
      setError("Response is too short.");
      return;
    }
    setBusyId(row.id);
    setError(null);
    const response = await fetch(`/api/portal/feedback-requests/${row.id}/respond`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: draft }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; request?: FeedbackRow };
    setBusyId(null);
    if (!response.ok || !data.request) {
      setError(data.error || "Could not send the response.");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === row.id ? data.request! : r)));
    setResponseDraft((prev) => ({ ...prev, [row.id]: "" }));
  }

  async function adminApprove(row: FeedbackRow) {
    setBusyId(row.id);
    setError(null);
    const response = await fetch(`/api/portal/feedback-requests/${row.id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; request?: FeedbackRow };
    setBusyId(null);
    if (!response.ok || !data.request) {
      setError(data.error || "Could not approve.");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === row.id ? data.request! : r)));
  }

  async function adminReject(row: FeedbackRow) {
    const notes = (rejectDraft[row.id] ?? "").trim();
    if (notes.length < 3) {
      setError("Include a short note so the coach knows what to change.");
      return;
    }
    setBusyId(row.id);
    setError(null);
    const response = await fetch(`/api/portal/feedback-requests/${row.id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", notes }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; request?: FeedbackRow };
    setBusyId(null);
    if (!response.ok || !data.request) {
      setError(data.error || "Could not send the feedback back to the coach.");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === row.id ? data.request! : r)));
    setRejectDraft((prev) => ({ ...prev, [row.id]: "" }));
    setRejectOpen((prev) => ({ ...prev, [row.id]: false }));
  }

  async function cancelOwn(row: FeedbackRow) {
    if (!window.confirm("Cancel this feedback request?")) return;
    setBusyId(row.id);
    setError(null);
    const response = await fetch(`/api/portal/feedback-requests/${row.id}`, { method: "DELETE" });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setBusyId(null);
    if (!response.ok) {
      setError(data.error || "Could not cancel.");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: "cancelled" as const } : r)));
  }

  const canSeeCoachResponseAsRequester = (row: FeedbackRow) => row.status === "approved";

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {mode === "requester" ? (
        <div className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50/70 dark:bg-navy-900/50 p-4">
          <h3 className="text-base font-semibold text-navy-900 dark:text-white">
            Request additional feedback
          </h3>
          <p className="mt-1 text-xs text-charcoal/60 dark:text-navy-300">
            Pick a class, say what you'd like feedback on. The coach drafts a reply and an admin
            reviews it before it reaches you.
          </p>

          {enrollments.length === 0 ? (
            <p className="mt-3 text-sm text-charcoal/70 dark:text-navy-300">
              No active enrollments to request feedback for.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
                  Class
                </span>
                <select
                  value={selectedEnrollmentIndex}
                  onChange={(e) => setSelectedEnrollmentIndex(Number(e.target.value))}
                  className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
                >
                  {enrollments.map((option, index) => (
                    <option key={`${option.classId}:${option.studentId}`} value={index}>
                      {option.className}
                      {currentUserRole === "parent" ? ` — ${option.studentName}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
                  Message to the coach
                </span>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Could you share how she's doing on cross-examination? She's been practising at home and I'd love to know where to help her next."
                  className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={createRequest}
                disabled={creating}
                className="rounded-md bg-navy-800 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-gold-400 dark:text-navy-900"
              >
                {creating ? "Sending…" : "Send request"}
              </button>
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-navy-900 dark:text-white">
          {mode === "coach"
            ? "Requests waiting on you"
            : mode === "admin"
              ? "Responses waiting for review"
              : "Your requests"}
        </h3>

        {activeRows.length === 0 ? (
          <p className="text-sm text-charcoal/60 dark:text-navy-400">
            {mode === "coach"
              ? "Nothing waiting on you right now."
              : mode === "admin"
                ? "No responses in the queue."
                : "You haven't sent any requests yet."}
          </p>
        ) : (
          activeRows.map((row) => {
            const primaryCoachId = classPrimaryCoach[row.class_id];
            const canRespondAsCoach = mode === "coach" && row.status === "pending_coach";
            const canReviewAsAdmin = mode === "admin" && row.status === "pending_admin";
            const canCancelAsRequester =
              mode === "requester" && row.requested_by === currentUserId && row.status === "pending_coach";

            return (
              <article
                key={row.id}
                className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4"
              >
                <header className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">
                      {classMap[row.class_id] ?? row.class_id} · {studentMap[row.student_id] ?? row.student_id}
                    </p>
                    <p className="text-xs text-charcoal/60 dark:text-navy-300">
                      Requested by {requesterMap[row.requested_by]?.name ?? "someone"} · {formatDate(row.created_at)}
                      {mode === "admin" && primaryCoachId
                        ? ` · Coach: ${coachMap[primaryCoachId] ?? primaryCoachId}`
                        : ""}
                      {row.rejection_count > 0 ? ` · Redraft #${row.rejection_count}` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_PILL[row.status]}`}>
                    {STATUS_LABELS[row.status]}
                  </span>
                </header>

                <div className="mt-3 space-y-2 text-sm">
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wide text-charcoal/50 dark:text-navy-400">
                      Their message
                    </span>
                    <p className="whitespace-pre-wrap text-navy-900 dark:text-navy-100">
                      {row.request_message}
                    </p>
                  </div>

                  {mode !== "requester" || canSeeCoachResponseAsRequester(row) ? (
                    row.coach_response ? (
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wide text-charcoal/50 dark:text-navy-400">
                          Coach draft
                        </span>
                        <p className="whitespace-pre-wrap text-navy-900 dark:text-navy-100">
                          {row.coach_response}
                        </p>
                        {row.coach_responded_at ? (
                          <p className="mt-0.5 text-[11px] text-charcoal/50 dark:text-navy-400">
                            Drafted {formatDate(row.coach_responded_at)}
                          </p>
                        ) : null}
                      </div>
                    ) : null
                  ) : row.status === "pending_admin" ? (
                    <p className="text-xs text-charcoal/60 dark:text-navy-300 italic">
                      Coach has drafted a response. Waiting on admin review before it reaches you.
                    </p>
                  ) : null}

                  {mode !== "requester" && row.admin_rejection_notes ? (
                    <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-900/25">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                        Admin asked for changes
                      </span>
                      <p className="whitespace-pre-wrap text-sm text-amber-900 dark:text-amber-100">
                        {row.admin_rejection_notes}
                      </p>
                    </div>
                  ) : null}
                </div>

                {canRespondAsCoach ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      rows={4}
                      value={responseDraft[row.id] ?? row.coach_response ?? ""}
                      onChange={(e) =>
                        setResponseDraft((prev) => ({ ...prev, [row.id]: e.target.value }))
                      }
                      placeholder="Write your response. It goes to an admin for review before reaching the family."
                      className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => coachRespond(row)}
                      disabled={busyId === row.id}
                      className="rounded-md bg-navy-800 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-gold-400 dark:text-navy-900"
                    >
                      {busyId === row.id ? "Sending…" : "Send to admin for review"}
                    </button>
                  </div>
                ) : null}

                {canReviewAsAdmin ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => adminApprove(row)}
                      disabled={busyId === row.id}
                      className="rounded-md bg-green-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {busyId === row.id ? "Working…" : "Approve & send"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setRejectOpen((prev) => ({ ...prev, [row.id]: !prev[row.id] }))
                      }
                      className="rounded-md border border-warm-300 dark:border-navy-600 px-3 py-1.5 text-sm"
                    >
                      Send back to coach
                    </button>
                    {rejectOpen[row.id] ? (
                      <div className="basis-full space-y-2">
                        <textarea
                          rows={3}
                          value={rejectDraft[row.id] ?? ""}
                          onChange={(e) =>
                            setRejectDraft((prev) => ({ ...prev, [row.id]: e.target.value }))
                          }
                          placeholder="Explain what should change. The coach sees these notes and can redraft."
                          className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => adminReject(row)}
                          disabled={busyId === row.id}
                          className="rounded-md bg-amber-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {busyId === row.id ? "Sending…" : "Bounce back with notes"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {canCancelAsRequester ? (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => cancelOwn(row)}
                      disabled={busyId === row.id}
                      className="text-xs text-red-700 hover:underline dark:text-red-300 disabled:opacity-60"
                    >
                      {busyId === row.id ? "Cancelling…" : "Cancel this request"}
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>

      {mode === "requester" && archivedRows.length > 0 ? (
        <details className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50/40 dark:bg-navy-900/40 p-3 text-sm">
          <summary className="cursor-pointer font-semibold text-navy-900 dark:text-white">
            Archived ({archivedRows.length})
          </summary>
          <div className="mt-3 space-y-3">
            {archivedRows.map((row) => (
              <div
                key={row.id}
                className="rounded-md border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-navy-900 dark:text-white">
                    {classMap[row.class_id] ?? row.class_id} · {studentMap[row.student_id] ?? row.student_id}
                  </p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_PILL[row.status]}`}>
                    {STATUS_LABELS[row.status]}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-xs text-charcoal/70 dark:text-navy-200">
                  {row.request_message}
                </p>
                {row.status === "approved" && row.coach_response ? (
                  <p className="mt-1 whitespace-pre-wrap text-xs text-navy-900 dark:text-navy-100">
                    <span className="font-semibold">Coach:</span> {row.coach_response}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </details>
      ) : null}

      {/* Suppress unused warning for adminMap in requester mode */}
      <div hidden>{Object.keys(adminMap).length}</div>
    </div>
  );
}
