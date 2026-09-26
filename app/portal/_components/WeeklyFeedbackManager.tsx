'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export type WeeklyFeedbackClassOption = { id: string; name: string };

type StudentRef = { studentId: string; studentName: string; studentEmail: string };

export type WeeklyFeedbackEntry = {
  id: string;
  classId: string;
  sessionDate: string;
  generalFeedback: string;
  individual: Array<{ studentId: string; feedback: string }>;
  updatedAt: string;
  status: 'pending_admin' | 'approved' | 'rejected';
  rejectionNotes: string | null;
  reviewedAt: string | null;
};

const STATUS_META: Record<WeeklyFeedbackEntry['status'], { label: string; classes: string }> = {
  pending_admin: {
    label: 'Pending admin review',
    classes:
      'bg-gold-100 text-navy-900 dark:bg-gold-500/25 dark:text-gold-100',
  },
  approved: {
    label: 'Approved · Visible to students',
    classes:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  },
  rejected: {
    label: 'Rejected — please edit and resubmit',
    classes:
      'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  },
};

function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatShortDate(iso: string): string {
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

export default function WeeklyFeedbackManager({
  classes,
  rosterByClass,
  initialEntries,
}: {
  classes: WeeklyFeedbackClassOption[];
  rosterByClass: Record<string, StudentRef[]>;
  initialEntries: WeeklyFeedbackEntry[];
}) {
  const router = useRouter();
  const [classId, setClassId] = useState<string>(classes[0]?.id ?? '');
  const [sessionDate, setSessionDate] = useState<string>(todayIso());
  const [general, setGeneral] = useState('');
  const [individualDrafts, setIndividualDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const roster = useMemo(() => rosterByClass[classId] ?? [], [rosterByClass, classId]);

  // Whenever the coach picks a (class, date) we already have feedback for,
  // hydrate the form with the existing values so it acts as edit-in-place.
  const existingForCurrent = useMemo(
    () => initialEntries.find((e) => e.classId === classId && e.sessionDate === sessionDate),
    [initialEntries, classId, sessionDate]
  );

  // Only rebind when the (class, date) actually changes — otherwise we'd
  // stomp the coach's in-progress edits on every render.
  const hydrationKey = `${classId}:${sessionDate}`;
  const [lastHydrated, setLastHydrated] = useState<string | null>(null);
  if (lastHydrated !== hydrationKey) {
    setLastHydrated(hydrationKey);
    if (existingForCurrent) {
      setGeneral(existingForCurrent.generalFeedback);
      const draftMap: Record<string, string> = {};
      for (const row of existingForCurrent.individual) {
        draftMap[row.studentId] = row.feedback;
      }
      setIndividualDrafts(draftMap);
    } else {
      setGeneral('');
      setIndividualDrafts({});
    }
    setFlash(null);
    setError(null);
  }

  const filledIndividualCount = useMemo(() => {
    let count = 0;
    for (const student of roster) {
      if ((individualDrafts[student.studentId] || '').trim()) count += 1;
    }
    return count;
  }, [roster, individualDrafts]);

  async function submit() {
    setError(null);
    setFlash(null);
    if (!classId || !sessionDate) {
      setError('Pick a class and a session date.');
      return;
    }
    const trimmedGeneral = general.trim();
    const individualPayload = roster
      .map((student) => ({
        studentId: student.studentId,
        feedback: (individualDrafts[student.studentId] || '').trim(),
      }))
      .filter((row) => row.feedback.length > 0);
    if (!trimmedGeneral && individualPayload.length === 0) {
      setError('Add general feedback, at least one individual entry, or both before submitting.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/portal/class-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          sessionDate,
          generalFeedback: trimmedGeneral,
          individual: individualPayload,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Could not save the feedback.');
      }
      setFlash('Feedback posted. Students and parents can now see it.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the feedback.');
    } finally {
      setSaving(false);
    }
  }

  if (classes.length === 0) {
    return (
      <p className="text-sm text-charcoal/70 dark:text-navy-300">
        You aren&rsquo;t on the team for any active classes right now. Once you&rsquo;re assigned to a
        class you can post weekly feedback here.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-warm-200 dark:border-navy-600/70 bg-white dark:bg-navy-900 p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="block text-xs font-semibold text-charcoal/70 dark:text-navy-200 mb-1">
              Class
            </span>
            <select
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
              className="w-full rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-xs font-semibold text-charcoal/70 dark:text-navy-200 mb-1">
              Session date
            </span>
            <input
              type="date"
              value={sessionDate}
              onChange={(event) => setSessionDate(event.target.value)}
              className="w-full rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
            />
          </label>
        </div>
        {existingForCurrent ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  STATUS_META[existingForCurrent.status].classes
                }`}
              >
                {STATUS_META[existingForCurrent.status].label}
              </span>
              <span className="text-xs text-charcoal/60 dark:text-navy-300">
                Last updated {new Date(existingForCurrent.updatedAt).toLocaleString()}
              </span>
            </div>
            {existingForCurrent.status === 'rejected' && existingForCurrent.rejectionNotes ? (
              <div className="rounded-md border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-900 dark:text-red-100">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Admin notes
                </p>
                <p className="mt-1 whitespace-pre-wrap">{existingForCurrent.rejectionNotes}</p>
              </div>
            ) : null}
            <p className="text-xs text-charcoal/60 dark:text-navy-300">
              Editing existing feedback for {formatShortDate(existingForCurrent.sessionDate)}.
              Submitting again sends it back to admin for review.
            </p>
          </div>
        ) : (
          <p className="text-xs text-charcoal/60 dark:text-navy-300">
            New feedback for {formatShortDate(sessionDate)}. Fill general or per-student (or both)
            and submit to admin for review.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-warm-200 dark:border-navy-600/70 bg-white dark:bg-navy-900 p-4 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-navy-800 dark:text-white">General feedback</h3>
          <p className="text-xs text-charcoal/55 dark:text-navy-300">
            Visible to every student + parent in the class.
          </p>
        </div>
        <textarea
          rows={5}
          value={general}
          onChange={(event) => setGeneral(event.target.value)}
          maxLength={8000}
          placeholder="e.g. Great engagement today on the sports betting motion. Homework is to write a rebuttal for both sides by next class."
          className="w-full rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-xl border border-warm-200 dark:border-navy-600/70 bg-white dark:bg-navy-900 p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-navy-800 dark:text-white">
            Individual feedback
          </h3>
          <p className="text-xs text-charcoal/55 dark:text-navy-300">
            {roster.length} student{roster.length === 1 ? '' : 's'} on roster · {filledIndividualCount}{' '}
            filled. Leave blank to skip a student (e.g. absent).
          </p>
        </div>
        {roster.length === 0 ? (
          <p className="text-xs text-charcoal/60 dark:text-navy-300">
            No active students enrolled in this class yet.
          </p>
        ) : (
          <div className="space-y-3">
            {roster.map((student) => {
              const value = individualDrafts[student.studentId] ?? '';
              return (
                <div
                  key={student.studentId}
                  className="rounded-lg border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-900/60 p-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold text-navy-800 dark:text-white">
                      {student.studentName}
                    </p>
                    {student.studentEmail ? (
                      <p className="text-xs text-charcoal/55 dark:text-navy-400">
                        {student.studentEmail}
                      </p>
                    ) : null}
                  </div>
                  <textarea
                    rows={3}
                    value={value}
                    onChange={(event) =>
                      setIndividualDrafts((prev) => ({
                        ...prev,
                        [student.studentId]: event.target.value,
                      }))
                    }
                    maxLength={8000}
                    placeholder="Personal notes for this student (leave blank to skip)"
                    className="mt-2 w-full rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error ? <p className="text-sm text-red-700 dark:text-red-300">{error}</p> : null}
      {flash ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">{flash}</p>
      ) : null}

      <div>
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="px-4 py-2 rounded-md bg-gold-300 text-navy-900 font-semibold disabled:opacity-60"
        >
          {saving
            ? 'Submitting…'
            : existingForCurrent
              ? existingForCurrent.status === 'rejected'
                ? 'Resubmit to admin'
                : 'Update and resubmit'
              : 'Submit to admin'}
        </button>
      </div>
    </div>
  );
}
