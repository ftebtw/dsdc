"use client";

import { useMemo, useRef, useState } from 'react';
import OpenSignedUrlButton from '@/app/portal/_components/OpenSignedUrlButton';
import { useI18n } from '@/lib/i18n';
import { portalT } from '@/lib/portal/parent-i18n';

type ClassOption = { id: string; name: string };

type StudentRef = { studentId: string; studentName: string; studentEmail: string };

type Assignment = {
  id: string;
  class_id: string;
  className: string;
  posted_by: string;
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
  studentName: string;
  studentEmail: string;
  title: string;
  notes: string | null;
  file_path: string | null;
  file_name: string | null;
  external_url: string | null;
  external_urls: string[] | null;
  due_date: string | null;
  grade: string | null;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
  gradedByName?: string | null;
  created_at: string;
};

type Props = {
  classes: ClassOption[];
  initialAssignments: Assignment[];
  initialSubmissions: Submission[];
  enrolledByClass: Record<string, StudentRef[]>;
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

type GradeDraft = { grade: string; feedback: string };

export default function CoachHomeworkManager({
  classes,
  initialAssignments,
  initialSubmissions,
  enrolledByClass,
}: Props) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);

  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [filterClassId, setFilterClassId] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);

  // Create-assignment form state
  const [classId, setClassId] = useState(classes[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [externalUrls, setExternalUrls] = useState<string[]>(['']);
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Grading state per submission
  const [drafts, setDrafts] = useState<Record<string, GradeDraft>>(() =>
    Object.fromEntries(
      initialSubmissions.map((s) => [s.id, { grade: s.grade || '', feedback: s.feedback || '' }])
    )
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit-assignment state
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editUrls, setEditUrls] = useState<string[]>(['']);
  const [editDue, setEditDue] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  function beginEditAssignment(assignment: Assignment) {
    setEditingAssignmentId(assignment.id);
    setEditError(null);
    setEditTitle(assignment.title);
    setEditDescription(assignment.description ?? '');
    setEditUrls(assignment.external_urls.length > 0 ? [...assignment.external_urls] : ['']);
    setEditDue(assignment.due_date ?? '');
  }
  function cancelEditAssignment() {
    setEditingAssignmentId(null);
    setEditError(null);
  }
  function updateEditUrlAt(i: number, v: string) {
    setEditUrls((prev) => prev.map((u, idx) => (idx === i ? v : u)));
  }
  function addEditUrlRow() {
    setEditUrls((prev) => (prev.length >= 10 ? prev : [...prev, '']));
  }
  function removeEditUrlRow(i: number) {
    setEditUrls((prev) => (prev.length <= 1 ? [''] : prev.filter((_, idx) => idx !== i)));
  }

  async function saveAssignmentEdit(assignment: Assignment) {
    if (!editTitle.trim()) {
      setEditError('Title is required.');
      return;
    }
    setEditSaving(true);
    setEditError(null);

    const payload = {
      title: editTitle.trim(),
      description: editDescription.trim() ? editDescription.trim() : null,
      externalUrls: editUrls.map((u) => u.trim()).filter(Boolean),
      dueDate: editDue.trim() ? editDue.trim() : null,
    };

    const response = await fetch(`/api/portal/homework-assignments/${assignment.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string; assignment?: Omit<Assignment, 'className'> };
    setEditSaving(false);

    if (!response.ok || !data.assignment) {
      setEditError(data.error || 'Could not save changes.');
      return;
    }
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignment.id ? { ...a, ...data.assignment!, className: a.className } : a))
    );
    setEditingAssignmentId(null);
  }

  const filteredAssignments = useMemo(
    () => assignments.filter((a) => !filterClassId || a.class_id === filterClassId),
    [assignments, filterClassId]
  );

  // Legacy submissions: not tied to any assignment we know about.
  const legacySubmissions = useMemo(
    () =>
      submissions.filter(
        (s) => !s.assignment_id && (!filterClassId || s.class_id === filterClassId)
      ),
    [submissions, filterClassId]
  );

  function submissionsForAssignment(assignmentId: string): Submission[] {
    return submissions.filter((s) => s.assignment_id === assignmentId);
  }

  function rosterForAssignment(assignment: Assignment): Array<{
    student: StudentRef;
    submission: Submission | null;
  }> {
    const roster = enrolledByClass[assignment.class_id] ?? [];
    const subs = submissionsForAssignment(assignment.id);
    return roster.map((student) => ({
      student,
      submission: subs.find((s) => s.student_id === student.studentId) || null,
    }));
  }

  function updateUrlAt(i: number, v: string) {
    setExternalUrls((prev) => prev.map((u, idx) => (idx === i ? v : u)));
  }
  function addUrlRow() {
    setExternalUrls((prev) => (prev.length >= 10 ? prev : [...prev, '']));
  }
  function removeUrlRow(i: number) {
    setExternalUrls((prev) => (prev.length <= 1 ? [''] : prev.filter((_, idx) => idx !== i)));
  }

  function resetForm() {
    setTitle('');
    setDescription('');
    setExternalUrls(['']);
    setDueDate('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function createAssignment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!classId || !title.trim()) return;
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    const formData = new FormData();
    formData.append('classId', classId);
    formData.append('title', title.trim());
    if (description.trim()) formData.append('description', description.trim());
    for (const url of externalUrls.map((u) => u.trim()).filter(Boolean)) {
      formData.append('externalUrls', url);
    }
    if (dueDate.trim()) formData.append('dueDate', dueDate.trim());
    if (file) formData.append('file', file);

    const response = await fetch('/api/portal/homework-assignments', {
      method: 'POST',
      body: formData,
    });
    const data = (await response.json()) as {
      error?: string;
      assignment?: Omit<Assignment, 'className'>;
    };
    setCreating(false);

    if (!response.ok || !data.assignment) {
      setCreateError(data.error || 'Could not create assignment.');
      return;
    }
    const className = classes.find((c) => c.id === data.assignment!.class_id)?.name || data.assignment.class_id;
    setAssignments((prev) => [{ ...data.assignment!, className }, ...prev]);
    resetForm();
    setCreateSuccess('Homework posted.');
    setShowCreate(false);
  }

  async function deleteAssignment(assignmentId: string) {
    if (!window.confirm('Delete this homework assignment? Student submissions will remain visible under "legacy".')) {
      return;
    }
    const response = await fetch(`/api/portal/homework-assignments/${assignmentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error || 'Could not delete assignment.');
      return;
    }
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    // Submissions for that assignment become 'legacy' since assignment_id was nulled by FK on delete.
    setSubmissions((prev) =>
      prev.map((s) => (s.assignment_id === assignmentId ? { ...s, assignment_id: null } : s))
    );
  }

  function updateDraft(id: string, patch: Partial<GradeDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        grade: prev[id]?.grade || '',
        feedback: prev[id]?.feedback || '',
        ...patch,
      },
    }));
  }

  async function saveGrade(submissionId: string) {
    const draft = drafts[submissionId] || { grade: '', feedback: '' };
    if (!draft.grade.trim()) {
      setError(t('portal.coachHomework.gradeRequired', 'Grade is required.'));
      return;
    }
    setSavingId(submissionId);
    setError(null);
    const response = await fetch(`/api/portal/homework-submissions/${submissionId}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade: draft.grade.trim(), feedback: draft.feedback.trim() }),
    });
    const data = (await response.json()) as { error?: string; submission?: Submission };
    setSavingId(null);
    if (!response.ok || !data.submission) {
      setError(data.error || t('portal.coachHomework.saveError', 'Could not save grade.'));
      return;
    }
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              ...data.submission!,
              className: s.className,
              studentName: s.studentName,
              studentEmail: s.studentEmail,
              gradedByName: t('portal.coachHomework.you', 'You'),
            }
          : s
      )
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={filterClassId}
          onChange={(event) => setFilterClassId(event.target.value)}
          className="w-full max-w-xs rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setShowCreate((v) => !v);
            setCreateSuccess(null);
            setCreateError(null);
          }}
          className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700"
        >
          {showCreate ? 'Close form' : '+ New Homework'}
        </button>
      </div>

      {createSuccess ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
          {createSuccess}
        </p>
      ) : null}

      {showCreate ? (
        <form
          onSubmit={createAssignment}
          className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4 space-y-3"
        >
          <h3 className="font-semibold text-navy-800 dark:text-white">New Homework</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Class</span>
              <select
                required
                value={classId}
                onChange={(event) => setClassId(event.target.value)}
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Due date (optional)</span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              />
            </label>
          </div>
          <label className="block">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Title</span>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Week 3 Homework"
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Description (optional)</span>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              placeholder="Instructions, expectations, etc."
            />
          </label>
          <div className="space-y-2">
            <span className="block text-xs text-charcoal/70 dark:text-navy-300">Links (optional)</span>
            {externalUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(event) => updateUrlAt(i, event.target.value)}
                  placeholder="https://..."
                  className="flex-1 rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                />
                {externalUrls.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeUrlRow(i)}
                    className="rounded-md border border-warm-300 dark:border-navy-600 px-2 py-1.5 text-xs text-charcoal/70 dark:text-navy-300"
                    aria-label="Remove link"
                  >
                    ×
                  </button>
                ) : null}
              </div>
            ))}
            {externalUrls.length < 10 ? (
              <button
                type="button"
                onClick={addUrlRow}
                className="text-xs font-semibold text-navy-700 hover:text-navy-900 dark:text-gold-300 dark:hover:text-gold-200"
              >
                + Add another link
              </button>
            ) : null}
          </div>
          <label className="block">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Attach a file (optional)</span>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-gold-300 file:px-3 file:py-1"
            />
          </label>
          {createError ? <p className="text-sm text-red-700">{createError}</p> : null}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={creating || !classId || !title.trim()}
              className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {creating ? 'Posting...' : 'Post Homework'}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowCreate(false);
              }}
              className="rounded-lg border border-warm-300 dark:border-navy-600 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {filteredAssignments.length === 0 && legacySubmissions.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          No homework yet. Post one above.
        </p>
      ) : null}

      <div className="space-y-3">
        {filteredAssignments.map((assignment) => {
          const roster = rosterForAssignment(assignment);
          const submittedCount = roster.filter((entry) => entry.submission).length;
          const overdue = isOverdue(assignment.due_date);
          const expanded = expandedAssignmentId === assignment.id;
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
                <div className="flex flex-col items-end gap-1 text-xs">
                  <span className="rounded-full bg-warm-100 px-2 py-0.5 text-charcoal dark:bg-navy-800 dark:text-navy-200">
                    {submittedCount}/{roster.length} submitted
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => beginEditAssignment(assignment)}
                      className="text-xs font-semibold text-navy-700 hover:underline dark:text-navy-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAssignment(assignment.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </header>

              {editingAssignmentId === assignment.id ? (
                <div className="mt-3 space-y-2 rounded-lg border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900/60 p-3">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
                  />
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description / instructions (optional)"
                    className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
                  />
                  <div className="space-y-1.5">
                    <span className="block text-xs text-charcoal/70 dark:text-navy-300">Links</span>
                    {editUrls.map((u, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="url"
                          value={u}
                          onChange={(e) => updateEditUrlAt(i, e.target.value)}
                          placeholder="https://..."
                          className="flex-1 rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
                        />
                        {editUrls.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeEditUrlRow(i)}
                            className="rounded-md border border-warm-300 dark:border-navy-600 px-2 py-1.5 text-xs text-charcoal/70 hover:text-red-600 dark:text-navy-300"
                            aria-label="Remove link"
                          >
                            ×
                          </button>
                        ) : null}
                      </div>
                    ))}
                    {editUrls.length < 10 ? (
                      <button
                        type="button"
                        onClick={addEditUrlRow}
                        className="text-xs font-semibold text-navy-700 hover:text-navy-900 dark:text-gold-300"
                      >
                        + Add another link
                      </button>
                    ) : null}
                  </div>
                  <label className="block">
                    <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Due date (optional)</span>
                    <input
                      type="date"
                      value={editDue}
                      onChange={(e) => setEditDue(e.target.value)}
                      className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
                    />
                  </label>
                  {assignment.file_path ? (
                    <p className="text-xs text-charcoal/55 dark:text-navy-400">
                      Attached file stays as-is. To change it, delete and re-post the assignment.
                    </p>
                  ) : null}
                  {editError ? <p className="text-xs text-red-700">{editError}</p> : null}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => saveAssignmentEdit(assignment)}
                      disabled={editSaving}
                      className="rounded-md bg-navy-800 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {editSaving ? 'Saving...' : 'Save changes'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditAssignment}
                      disabled={editSaving}
                      className="rounded-md border border-warm-300 dark:border-navy-600 px-3 py-1.5 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}

              <button
                type="button"
                onClick={() => setExpandedAssignmentId(expanded ? null : assignment.id)}
                className="mt-3 text-sm font-semibold text-navy-800 hover:underline dark:text-navy-100"
              >
                {expanded ? 'Hide submissions' : 'View submissions'}
              </button>

              {expanded ? (
                <div className="mt-3 space-y-2">
                  {roster.length === 0 ? (
                    <p className="text-sm text-charcoal/70 dark:text-navy-300">
                      No students enrolled in this class yet.
                    </p>
                  ) : null}
                  {roster.map(({ student, submission }) => {
                    const draft = submission
                      ? drafts[submission.id] || { grade: submission.grade || '', feedback: submission.feedback || '' }
                      : null;
                    const lateLabel =
                      submission && assignment.due_date && submission.created_at.slice(0, 10) > assignment.due_date
                        ? 'Late'
                        : null;
                    return (
                      <div
                        key={`${assignment.id}-${student.studentId}`}
                        className="rounded-lg border border-warm-200 bg-warm-50 p-3 dark:border-navy-700 dark:bg-navy-900/40"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-navy-800 dark:text-white">{student.studentName}</p>
                            <p className="text-xs text-charcoal/65 dark:text-navy-300">{student.studentEmail}</p>
                          </div>
                          {submission ? (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                submission.graded_at
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                              }`}
                            >
                              {submission.graded_at ? 'Graded' : 'Pending grade'}
                              {lateLabel ? ` · ${lateLabel}` : ''}
                            </span>
                          ) : (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                overdue
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {overdue ? 'Not submitted (overdue)' : 'Not submitted'}
                            </span>
                          )}
                        </div>

                        {submission ? (
                          <>
                            <p className="mt-2 text-xs text-charcoal/55 dark:text-navy-400">
                              Submitted: {new Date(submission.created_at).toLocaleString()}
                            </p>
                            {submission.notes ? (
                              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-charcoal/80 dark:text-navy-200">
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
                                  className="rounded-md border border-warm-300 px-3 py-1.5 text-xs text-charcoal hover:bg-warm-50 dark:border-navy-600 dark:text-navy-100 dark:hover:bg-navy-800"
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

                            {draft ? (
                              <div className="mt-3 grid gap-2">
                                <label className="block">
                                  <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Grade</span>
                                  <input
                                    value={draft.grade}
                                    onChange={(event) => updateDraft(submission.id, { grade: event.target.value })}
                                    className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                                    placeholder="e.g. 8/10 or A-"
                                  />
                                </label>
                                <label className="block">
                                  <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Feedback</span>
                                  <textarea
                                    rows={2}
                                    value={draft.feedback}
                                    onChange={(event) => updateDraft(submission.id, { feedback: event.target.value })}
                                    className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                                    placeholder="Write feedback for the student..."
                                  />
                                </label>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    disabled={savingId === submission.id || !draft.grade.trim()}
                                    onClick={() => {
                                      void saveGrade(submission.id);
                                    }}
                                    className="rounded-md bg-navy-800 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                                  >
                                    {savingId === submission.id ? 'Saving...' : 'Save grade & feedback'}
                                  </button>
                                  {submission.graded_at ? (
                                    <p className="text-xs text-charcoal/60 dark:text-navy-400">
                                      Last updated: {new Date(submission.graded_at).toLocaleString()}
                                      {submission.gradedByName ? ` · ${submission.gradedByName}` : ''}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </article>
          );
        })}

        {legacySubmissions.length > 0 ? (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold text-navy-800 hover:underline dark:text-navy-100">
              Legacy submissions ({legacySubmissions.length}) — student-created without an assignment
            </summary>
            <div className="mt-3 space-y-3">
              {legacySubmissions.map((submission) => {
                const draft = drafts[submission.id] || { grade: submission.grade || '', feedback: submission.feedback || '' };
                return (
                  <article
                    key={submission.id}
                    className="rounded-xl border border-warm-200 bg-white p-4 dark:border-navy-600 dark:bg-navy-900"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-navy-800 dark:text-white">{submission.title}</h4>
                        <p className="text-xs text-charcoal/65 dark:text-navy-300">
                          {submission.className} · {submission.studentName} ({submission.studentEmail})
                        </p>
                        <p className="text-xs text-charcoal/55 dark:text-navy-400">
                          Submitted: {new Date(submission.created_at).toLocaleString()}
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
                    <div className="mt-3 grid gap-2">
                      <label className="block">
                        <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Grade</span>
                        <input
                          value={draft.grade}
                          onChange={(event) => updateDraft(submission.id, { grade: event.target.value })}
                          className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                          placeholder="e.g. 8/10 or A-"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Feedback</span>
                        <textarea
                          rows={2}
                          value={draft.feedback}
                          onChange={(event) => updateDraft(submission.id, { feedback: event.target.value })}
                          className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                        />
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={savingId === submission.id || !draft.grade.trim()}
                          onClick={() => {
                            void saveGrade(submission.id);
                          }}
                          className="rounded-md bg-navy-800 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {savingId === submission.id ? 'Saving...' : 'Save grade & feedback'}
                        </button>
                        {submission.graded_at ? (
                          <p className="text-xs text-charcoal/60 dark:text-navy-400">
                            Last updated: {new Date(submission.graded_at).toLocaleString()}
                            {submission.gradedByName ? ` · ${submission.gradedByName}` : ''}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </details>
        ) : null}
      </div>
    </div>
  );
}
