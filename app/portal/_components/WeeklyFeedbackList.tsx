export type WeeklyFeedbackListRow = {
  id: string;
  classId: string;
  className: string;
  sessionDate: string;
  generalFeedback: string | null;
  individual: Array<{ studentId: string; studentName: string; feedback: string }>;
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

// Server-render friendly (no state). Renders one card per weekly feedback
// entry, with the general block on top and any individual entries below
// (RLS scopes what's returned, so the caller doesn't need to filter).
export default function WeeklyFeedbackList({
  entries,
  emptyMessage,
}: {
  entries: WeeklyFeedbackListRow[];
  emptyMessage: string;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-charcoal/70 dark:text-navy-300">{emptyMessage}</p>
    );
  }
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4"
        >
          <header className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h3 className="font-semibold text-navy-800 dark:text-white">{entry.className}</h3>
              <p className="text-xs text-charcoal/60 dark:text-navy-300">
                Session — {formatDate(entry.sessionDate)}
              </p>
            </div>
          </header>
          {entry.generalFeedback ? (
            <div className="mt-3 rounded-lg border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-900/60 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide font-semibold text-charcoal/60 dark:text-navy-300">
                Class feedback
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
                    Personal feedback · {row.studentName}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-charcoal/85 dark:text-navy-100">
                    {row.feedback}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
          {!entry.generalFeedback && entry.individual.length === 0 ? (
            <p className="mt-2 text-xs text-charcoal/60 dark:text-navy-300">
              No feedback in this entry visible to you.
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
