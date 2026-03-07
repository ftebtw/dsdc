"use client";

import { useMemo, useState } from 'react';
import OpenSignedUrlButton from '@/app/portal/_components/OpenSignedUrlButton';
import { useI18n } from '@/lib/i18n';
import { portalT } from '@/lib/portal/parent-i18n';

type ClassOption = {
  id: string;
  name: string;
};

type HomeworkSubmission = {
  id: string;
  class_id: string;
  className: string;
  student_id: string;
  studentName: string;
  studentEmail: string;
  title: string;
  notes: string | null;
  file_path: string | null;
  file_name: string | null;
  external_url: string | null;
  grade: string | null;
  feedback: string | null;
  graded_at: string | null;
  gradedByName?: string | null;
  created_at: string;
};

type GradeDraft = {
  grade: string;
  feedback: string;
};

export default function CoachHomeworkManager({
  classes,
  initialSubmissions,
}: {
  classes: ClassOption[];
  initialSubmissions: HomeworkSubmission[];
}) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>(initialSubmissions);
  const [filterClassId, setFilterClassId] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('all');
  const [drafts, setDrafts] = useState<Record<string, GradeDraft>>(() =>
    Object.fromEntries(
      initialSubmissions.map((row) => [
        row.id,
        { grade: row.grade || '', feedback: row.feedback || '' },
      ])
    )
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return submissions.filter((row) => {
      if (filterClassId && row.class_id !== filterClassId) return false;
      if (filterStatus === 'pending' && row.graded_at) return false;
      if (filterStatus === 'graded' && !row.graded_at) return false;
      return true;
    });
  }, [submissions, filterClassId, filterStatus]);

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

  async function saveGrade(id: string) {
    const draft = drafts[id] || { grade: '', feedback: '' };
    if (!draft.grade.trim()) {
      setError(t('portal.coachHomework.gradeRequired', 'Grade is required.'));
      return;
    }

    setSavingId(id);
    setError(null);
    const response = await fetch(`/api/portal/homework-submissions/${id}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grade: draft.grade.trim(),
        feedback: draft.feedback.trim(),
      }),
    });
    const data = (await response.json()) as {
      error?: string;
      submission?: Omit<HomeworkSubmission, 'className' | 'studentName' | 'studentEmail' | 'gradedByName'>;
    };
    setSavingId(null);

    if (!response.ok || !data.submission) {
      setError(data.error || t('portal.coachHomework.saveError', 'Could not save grade.'));
      return;
    }

    setSubmissions((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              ...data.submission!,
              className: row.className,
              studentName: row.studentName,
              studentEmail: row.studentEmail,
              gradedByName: t('portal.coachHomework.you', 'You'),
            }
          : row
      )
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <select
          value={filterClassId}
          onChange={(event) => setFilterClassId(event.target.value)}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">{t('portal.coachHomework.allClasses', 'All classes')}</option>
          {classes.map((classRow) => (
            <option key={classRow.id} value={classRow.id}>
              {classRow.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value as 'all' | 'pending' | 'graded')}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="all">{t('portal.coachHomework.allStatuses', 'All statuses')}</option>
          <option value="pending">{t('portal.coachHomework.pendingOnly', 'Pending only')}</option>
          <option value="graded">{t('portal.coachHomework.gradedOnly', 'Graded only')}</option>
        </select>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {filtered.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {t('portal.coachHomework.empty', 'No homework submissions found.')}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => {
            const draft = drafts[row.id] || { grade: row.grade || '', feedback: row.feedback || '' };
            return (
              <article
                key={row.id}
                className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-navy-800 dark:text-white">{row.title}</h3>
                    <p className="text-xs text-charcoal/65 dark:text-navy-300">
                      {row.className} - {row.studentName} ({row.studentEmail})
                    </p>
                    <p className="text-xs text-charcoal/55 dark:text-navy-400">
                      {t('portal.coachHomework.submittedAt', 'Submitted')}: {new Date(row.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      row.graded_at
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                  >
                    {row.graded_at
                      ? t('portal.coachHomework.statusGraded', 'Graded')
                      : t('portal.coachHomework.statusPending', 'Pending')}
                  </span>
                </div>

                {row.notes ? (
                  <p className="mt-2 text-sm text-charcoal/75 dark:text-navy-200 whitespace-pre-wrap break-words">
                    {row.notes}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {row.external_url ? (
                    <a
                      href={row.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                    >
                      {t('portal.coachHomework.openSubmission', 'Open Submission')}
                    </a>
                  ) : null}
                  {row.file_path ? (
                    <OpenSignedUrlButton
                      endpoint={`/api/portal/homework-submissions/${row.id}/signed-url`}
                      label={t('portal.coachHomework.openFile', 'Open File')}
                    />
                  ) : null}
                </div>

                <div className="mt-3 grid gap-2">
                  <label className="block">
                    <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
                      {t('portal.coachHomework.grade', 'Grade')}
                    </span>
                    <input
                      value={draft.grade}
                      onChange={(event) => updateDraft(row.id, { grade: event.target.value })}
                      className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                      placeholder={t('portal.coachHomework.gradePlaceholder', 'e.g. 8/10 or A-')}
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
                      {t('portal.coachHomework.feedback', 'Feedback')}
                    </span>
                    <textarea
                      rows={3}
                      value={draft.feedback}
                      onChange={(event) => updateDraft(row.id, { feedback: event.target.value })}
                      className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                      placeholder={t('portal.coachHomework.feedbackPlaceholder', 'Write feedback for the student...')}
                    />
                  </label>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      void saveGrade(row.id);
                    }}
                    disabled={savingId === row.id || !draft.grade.trim()}
                    className="px-4 py-2 rounded-md bg-navy-800 text-white text-sm font-semibold disabled:opacity-60"
                  >
                    {savingId === row.id
                      ? t('portal.common.saving', 'Saving...')
                      : t('portal.coachHomework.saveFeedback', 'Save Grade & Feedback')}
                  </button>
                  {row.graded_at ? (
                    <p className="text-xs text-charcoal/60 dark:text-navy-400">
                      {t('portal.coachHomework.lastUpdated', 'Last updated')}: {new Date(row.graded_at).toLocaleString()}
                      {row.gradedByName ? ` - ${row.gradedByName}` : ''}
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
