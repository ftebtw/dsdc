import SectionCard from '@/app/portal/_components/SectionCard';
import OpenSignedUrlButton from '@/app/portal/_components/OpenSignedUrlButton';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { formatUtcForUser } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function StudentReportCardsPage() {
  const session = await requireRole(['student']);
  const supabase = await getSupabaseServerClient();

  const { data: rowsData } = await supabase
    .from('report_cards')
    .select('*')
    .eq('student_id', session.userId)
    .eq('status', 'approved')
    .order('reviewed_at', { ascending: false });
  const rows = (rowsData ?? []) as any[];

  const [{ data: classesData }, { data: termsData }, coachMap] = await Promise.all([
    supabase.from('classes').select('id,name'),
    supabase.from('terms').select('id,name'),
    getProfileMap(supabase, [...new Set(rows.map((row) => row.written_by))]),
  ]);
  const classMap = Object.fromEntries(((classesData ?? []) as any[]).map((row) => [row.id, row.name]));
  const termMap = Object.fromEntries(((termsData ?? []) as any[]).map((row) => [row.id, row.name]));

  const groups = new Map<string, any[]>();
  for (const row of rows) {
    const key = row.term_id;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }

  return (
    <SectionCard title="Report Cards" description="Approved report cards for your enrolled classes.">
      <div className="space-y-4">
        {[...groups.entries()].map(([termId, termRows]) => (
          <article
            key={termId}
            className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
          >
            <h3 className="font-semibold text-navy-800 dark:text-white mb-2">{termMap[termId] || termId}</h3>
            <div className="space-y-2">
              {termRows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-lg border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-3 flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-medium text-navy-800 dark:text-white">{classMap[row.class_id] || row.class_id}</p>
                    <p className="text-xs text-charcoal/65 dark:text-navy-300">
                      Coach: {coachMap[row.written_by]?.display_name || coachMap[row.written_by]?.email || row.written_by}
                      {' - '}
                      Approved:{' '}
                      {formatUtcForUser(row.reviewed_at || row.created_at, session.profile.timezone)}
                    </p>
                  </div>
                  <OpenSignedUrlButton endpoint={`/api/portal/report-cards/${row.id}/signed-url`} label="Open PDF" />
                </div>
              ))}
            </div>
          </article>
        ))}
        {rows.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">No approved report cards yet.</p>
        ) : null}
      </div>
    </SectionCard>
  );
}

