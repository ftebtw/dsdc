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
  external_urls: string[] | null;
  due_date: string | null;
  grade: string | null;
  feedback: string | null;
  graded_at: string | null;
  gradedByName?: string | null;
  created_at: string;
};

function effectiveUrls(submission: HomeworkSubmission): string[] {
  const fromArray = (submission.external_urls ?? []).filter((url): url is string => Boolean(url && url.trim()));
  if (fromArray.length > 0) return fromArray;
  return submission.external_url ? [submission.external_url] : [];
}

function shortHost(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
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
  const [externalUrls, setExternalUrls] = useState<string[]>(['']);
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateUrlAt(index: number, value: string) {
    setExternalUrls((prev) => prev.map((url, i) => (i === index ? value : url)));
  }
  function addUrlRow() {
    setExternalUrls((prev) => (prev.length >= 10 ? prev : [...prev, '']));
  }
  function removeUrlRow(index: number) {
    setExternalUrls((prev) => (prev.length <= 1 ? [''] : prev.filter((_, i) => i !== index)));
  }

  const sortedSubmissions = useMemo(
    () => [...submissions].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [submissions]
  );

  async function submitHomework(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!classId || !title.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    const cleanedUrls = externalUrls.map((url) => url.trim()).filter((url) => url.length > 0);
    const formData = new FormData();
    formData.append('classId', classId);
    formData.append('title', title.trim());
    if (notes.trim()) formData.append('notes', notes.trim());
    for (const url of cleanedUrls) {
      formData.append('externalUrls', url);
    }
    if (dueDate.trim()) formData.append('dueDate', dueDate.trim());
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
    setExternalUrls(['']);
    setDueDate('');
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSuccess(t('portal.studentHomework.submitSuccess', 'Homework submitted successfully! Your coach will review it.'));
  }

  return (
    <div className="space-y-6">
      {classes.length > 0 ? (
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

          <div className="space-y-2">
            <span className="block text-xs text-charcoal/70 dark:text-navy-300">
              {t('portal.studentHomework.links', 'Links (optional)')}
            </span>
            {externalUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(event) => updateUrlAt(index, event.target.value)}
                  className="flex-1 rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
                  placeholder={t('portal.studentHomework.linkPlaceholder', 'https://...')}
                />
                {externalUrls.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeUrlRow(index)}
                    className="rounded-md border border-warm-300 dark:border-navy-600 px-2 py-1.5 text-xs text-charcoal/70 dark:text-navy-300 hover:text-red-600 dark:hover:text-red-400"
                    aria-label={t('portal.studentHomework.removeLink', 'Remove link')}
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
                + {t('portal.studentHomework.addLink', 'Add another link')}
              </button>
            ) : null}
          </div>

          <label className="block">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              {t('portal.studentHomework.dueDate', 'Due date (optional)')}
            </span>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
            />
          </label>

          <input
            ref={fileInputRef}
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-gold-300 file:px-3 file:py-1"
          />
          <p className="text-xs text-charcoal/60 dark:text-navy-400">
            {t('portal.studentHomework.fileOrUrlHint', 'Attach a file or provide at least one link.')}
          </p>
          {success ? <p className="text-sm text-green-700 dark:text-green-400">{success}</p> : null}
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
      ) : (
        <div className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4">
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {t(
              'portal.studentHomework.noActiveSubmissionClasses',
              'No active classes available for new homework submissions. You can still review your previous submissions below.'
            )}
          </p>
        </div>
      )}

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

                {submission.due_date ? (
                  <p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    {t('portal.studentHomework.dueLabel', 'Due')}: {formatDueDate(submission.due_date)}
                  </p>
                ) : null}

                {submission.notes ? (
                  <p className="mt-2 text-sm text-charcoal/75 dark:text-navy-200 whitespace-pre-wrap break-words">
                    {submission.notes}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {effectiveUrls(submission).map((url, idx) => (
                    <a
                      key={`${submission.id}-${idx}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                      title={url}
                    >
                      {t('portal.studentHomework.openLink', 'Open Link')}
                      <span className="ml-1 text-charcoal/55 dark:text-navy-400">({shortHost(url)})</span>
                    </a>
                  ))}
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
