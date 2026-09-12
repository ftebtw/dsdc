"use client";

import { useMemo, useState } from "react";

type ClassOption = {
  id: string;
  name: string;
  coachName: string | null;
  openRequest: {
    id: string;
    message: string | null;
    due_date: string | null;
    requested_at: string;
  } | null;
};

type Props = {
  termId: string;
  classes: ClassOption[];
};

export default function AdminReportCardRequestForm({ termId, classes: initialClasses }: Props) {
  const [classes, setClasses] = useState<ClassOption[]>(initialClasses);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [busyRetractId, setBusyRetractId] = useState<string | null>(null);

  const requestableClasses = useMemo(
    () => classes.filter((c) => !c.openRequest),
    [classes]
  );
  const openRequestClasses = useMemo(
    () => classes.filter((c) => c.openRequest),
    [classes]
  );

  function toggle(classId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(requestableClasses.map((c) => c.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function submit() {
    if (selected.size === 0) {
      setError("Pick at least one class.");
      return;
    }
    setSending(true);
    setError(null);
    setFlash(null);

    const response = await fetch("/api/portal/admin/report-card-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        termId,
        classIds: [...selected],
        message: message.trim() || undefined,
        dueDate: dueDate || undefined,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      inserted?: number;
      skipped?: number;
    };
    setSending(false);
    if (!response.ok) {
      setError(data.error || "Could not send the request.");
      return;
    }

    // Optimistic UI: mark the newly-requested classes as open.
    const nowIso = new Date().toISOString();
    setClasses((prev) =>
      prev.map((c) =>
        selected.has(c.id)
          ? {
              ...c,
              openRequest: c.openRequest ?? {
                id: "__pending__",
                message: message.trim() || null,
                due_date: dueDate || null,
                requested_at: nowIso,
              },
            }
          : c
      )
    );
    setSelected(new Set());
    setMessage("");
    setDueDate("");
    const parts: string[] = [];
    if (data.inserted) parts.push(`${data.inserted} request${data.inserted === 1 ? "" : "s"} sent`);
    if (data.skipped) parts.push(`${data.skipped} already open`);
    setFlash(parts.join(" · ") || "Done.");
  }

  async function retract(classId: string, requestId: string) {
    if (!window.confirm("Retract this report card request?")) return;
    setBusyRetractId(requestId);
    setError(null);
    setFlash(null);
    const response = await fetch(`/api/portal/admin/report-card-requests/${requestId}`, {
      method: "DELETE",
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setBusyRetractId(null);
    if (!response.ok) {
      setError(data.error || "Could not retract.");
      return;
    }
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, openRequest: null } : c))
    );
    setFlash("Request retracted.");
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      ) : null}
      {flash ? (
        <p className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-200">
          {flash}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="block text-xs mb-1 text-charcoal/60 dark:text-navy-300">
            Due date (optional)
          </span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
        </label>
        <label>
          <span className="block text-xs mb-1 text-charcoal/60 dark:text-navy-300">
            Message to coaches (optional)
          </span>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Please submit by end of week — reviewing on Monday."
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-navy-900 dark:text-white">
            Classes needing a request ({requestableClasses.length})
          </h4>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={selectAll}
              disabled={requestableClasses.length === 0}
              className="rounded-md border border-warm-300 dark:border-navy-600 px-2 py-1 disabled:opacity-50"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={clearSelection}
              disabled={selected.size === 0}
              className="rounded-md border border-warm-300 dark:border-navy-600 px-2 py-1 disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>

        {requestableClasses.length === 0 ? (
          <p className="text-sm text-charcoal/60 dark:text-navy-400">
            Every class in this term already has an open request.
          </p>
        ) : (
          <ul className="divide-y divide-warm-200 dark:divide-navy-700 rounded-xl border border-warm-200 dark:border-navy-600">
            {requestableClasses.map((c) => {
              const checked = selected.has(c.id);
              return (
                <li key={c.id} className="flex items-center gap-3 px-3 py-2">
                  <input
                    type="checkbox"
                    id={`request-cls-${c.id}`}
                    checked={checked}
                    onChange={() => toggle(c.id)}
                    className="accent-navy-800"
                  />
                  <label htmlFor={`request-cls-${c.id}`} className="flex-1 cursor-pointer text-sm">
                    <span className="font-medium text-navy-900 dark:text-white">{c.name}</span>
                    {c.coachName ? (
                      <span className="ml-2 text-xs text-charcoal/60 dark:text-navy-400">
                        Coach: {c.coachName}
                      </span>
                    ) : (
                      <span className="ml-2 text-xs text-amber-700 dark:text-amber-300">
                        No primary coach — email won't send.
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={sending || selected.size === 0}
            className="rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-gold-400 dark:text-navy-900"
          >
            {sending
              ? "Sending…"
              : `Send request${selected.size === 1 ? "" : "s"} (${selected.size})`}
          </button>
        </div>
      </div>

      {openRequestClasses.length > 0 ? (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-navy-900 dark:text-white">
            Already requested ({openRequestClasses.length})
          </h4>
          <ul className="divide-y divide-warm-200 dark:divide-navy-700 rounded-xl border border-warm-200 dark:border-navy-600">
            {openRequestClasses.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-3 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-navy-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-charcoal/60 dark:text-navy-400">
                    Coach: {c.coachName ?? "—"}
                    {c.openRequest?.due_date ? ` · Due ${c.openRequest.due_date}` : ""}
                  </p>
                  {c.openRequest?.message ? (
                    <p className="mt-1 text-xs text-charcoal/70 dark:text-navy-300 italic">
                      "{c.openRequest.message}"
                    </p>
                  ) : null}
                </div>
                {c.openRequest && c.openRequest.id !== "__pending__" ? (
                  <button
                    type="button"
                    onClick={() => retract(c.id, c.openRequest!.id)}
                    disabled={busyRetractId === c.openRequest.id}
                    className="rounded-md border border-warm-300 dark:border-navy-600 px-2.5 py-1 text-xs disabled:opacity-60"
                  >
                    {busyRetractId === c.openRequest.id ? "Retracting…" : "Retract"}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
