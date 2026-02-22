"use client";

import { useMemo, useState } from 'react';
import OpenSignedUrlButton from '@/app/portal/_components/OpenSignedUrlButton';
import ReportCardStatusBadge from '@/app/portal/_components/ReportCardStatusBadge';
import ReportCardUpload from '@/app/portal/_components/ReportCardUpload';
import type { Database } from '@/lib/supabase/database.types';

type ReportCardRow = Database['public']['Tables']['report_cards']['Row'];

type StudentReportCardRow = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  reportCard: ReportCardRow | null;
  lastActivityLabel: string | null;
};

type ClassGroup = {
  classId: string;
  className: string;
  classType: string;
  students: StudentReportCardRow[];
};

type Props = {
  termId: string;
  groups: ClassGroup[];
};

export default function CoachReportCardsManager({ termId, groups }: Props) {
  const [state, setState] = useState<ClassGroup[]>(groups);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const byClass = state.map((group) => {
      const total = group.students.length;
      const submitted = group.students.filter((student) => {
        const status = student.reportCard?.status;
        return status === 'submitted' || status === 'approved';
      }).length;
      return { classId: group.classId, total, submitted };
    });
    return Object.fromEntries(byClass.map((row) => [row.classId, row])) as Record<
      string,
      { total: number; submitted: number }
    >;
  }, [state]);

  function updateReportCard(studentId: string, classId: string, row: ReportCardRow) {
    setState((prev) =>
      prev.map((group) =>
        group.classId !== classId
          ? group
          : {
              ...group,
              students: group.students.map((student) =>
                student.studentId === studentId
                  ? {
                      ...student,
                      reportCard: row,
                      lastActivityLabel: new Date(
                        row.status === 'approved' || row.status === 'rejected'
                          ? row.reviewed_at || row.created_at
                          : row.created_at
                      ).toLocaleString(),
                    }
                  : student
              ),
            }
      )
    );
  }

  async function submitForReview(reportCardId: string, studentId: string, classId: string) {
    setSubmittingId(reportCardId);
    setError(null);
    const response = await fetch(`/api/portal/report-cards/${reportCardId}/submit`, {
      method: 'POST',
    });
    const data = (await response.json()) as { error?: string; reportCard?: ReportCardRow };
    setSubmittingId(null);
    if (!response.ok || !data.reportCard) {
      setError(data.error || 'Could not submit report card.');
      return;
    }
    updateReportCard(studentId, classId, data.reportCard);
  }

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {state.map((group) => (
        <article
          key={group.classId}
          className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-navy-800 dark:text-white">{group.className}</h3>
              <p className="text-xs text-charcoal/65 dark:text-navy-300">{group.classType}</p>
            </div>
            <p className="text-sm text-charcoal/70 dark:text-navy-200">
              {totals[group.classId]?.submitted ?? 0} of {totals[group.classId]?.total ?? 0} submitted
            </p>
          </div>

          <div className="space-y-3">
            {group.students.map((student) => {
              const card = student.reportCard;
              const canEdit = !card || card.status === 'draft' || card.status === 'rejected';
              const canSubmit = Boolean(card && (card.status === 'draft' || card.status === 'rejected'));
              return (
                <div
                  key={student.studentId}
                  className="rounded-lg border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-3"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-navy-800 dark:text-white">{student.studentName}</p>
                      <p className="text-xs text-charcoal/65 dark:text-navy-300">{student.studentEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {card ? <ReportCardStatusBadge status={card.status} /> : <span className="text-xs">Not started</span>}
                      {student.lastActivityLabel ? (
                        <span className="text-xs text-charcoal/65 dark:text-navy-300">
                          Last activity: {student.lastActivityLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {card?.status === 'rejected' && card.reviewer_notes ? (
                    <p className="mb-2 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
                      Rejected notes: {card.reviewer_notes}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-2">
                    <ReportCardUpload
                      termId={termId}
                      classId={group.classId}
                      studentId={student.studentId}
                      disabled={!canEdit}
                      buttonLabel={card ? 'Replace PDF' : 'Upload PDF'}
                      onUploaded={(row) => updateReportCard(student.studentId, group.classId, row)}
                    />
                    {card ? (
                      <OpenSignedUrlButton
                        endpoint={`/api/portal/report-cards/${card.id}/signed-url`}
                        label="View"
                      />
                    ) : null}
                    <button
                      type="button"
                      disabled={!canSubmit || submittingId === card?.id}
                      onClick={() => card && submitForReview(card.id, student.studentId, group.classId)}
                      className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-xs font-semibold disabled:opacity-60"
                    >
                      {submittingId === card?.id ? 'Submitting...' : 'Submit for Review'}
                    </button>
                  </div>
                </div>
              );
            })}
            {group.students.length === 0 ? (
              <p className="text-sm text-charcoal/70 dark:text-navy-300">No active students enrolled.</p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
