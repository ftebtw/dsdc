'use client';

import { useMemo, useState } from 'react';

export type HistoryFeedbackRow = {
  id: string;
  classId: string;
  className: string;
  coachId: string;
  coachName: string;
  sessionDate: string;
  generalFeedback: string;
  individual: Array<{ studentId: string; studentName: string; feedback: string }>;
  status: 'pending_admin' | 'approved' | 'rejected';
  reviewedAt: string | null;
  rejectionNotes: string | null;
  updatedAt: string;
};

function formatDate(iso: string): string {
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

const STATUS_META: Record<HistoryFeedbackRow['status'], { label: string; classes: string }> = {
  pending_admin: {
    label: 'Pending',
    classes: 'bg-gold-100 text-navy-900 dark:bg-gold-500/25 dark:text-gold-100',
  },
  approved: {
    label: 'Approved',
    classes:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  },
};

export default function AdminWeeklyFeedbackHistory({
  entries,
  students,
  classes,
}: {
  entries: HistoryFeedbackRow[];
  students: Array<{ id: string; name: string }>;
  classes: Array<{ id: string; name: string }>;
}) {
  const [classFilter, setClassFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | HistoryFeedbackRow['status']>('all');

  const filtered = useMemo(() => {
    return entries
      .filter((entry) => !classFilter || entry.classId === classFilter)
      .filter((entry) => statusFilter === 'all' || entry.status === statusFilter)
      .filter((entry) => {
        if (!studentFilter) return true;
        return entry.individual.some((row) => row.studentId === studentFilter);
      })
      .map((entry) => {
        // When filtering by student, only show that student's own individual
        // entry (plus the general block) to keep the view scoped.
        if (!studentFilter) return entry;
        return {
          ...entry,
          individual: entry.individual.filter((row) => row.studentId === studentFilter),
        };
      });
  }, [entries, classFilter, statusFilter, studentFilter]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="text-sm">
          <span className="block text-xs font-semibold text-charcoal/70 dark:text-navy-200 mb-1">
            Class
          </span>
          <select
            value={classFilter}
            onChange={(event) => setClassFilter(event.target.value)}
            className="w-full rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
          >
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs font-semibold text-charcoal/70 dark:text-navy-200 mb-1">
            Student
          </span>
          <select
            value={studentFilter}
            onChange={(event) => setStudentFilter(event.target.value)}
            className="w-full rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
          >
            <option value="">All students</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs font-semibold text-charcoal/70 dark:text-navy-200 mb-1">
            Status
          </span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as typeof statusFilter)
            }
            className="w-full rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
          >
            <option value="all">Any status</option>
            <option value="approved">Approved</option>
            <option value="pending_admin">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setClassFilter('');
              setStudentFilter('');
              setStatusFilter('all');
            }}
            className="w-full sm:w-auto px-3 py-2 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
          >
            Clear
          </button>
        </div>
      </div>
      <p className="text-xs text-charcoal/60 dark:text-navy-300">
        {filtered.length} entr{filtered.length === 1 ? 'y' : 'ies'}. Newest first.
      </p>

      {filtered.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          No weekly feedback matches these filters.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <article
              key={entry.id}
              className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4"
            >
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-navy-800 dark:text-white">
                    {entry.className}
                  </h3>
                  <p className="text-xs text-charcoal/60 dark:text-navy-300">
                    Coach: {entry.coachName} · Session: {formatDate(entry.sessionDate)}
                    {entry.reviewedAt ? ` · Reviewed ${new Date(entry.reviewedAt).toLocaleString()}` : ''}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_META[entry.status].classes}`}
                >
                  {STATUS_META[entry.status].label}
                </span>
              </header>
              {entry.rejectionNotes ? (
                <div className="mt-3 rounded-md border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-900 dark:text-red-100">
                  <p className="text-xs font-semibold uppercase tracking-wide">Rejection notes</p>
                  <p className="mt-1 whitespace-pre-wrap">{entry.rejectionNotes}</p>
                </div>
              ) : null}
              {entry.generalFeedback ? (
                <div className="mt-3 rounded-lg border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-900/60 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide font-semibold text-charcoal/60 dark:text-navy-300">
                    General
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-charcoal/85 dark:text-navy-100">
                    {entry.generalFeedback}
                  </p>
                </div>
              ) : null}
              {entry.individual.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {entry.individual.map((row) => (
                    <div
                      key={row.studentId}
                      className="rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-900/20 px-3 py-2"
                    >
                      <p className="text-[11px] uppercase tracking-wide font-semibold text-emerald-800 dark:text-emerald-200">
                        {row.studentName}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-charcoal/85 dark:text-navy-100">
                        {row.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
