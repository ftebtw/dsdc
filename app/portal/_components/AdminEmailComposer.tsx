"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PersonOption = {
  id: string;
  displayName: string | null;
  email: string;
  role: string;
};

type ClassOption = {
  id: string;
  name: string;
  termName: string | null;
};

type PastSend = {
  id: string;
  subject: string;
  target_type: string;
  recipient_count: number;
  force_send: boolean;
  attachment_manifest: Array<{ name: string; size: number }>;
  created_at: string;
};

type Props = {
  people: PersonOption[];
  classes: ClassOption[];
  initialPastSends: PastSend[];
};

type TargetType = "person" | "all_students" | "all_coaches" | "class" | "custom";

const TARGET_OPTIONS: Array<{ value: TargetType; label: string; hint: string }> = [
  { value: "person", label: "Specific person", hint: "Coach, student, or parent" },
  { value: "all_students", label: "All students", hint: "Every student profile" },
  { value: "all_coaches", label: "All coaches / TAs", hint: "Every coach and TA profile" },
  {
    value: "class",
    label: "Everyone in one class",
    hint: "Students, their linked parents, and the coaches on the class",
  },
  { value: "custom", label: "Manually pick recipients", hint: "Check people from the full list" },
];

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

function friendlyBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminEmailComposer({ people, classes, initialPastSends }: Props) {
  const [targetType, setTargetType] = useState<TargetType>("all_students");
  const [personId, setPersonId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [customIds, setCustomIds] = useState<Set<string>>(new Set());
  const [customSearch, setCustomSearch] = useState<string>("");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [forceSend, setForceSend] = useState(false);

  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [preview, setPreview] = useState<{
    totalCount: number;
    optedInCount: number;
    optedOutCount: number;
    sample: Array<{ displayName: string | null; email: string; role: string; wantsGeneralUpdates: boolean }>;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const [pastSends, setPastSends] = useState<PastSend[]>(initialPastSends);

  const filteredPeople = useMemo(() => {
    if (!customSearch.trim()) return people;
    const q = customSearch.trim().toLowerCase();
    return people.filter(
      (person) =>
        person.email.toLowerCase().includes(q) ||
        (person.displayName ?? "").toLowerCase().includes(q) ||
        person.role.toLowerCase().includes(q)
    );
  }, [people, customSearch]);

  // Preview whenever the target spec changes. Debounce a beat so switching
  // targets doesn't spam the API.
  useEffect(() => {
    let ignore = false;
    setError(null);

    const targetReady =
      (targetType === "all_students" || targetType === "all_coaches") ||
      (targetType === "person" && personId) ||
      (targetType === "class" && classId) ||
      (targetType === "custom" && customIds.size > 0);

    if (!targetReady) {
      setPreview(null);
      return;
    }

    setPreviewLoading(true);
    const handle = window.setTimeout(async () => {
      try {
        const payload: Record<string, unknown> = { targetType };
        if (targetType === "person") payload.id = personId;
        if (targetType === "class") payload.id = classId;
        if (targetType === "custom") payload.ids = [...customIds];
        const response = await fetch("/api/portal/admin/emails/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
          totalCount?: number;
          optedInCount?: number;
          optedOutCount?: number;
          sample?: any[];
        };
        if (ignore) return;
        if (!response.ok) {
          setError(data.error || "Could not resolve recipients.");
          setPreview(null);
        } else {
          setPreview({
            totalCount: data.totalCount ?? 0,
            optedInCount: data.optedInCount ?? 0,
            optedOutCount: data.optedOutCount ?? 0,
            sample: (data.sample ?? []) as any[],
          });
        }
      } catch (err) {
        if (!ignore) setError("Could not resolve recipients.");
      } finally {
        if (!ignore) setPreviewLoading(false);
      }
    }, 220);

    return () => {
      ignore = true;
      window.clearTimeout(handle);
    };
  }, [targetType, personId, classId, customIds]);

  function toggleCustom(id: string) {
    setCustomIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addAttachments(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setAttachments((prev) => {
      const merged = [...prev];
      for (const file of Array.from(files)) {
        if (merged.length >= MAX_ATTACHMENTS) {
          setError(`Only ${MAX_ATTACHMENTS} files per email.`);
          break;
        }
        if (file.size > MAX_ATTACHMENT_BYTES) {
          setError(`"${file.name}" is over the 25MB limit.`);
          continue;
        }
        merged.push(file);
      }
      return merged;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  async function send() {
    if (!preview || preview.totalCount === 0) {
      setError("No recipients matched. Pick a target.");
      return;
    }
    if (subject.trim().length === 0 || body.trim().length === 0) {
      setError("Subject and message are required.");
      return;
    }
    setSending(true);
    setError(null);
    setFlash(null);

    const form = new FormData();
    form.append("targetType", targetType);
    if (targetType === "person" && personId) form.append("id", personId);
    if (targetType === "class" && classId) form.append("id", classId);
    if (targetType === "custom") {
      for (const id of customIds) form.append("ids", id);
    }
    form.append("subject", subject.trim());
    form.append("body", body.trim());
    form.append("forceSend", forceSend ? "true" : "false");
    for (const file of attachments) form.append("attachments", file);

    const response = await fetch("/api/portal/admin/emails", {
      method: "POST",
      body: form,
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      recipientCount?: number;
      skippedForOptOut?: number;
      failedCount?: number;
    };
    setSending(false);
    if (!response.ok) {
      setError(data.error || "Send failed.");
      return;
    }

    const parts: string[] = [];
    parts.push(`Sent to ${data.recipientCount ?? 0} recipient${data.recipientCount === 1 ? "" : "s"}`);
    if (data.skippedForOptOut && data.skippedForOptOut > 0) {
      parts.push(`${data.skippedForOptOut} skipped for opt-out`);
    }
    if (data.failedCount && data.failedCount > 0) {
      parts.push(`${data.failedCount} failed`);
    }
    setFlash(parts.join(" · "));
    setSubject("");
    setBody("");
    setAttachments([]);
    setForceSend(false);
    // Refresh audit list.
    try {
      const auditRes = await fetch("/api/portal/admin/emails");
      const auditData = (await auditRes.json().catch(() => ({}))) as { sends?: PastSend[] };
      if (auditData.sends) setPastSends(auditData.sends);
    } catch {
      /* noop */
    }
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

      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-charcoal/60 dark:text-navy-300">
          Who's this going to?
        </span>
        <div className="grid gap-2 sm:grid-cols-2">
          {TARGET_OPTIONS.map((option) => {
            const active = targetType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTargetType(option.value)}
                className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                  active
                    ? "border-navy-800 bg-navy-800 text-white dark:border-gold-300 dark:bg-gold-300 dark:text-navy-900"
                    : "border-warm-300 bg-white text-navy-900 hover:border-navy-400 dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100"
                }`}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className={`block text-xs ${active ? "text-white/80 dark:text-navy-900/70" : "text-charcoal/60 dark:text-navy-300"}`}>
                  {option.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {targetType === "person" ? (
        <label className="block">
          <span className="mb-1 block text-xs text-charcoal/60 dark:text-navy-300">
            Person
          </span>
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            <option value="">— pick someone —</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {(person.displayName || person.email) + ` (${person.role}) — ${person.email}`}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {targetType === "class" ? (
        <label className="block">
          <span className="mb-1 block text-xs text-charcoal/60 dark:text-navy-300">
            Class
          </span>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            <option value="">— pick a class —</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.termName ? ` — ${c.termName}` : ""}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {targetType === "custom" ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="search"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              placeholder="Filter by name, email, or role…"
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm"
            />
            <span className="text-xs text-charcoal/60 dark:text-navy-300 shrink-0">
              {customIds.size} selected
            </span>
          </div>
          <div className="max-h-72 overflow-auto rounded-lg border border-warm-200 dark:border-navy-600 divide-y divide-warm-200 dark:divide-navy-700">
            {filteredPeople.slice(0, 300).map((person) => {
              const checked = customIds.has(person.id);
              return (
                <label
                  key={person.id}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-warm-50 dark:hover:bg-navy-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCustom(person.id)}
                    className="accent-navy-800"
                  />
                  <span className="flex-1 truncate">
                    <span className="font-medium">{person.displayName || person.email}</span>
                    <span className="ml-2 text-xs text-charcoal/60 dark:text-navy-300">
                      {person.role} · {person.email}
                    </span>
                  </span>
                </label>
              );
            })}
            {filteredPeople.length === 0 ? (
              <p className="px-3 py-2 text-xs text-charcoal/60 dark:text-navy-300">
                No matches.
              </p>
            ) : filteredPeople.length > 300 ? (
              <p className="px-3 py-2 text-[11px] text-charcoal/50 dark:text-navy-400 italic">
                Showing first 300. Narrow the search to see more.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-warm-200 dark:border-navy-600 bg-warm-50/60 dark:bg-navy-900/50 p-3 text-sm">
        {previewLoading ? (
          <p className="text-charcoal/60 dark:text-navy-300">Resolving recipients…</p>
        ) : preview ? (
          <>
            <p className="font-semibold">
              {preview.optedInCount} will receive this email
              {preview.optedOutCount > 0 ? (
                <span className="ml-1 text-xs font-normal text-charcoal/60 dark:text-navy-300">
                  ({preview.optedOutCount} opted-out {forceSend ? "will be included" : "will be skipped"})
                </span>
              ) : null}
            </p>
            {preview.sample.length > 0 ? (
              <p className="mt-1 text-xs text-charcoal/70 dark:text-navy-300">
                Sample:{" "}
                {preview.sample
                  .map((r) => `${r.displayName || r.email}${r.wantsGeneralUpdates ? "" : " (opted-out)"}`)
                  .join(", ")}
                {preview.totalCount > preview.sample.length ? `, and ${preview.totalCount - preview.sample.length} more` : ""}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-charcoal/60 dark:text-navy-300">
            Pick a target above to see how many people will receive this.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="mb-1 block text-xs text-charcoal/60 dark:text-navy-300">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={200}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-charcoal/60 dark:text-navy-300">Message</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            maxLength={20000}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <span className="mt-1 block text-[11px] text-charcoal/50 dark:text-navy-400">
            Plain text. Blank lines start new paragraphs. Recipients will see it as HTML in their inbox with your name signed at the bottom.
          </span>
        </label>
      </div>

      <div className="space-y-2 rounded-lg border border-warm-200 dark:border-navy-600 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-charcoal/60 dark:text-navy-300">
            Attachments (optional)
          </span>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-navy-800 bg-white px-3 py-1.5 text-xs font-semibold text-navy-800 hover:bg-navy-50 dark:border-gold-400 dark:bg-transparent dark:text-gold-300 dark:hover:bg-gold-400/10">
            Add files
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addAttachments(e.target.files)}
            />
          </label>
        </div>
        {attachments.length === 0 ? (
          <p className="text-[11px] text-charcoal/60 dark:text-navy-300">
            Up to {MAX_ATTACHMENTS} files. 25MB per file.
          </p>
        ) : (
          <ul className="text-sm space-y-1">
            {attachments.map((file, i) => (
              <li key={`${file.name}:${i}`} className="flex items-center justify-between gap-2 text-charcoal/80 dark:text-navy-100">
                <span className="truncate">{file.name}</span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-charcoal/60 dark:text-navy-300">{friendlyBytes(file.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    className="text-xs text-red-600 hover:underline dark:text-red-300"
                  >
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-navy-900 dark:text-navy-100">
        <input
          type="checkbox"
          checked={forceSend}
          onChange={(e) => setForceSend(e.target.checked)}
          className="accent-navy-800"
        />
        <span>
          Force send — include recipients who opted out of general updates.
          <span className="ml-1 text-xs text-charcoal/60 dark:text-navy-300">
            Use for essential messages only (schedule changes, cancellations).
          </span>
        </span>
      </label>

      <div>
        <button
          type="button"
          onClick={send}
          disabled={sending || !preview || preview.totalCount === 0}
          className="rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-gold-400 dark:text-navy-900"
        >
          {sending ? "Sending…" : `Send email`}
        </button>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-navy-900 dark:text-white">
          Recent sends
        </h4>
        {pastSends.length === 0 ? (
          <p className="text-xs text-charcoal/60 dark:text-navy-300">Nothing sent yet.</p>
        ) : (
          <ul className="divide-y divide-warm-200 dark:divide-navy-700 rounded-lg border border-warm-200 dark:border-navy-600">
            {pastSends.map((row) => (
              <li key={row.id} className="px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-navy-900 dark:text-white truncate">
                    {row.subject}
                  </span>
                  <span className="text-xs text-charcoal/60 dark:text-navy-300">
                    {formatDate(row.created_at)}
                  </span>
                </div>
                <p className="text-xs text-charcoal/60 dark:text-navy-300">
                  {row.target_type.replace(/_/g, " ")} · {row.recipient_count} recipients
                  {row.force_send ? " · forced" : ""}
                  {row.attachment_manifest?.length ? ` · ${row.attachment_manifest.length} attachments` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
