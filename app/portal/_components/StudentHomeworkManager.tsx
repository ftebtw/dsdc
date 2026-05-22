"use client";

import { useMemo, useRef, useState } from 'react';
import OpenSignedUrlButton from '@/app/portal/_components/OpenSignedUrlButton';
import { useI18n } from '@/lib/i18n';
import { portalT } from '@/lib/portal/parent-i18n';

type ClassOption = { id: string; name: string };

type Assignment = {
  id: string;
  class_id: string;
  className: string;
  title: string;
  description: string | null;
  external_urls: string[];
  file_path: string | null;
  file_name: string | null;
  due_date: string | null;
  publish_at: string;
  created_at: string;
};

type Submission = {
  id: string;
  class_id: string;
  className: string;
  assignment_id: string | null;
  student_id: string;
  title: string;
  notes: string | null;
  file_path: string | null;
  file_name: string | null;
  external_url: string | null;
  external_urls: string[] | null;
  due_date: string | null;
  grade: string | null;
  feedback: string | null;
  graded_at: string | null;
  gradedByName?: string | null;
  created_at: string;
};

function effectiveUrls(submission: Submission): string[] {
  const fromArray = (submission.external_urls ?? []).filter((u): u is string => Boolean(u && u.trim()));
  if (fromArray.length > 0) return fromArray;
  return submission.external_url ? [submission.external_url] : [];
}

function shortHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function formatDueDate(iso: string): string {
  const [y, m, d] = iso.split('-').map((s) => parseInt(s, 10));
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function isOverdue(dueDateIso: string | null): boolean {
  if (!dueDateIso) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dueDateIso < today;
}

type SubmitDraft = {
  notes: string;
  externalUrls: string[];
  file: File | null;
};

function emptyDraft(submission?: Submission | null): SubmitDraft {
  return {
    notes: submission?.notes ?? '',
    externalUrls: submission?.external_urls && submission.external_urls.length > 0
      ? submission.external_urls
      : submission?.external_url
        ? [submission.external_url]
        : [''],
    file: null,
  };
}

export default function StudentHomeworkManager({
  classes,
  assignments,
  initialSubmissions,
}: {
  classes: ClassOption[];
  assignments: Assignment[];
  initialSubmissions: Submission[];
}) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);

  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const submissionForAssignment = useMemo(() => {
    const map = new Map<string, Submission>();
    for (const s of submissions) {
      if (s.assignment_id) map.set(s.assignment_id, s);
    }
    return map;
  }, [submissions]);

  const legacySubmissions = useMemo(
    () => submissions.filter((s) => !s.assignment_id),
    [submissions]
  );

  const [drafts, setDrafts] = useState<Record<string, SubmitDraft>>(() => {
    const map: Record<string, SubmitDraft> = {};
    for (const assignment of assignments) {
      const existing = initialSubmissions.find((s) => s.assignment_id === assignment.id) || null;
      map[assignment.id] = emptyDraft(existing);
    }
    return map;
  });
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [statusByAssignment, setStatusByAssignment] = useState<Record<string, { error?: string; success?: string }>>(
    {}
  );

  function updateDraft(assignmentId: string, patch: Partial<SubmitDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [assignmentId]: { ...(prev[assignmentId] ?? emptyDraft()), ...patch },
    }));
  }

  function updateUrlAt(assignmentId: string, i: number, value: string) {
    setDrafts((prev) => {
      const draft = prev[assignmentId] ?? emptyDraft();
      return {
        ...prev,
        [assignmentId]: {
          ...draft,
          externalUrls: draft.externalUrls.map((u, idx) => (idx === i ? value : u)),
        },
      };
    });
  }

  function addUrlRow(assignmentId: string) {
    setDrafts((prev) => {
      const draft = prev[assignmentId] ?? emptyDraft();
      if (draft.externalUrls.length >= 10) return prev;
      return {
        ...prev,
        [assignmentId]: { ...draft, externalUrls: [...draft.externalUrls, ''] },
      };
    });
  }

  function removeUrlRow(assignmentId: string, i: number) {
    setDrafts((prev) => {
      const draft = prev[assignmentId] ?? emptyDraft();
      return {
        ...prev,
        [assignmentId]: {
          ...draft,
          externalUrls:
            draft.externalUrls.length <= 1 ? [''] : draft.externalUrls.filter((_, idx) => idx !== i),
        },
      };
    });
  }

  async function submitAssignment(assignment: Assignment) {
    const draft = drafts[assignment.id] ?? emptyDraft();
    const cleanedUrls = draft.externalUrls.map((u) => u.trim()).filter((u) => u.length > 0);
    if (!draft.file && cleanedUrls.length === 0 && !draft.notes.trim()) {
      setStatusByAssignment((prev) => ({
        ...prev,
        [assignment.id]: { error: 'Add a file, link, or notes before submitting.' },
      }));
      return;
    }

    setSubmittingId(assignment.id);
    setStatusByAssignment((prev) => ({ ...prev, [assignment.id]: {} }));

    const formData = new FormData();
    formData.append('classId', assignment.class_id);
    formData.append('assignmentId', assignment.id);
    formData.append('title', assignment.title);
    if (draft.notes.trim()) formData.append('notes', draft.notes.trim());
    for (const url of cleanedUrls) formData.append('externalUrls', url);
    if (assignment.due_date) formData.append('dueDate', assignment.due_date);
    if (draft.file) formData.append('file', draft.file);

    const response = await fetch('/api/portal/homework-submissions', {
      method: 'POST',
      body: formData,
    });
    const data = (await response.json()) as {
      error?: string;
      className?: string;
      submission?: Omit<Submission, 'className' | 'gradedByName'>;
    };
    setSubmittingId(null);

    if (!response.ok || !data.submission) {
      setStatusByAssignment((prev) => ({
        ...prev,
        [assignment.id]: { error: data.error || 'Could not submit homework.' },
      }));
      return;
    }

    const className = data.className || assignment.className;
    const next: Submission = { ...data.submission, className };
    setSubmissions((prev) => {
      const without = prev.filter((s) => s.id !== next.id);
      return [next, ...without];
    });
    setStatusByAssignment((prev) => ({
      ...prev,
      [assignment.id]: { success: 'Submitted! Your coach will review it.' },
    }));
    setDrafts((prev) => ({ ...prev, [assignment.id]: emptyDraft(next) }));
    const inputEl = fileInputRefs.current[assignment.id];
    if (inputEl) inputEl.value = '';
  }

  return (
    <div className="space-y-6">
      {assignments.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          No homework has been posted yet for your classes.
        </p>
      ) : null}

      <div className="space-y-3">
        {assignments.map((assignment) => {
          const existing = submissionForAssignment.get(assignment.id) || null;
          const draft = drafts[assignment.id] ?? emptyDraft(existing);
          const overdue = isOverdue(assignment.due_date);
          const locked = Boolean(existing?.graded_at);
          const status = statusByAssignment[assignment.id] || {};
          const lateLabel =
            existing && assignment.due_date && existing.created_at.slice(0, 10) > assignment.due_date
              ? 'Late'
              : null;
          return (
            <article
              key={assignment.id}
              className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4"
            >
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-navy-800 dark:text-white">{assignment.title}</h3>
                  <p className="text-xs text-charcoal/65 dark:text-navy-300">{assignment.className}</p>
                  {assignment.due_date ? (
                    <p
                      className={`text-xs font-semibold ${
                        overdue ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      Due: {formatDueDate(assignment.due_date)} {overdue ? '(overdue)' : ''}
                    </p>
                  ) : (
                    <p className="text-xs text-charcoal/55 dark:text-navy-400">No due date</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    existing?.graded_at
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : existing
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        : overdue
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {existing?.graded_at
                    ? 'Graded'
                    : existing
                      ? `Submitted${lateLabel ? ' · Late' : ''}`
                      : overdue
                        ? 'Not submitted (overdue)'
                        : 'Not submitted'}
                </span>
              </header>

              {assignment.description ? (
                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-charcoal/75 dark:text-navy-200">
                  {assignment.description}
                </p>
              ) : null}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {assignment.external_urls.map((url, i) => (
                  <a
                    key={`${assignment.id}-link-${i}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-warm-300 px-3 py-1.5 text-xs text-charcoal hover:bg-warm-50 dark:border-navy-600 dark:text-navy-100 dark:hover:bg-navy-800"
                    title={url}
                  >
                    Open ({shortHost(url)})
                  </a>
                ))}
                {assignment.file_path ? (
                  <OpenSignedUrlButton
                    endpoint={`/api/portal/homework-assignments/${assignment.id}/signed-url`}
                    label={`Open file${assignment.file_name ? ` (${assignment.file_name})` : ''}`}
                  />
                ) : null}
              </div>

              {locked && existing ? (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-900/50 dark:bg-green-900/20">
                  <p className="font-semibold text-green-900 dark:text-green-200">
                    Graded: {existing.grade}
                  </p>
                  {existing.feedback ? (
                    <p className="mt-1 whitespace-pre-wrap break-words text-green-900 dark:text-green-200">
                      {existing.feedback}
                    </p>
                  ) : null}
                  {existing.gradedByName ? (
                    <p className="mt-1 text-xs text-green-900/70 dark:text-green-300/70">
                      — {existing.gradedByName}
                    </p>
                  ) : null}
                  <div className="mt-3 space-y-1 text-xs text-green-900/80 dark:text-green-200/80">
                    {existing.notes ? <p>Your notes: {existing.notes}</p> : null}
                    {effectiveUrls(existing).map((url, idx) => (
                      <a
                        key={`${existing.id}-grade-link-${idx}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {shortHost(url)}
                      </a>
                    ))}
                    {existing.file_path ? (
                      <OpenSignedUrlButton
                        endpoint={`/api/portal/homework-submissions/${existing.id}/signed-url`}
                        label="Open your submitted file"
                      />
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3 rounded-lg border border-warm-200 bg-warm-50 p-3 dark:border-navy-700 dark:bg-navy-900/40">
                  <p className="text-xs font-semibold text-charcoal/70 dark:text-navy-300">
                    {existing ? 'Update your submission' : 'Submit your work'}
                  </p>
                  <textarea
                    rows={3}
                    value={draft.notes}
                    onChange={(event) => updateDraft(assignment.id, { notes: event.target.value })}
                    className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
                    placeholder="Notes for your coach (optional)"
                  />
                  <div className="space-y-2">
                    <span className="block text-xs text-charcoal/70 dark:text-navy-300">Links (optional)</span>
                    {draft.externalUrls.map((url, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(event) => updateUrlAt(assignment.id, i, event.target.value)}
                          placeholder="https://..."
                          className="flex-1 rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
                        />
                        {draft.externalUrls.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeUrlRow(assignment.id, i)}
                            className="rounded-md border border-warm-300 dark:border-navy-600 px-2 py-1.5 text-xs"
                            aria-label="Remove link"
                          >
                            ×
                          </button>
                        ) : null}
                      </div>
                    ))}
                    {draft.externalUrls.length < 10 ? (
                      <button
                        type="button"
                        onClick={() => addUrlRow(assignment.id)}
                        className="text-xs font-semibold text-navy-700 hover:text-navy-900 dark:text-gold-300 dark:hover:text-gold-200"
                      >
                        + Add another link
                      </button>
                    ) : null}
                  </div>
                  <input
                    ref={(el) => {
                      fileInputRefs.current[assignment.id] = el;
                    }}
                    type="file"
                    onChange={(event) =>
                      updateDraft(assignment.id, { file: event.target.files?.[0] || null })
                    }
                    className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-gold-300 file:px-3 file:py-1"
                  />
                  {existing?.file_path && !draft.file ? (
                    <p className="text-xs text-charcoal/60 dark:text-navy-400">
                      Current file: {existing.file_name || 'attached'}
                    </p>
                  ) : null}
                  {status.success ? (
                    <p className="text-sm text-green-700 dark:text-green-400">{status.success}</p>
                  ) : null}
                  {status.error ? <p className="text-sm text-red-700">{status.error}</p> : null}
                  <button
                    type="button"
                    disabled={submittingId === assignment.id}
                    onClick={() => {
                      void submitAssignment(assignment);
                    }}
                    className="rounded-md bg-navy-800 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {submittingId === assignment.id
                      ? 'Submitting...'
                      : existing
                        ? 'Update submission'
                        : 'Submit Homework'}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {legacySubmissions.length > 0 ? (
        <details className="rounded-xl border border-warm-200 dark:border-navy-600 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-navy-800 hover:underline dark:text-navy-100">
            Previous submissions ({legacySubmissions.length})
          </summary>
          <div className="mt-3 space-y-3">
            {legacySubmissions.map((submission) => (
              <article
                key={submission.id}
                className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-navy-800 dark:text-white">{submission.title}</h4>
                    <p className="text-xs text-charcoal/65 dark:text-navy-300">
                      {submission.className} · {new Date(submission.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      submission.graded_at
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                  >
                    {submission.graded_at ? 'Graded' : 'Pending'}
                  </span>
                </div>
                {submission.notes ? (
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-charcoal/75 dark:text-navy-200">
                    {submission.notes}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {effectiveUrls(submission).map((url, idx) => (
                    <a
                      key={`${submission.id}-link-${idx}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-warm-300 px-3 py-1.5 text-xs text-charcoal dark:border-navy-600 dark:text-navy-100"
                    >
                      Open ({shortHost(url)})
                    </a>
                  ))}
                  {submission.file_path ? (
                    <OpenSignedUrlButton
                      endpoint={`/api/portal/homework-submissions/${submission.id}/signed-url`}
                      label="Open file"
                    />
                  ) : null}
                </div>
                {submission.grade ? (
                  <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-900/50 dark:bg-green-900/20">
                    <p className="font-semibold text-green-900 dark:text-green-200">
                      Grade: {submission.grade}
                    </p>
                    {submission.feedback ? (
                      <p className="mt-1 whitespace-pre-wrap break-words text-green-900 dark:text-green-200">
                        {submission.feedback}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
