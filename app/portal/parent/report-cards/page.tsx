export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import EnrollmentRequiredBanner from '@/app/portal/_components/EnrollmentRequiredBanner';
import SectionCard from '@/app/portal/_components/SectionCard';
import OpenSignedUrlButton from '@/app/portal/_components/OpenSignedUrlButton';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { parentHasEnrolledStudent } from '@/lib/portal/enrollment-status';
import { getParentSelection } from '@/lib/portal/parent';
import { parentT } from '@/lib/portal/parent-i18n';
import { formatUtcForUser } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function ParentReportCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const session = await requireRole(['parent']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const locale = session.profile.locale === 'zh' ? 'zh' : 'en';

  const { linkedStudents, selectedStudentId, selectedStudent } = await getParentSelection(
    supabase,
    session.userId,
    params.student
  );

  if (!linkedStudents.length) {
    return (
      <SectionCard title={parentT(locale, 'portal.parent.reportCards.title', 'Report Cards')}>
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {parentT(locale, 'portal.parent.common.noLinkedStudents', 'No students linked to your account yet.')}
        </p>
      </SectionCard>
    );
  }

  if (!selectedStudentId || params.student !== selectedStudentId) {
    redirect(`/portal/parent/report-cards?student=${selectedStudentId}`);
  }
  const enrollmentState = await parentHasEnrolledStudent(supabase as any, session.userId);
  if (!enrollmentState.hasEnrolled) {
    return (
      <SectionCard
        title={parentT(locale, 'portal.parent.reportCards.title', 'Report Cards')}
        description={`${parentT(locale, 'portal.parent.selectedStudent', 'Selected student')}: ${
          selectedStudent?.display_name || selectedStudent?.email || selectedStudentId
        }`}
      >
        <EnrollmentRequiredBanner role="parent" locale={locale} />
      </SectionCard>
    );
  }

  const { data: rowsData } = await supabase
    .from('report_cards')
    .select('*')
    .eq('student_id', selectedStudentId)
    .eq('status', 'approved')
    .order('reviewed_at', { ascending: false });
  const rows = (rowsData ?? []) as Array<Record<string, any>>;

  const [{ data: classesData }, { data: termsData }, coachMap] = await Promise.all([
    supabase.from('classes').select('id,name'),
    supabase.from('terms').select('id,name'),
    getProfileMap(supabase, [...new Set(rows.map((row) => row.written_by))]),
  ]);
  const classMap = Object.fromEntries(((classesData ?? []) as Array<Record<string, any>>).map((row) => [row.id, row.name]));
  const termMap = Object.fromEntries(((termsData ?? []) as Array<Record<string, any>>).map((row) => [row.id, row.name]));

  const groups = new Map<string, any[]>();
  for (const row of rows) {
    const key = row.term_id;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }

  return (
    <SectionCard
      title={parentT(locale, 'portal.parent.reportCards.title', 'Report Cards')}
      description={`${parentT(locale, 'portal.parent.selectedStudent', 'Selected student')}: ${
        selectedStudent?.display_name || selectedStudent?.email || selectedStudentId
      }`}
    >
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
                      Coach:{' '}
                      {coachMap[row.written_by]?.display_name || coachMap[row.written_by]?.email || row.written_by}
                      {' - '}
                      Approved: {formatUtcForUser(row.reviewed_at || row.created_at, session.profile.timezone)}
                    </p>
                  </div>
                  <OpenSignedUrlButton endpoint={`/api/portal/report-cards/${row.id}/signed-url`} label="Open PDF" />
                </div>
              ))}
            </div>
          </article>
        ))}
        {rows.length === 0 ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {parentT(locale, 'portal.parent.reportCards.empty', 'No approved report cards yet.')}
          </p>
        ) : null}
      </div>
    </SectionCard>
  );
}

