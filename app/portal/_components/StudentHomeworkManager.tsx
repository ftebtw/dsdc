"use client";

import { useMemo, useRef, useState } from 'react';
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

export default function StudentHomeworkManager({
  classes,
  initialSubmissions,
}: {
  classes: ClassOption[];
  initialSubmissions: HomeworkSubmission[];
}) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);

  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>(initialSubmissions);
  const [classId, setClassId] = useState(classes[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedSubmissions = useMemo(
    () => [...submissions].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [submissions]
  );

  async function submitHomework(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!classId || !title.trim()) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('classId', classId);
    formData.append('title', title.trim());
    if (notes.trim()) formData.append('notes', notes.trim());
    if (externalUrl.trim()) formData.append('externalUrl', externalUrl.trim());
    if (file) formData.append('file', file);

    const response = await fetch('/api/portal/homework-submissions', {
      method: 'POST',
      body: formData,
    });
    const data = (await response.json()) as {
      error?: string;
      className?: string;
      submission?: Omit<HomeworkSubmission, 'className'>;
    };
    setLoading(false);

    if (!response.ok || !data.submission) {
      setError(data.error || t('portal.studentHomework.submitError', 'Could not submit homework.'));
      return;
    }

    const className =
      data.className || classes.find((classRow) => classRow.id === data.submission!.class_id)?.name || data.submission.class_id;
    setSubmissions((prev) => [{ ...data.submission!, className }, ...prev]);
    setTitle('');
    setNotes('');
    setExternalUrl('');
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={submitHomework}
        className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4 space-y-3"
      >
        <h3 className="font-semibold text-navy-800 dark:text-white">
          {t('portal.studentHomework.submitTitle', 'Submit Homework')}
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              {t('portal.studentHomework.class', 'Class')}
            </span>
            <select
              required
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
            >
              {classes.map((classRow) => (
                <option key={classRow.id} value={classRow.id}>
                  {classRow.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              {t('portal.studentHomework.assignmentTitle', 'Assignment title')}
            </span>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              placeholder={t('portal.studentHomework.assignmentPlaceholder', 'Week 3 Homework')}
            />
          </label>
        </div>
        <textarea
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          placeholder={t('portal.studentHomework.notesOptional', 'Notes for your coach (optional)')}
        />
        <input
          value={externalUrl}
          onChange={(event) => setExternalUrl(event.target.value)}
          className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          placeholder={t('portal.studentHomework.externalUrl', 'External URL (optional)')}
        />
        <input
          ref={fileInputRef}
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-gold-300 file:px-3 file:py-1"
        />
        <p className="text-xs text-charcoal/60 dark:text-navy-400">
          {t('portal.studentHomework.fileOrUrlHint', 'Attach a file or provide an external URL.')}
        </p>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || !classId || !title.trim()}
          className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-60"
        >
          {loading
            ? t('portal.studentHomework.submitting', 'Submitting...')
            : t('portal.studentHomework.submitButton', 'Submit Homework')}
        </button>
      </form>

      <div className="space-y-3">
        <h3 className="font-semibold text-navy-800 dark:text-white">
          {t('portal.studentHomework.history', 'Submission History')}
        </h3>
        {sortedSubmissions.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {t('portal.studentHomework.empty', 'No homework submissions yet.')}
          </p>
        ) : (
          sortedSubmissions.map((submission) => {
            const isGraded = Boolean(submission.graded_at);
            return (
              <article
                key={submission.id}
                className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-navy-800 dark:text-white">{submission.title}</h4>
                    <p className="text-xs text-charcoal/65 dark:text-navy-300">
                      {submission.className} -{' '}
                      {new Date(submission.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isGraded
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                  >
                    {isGraded
                      ? t('portal.studentHomework.statusGraded', 'Graded')
                      : t('portal.studentHomework.statusPending', 'Pending review')}
                  </span>
                </div>

                {submission.notes ? (
                  <p className="mt-2 text-sm text-charcoal/75 dark:text-navy-200 whitespace-pre-wrap break-words">
                    {submission.notes}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {submission.external_url ? (
                    <a
                      href={submission.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                    >
                      {t('portal.studentHomework.openSubmission', 'Open Submission')}
                    </a>
                  ) : null}
                  {submission.file_path ? (
                    <OpenSignedUrlButton
                      endpoint={`/api/portal/homework-submissions/${submission.id}/signed-url`}
                      label={t('portal.studentHomework.openFile', 'Open File')}
                    />
                  ) : null}
                </div>

                {isGraded ? (
                  <div className="mt-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-3">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                      {t('portal.studentHomework.gradeLabel', 'Grade')}: {submission.grade || '-'}
                    </p>
                    {submission.feedback ? (
                      <p className="mt-1 text-sm text-charcoal/80 dark:text-navy-200 whitespace-pre-wrap break-words">
                        {submission.feedback}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-charcoal/60 dark:text-navy-400">
                      {t('portal.studentHomework.gradedAt', 'Reviewed')}: {new Date(submission.graded_at!).toLocaleString()}
                      {submission.gradedByName ? ` - ${submission.gradedByName}` : ''}
                    </p>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
