export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import OpenSignedUrlButton from '@/app/portal/_components/OpenSignedUrlButton';
import ReportCardStatusBadge from '@/app/portal/_components/ReportCardStatusBadge';
import AdminReportCardReviewForm from '@/app/portal/_components/AdminReportCardReviewForm';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { getReportCardLastActivityIso } from '@/lib/portal/report-cards';
import { formatUtcForUser } from '@/lib/portal/time';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type ReportCardRow = Database['public']['Tables']['report_cards']['Row'];

export default async function AdminReportCardDetailPage({
  params,
}: {
  params: Promise<{ reportCardId: string }>;
}) {
  const session = await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const { reportCardId } = await params;

  const { data: rowData } = await supabase
    .from('report_cards')
    .select('*')
    .eq('id', reportCardId)
    .maybeSingle();
  const row = rowData as ReportCardRow | null;

  if (!row) {
    return (
      <SectionCard title="Report Card" description="Record not found.">
        <Link href="/portal/admin/report-cards" className="underline text-sm">
          Back to report card queue
        </Link>
      </SectionCard>
    );
  }

  const [{ data: classRow }, { data: termRow }, profileMap] = await Promise.all([
    supabase.from('classes').select('id,name').eq('id', row.class_id).maybeSingle(),
    supabase.from('terms').select('id,name').eq('id', row.term_id).maybeSingle(),
    getProfileMap(
      supabase,
      [row.student_id, row.written_by, row.reviewed_by].filter((value): value is string => Boolean(value))
    ),
  ]);

  return (
    <div className="space-y-6">
      <SectionCard title="Report Card Review" description="Open PDF and approve or reject with notes.">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <p>
            <span className="font-semibold">Student:</span>{' '}
            {profileMap[row.student_id]?.display_name || profileMap[row.student_id]?.email || row.student_id}
          </p>
          <p>
            <span className="font-semibold">Class:</span> {classRow?.name || row.class_id}
          </p>
          <p>
            <span className="font-semibold">Term:</span> {termRow?.name || row.term_id}
          </p>
          <p>
            <span className="font-semibold">Written by:</span>{' '}
            {profileMap[row.written_by]?.display_name || profileMap[row.written_by]?.email || row.written_by}
          </p>
          <p>
            <span className="font-semibold">Status:</span> <ReportCardStatusBadge status={row.status} />
          </p>
          <p>
            <span className="font-semibold">Last activity:</span>{' '}
            {formatUtcForUser(getReportCardLastActivityIso(row), session.profile.timezone)}
          </p>
          {row.reviewed_by ? (
            <p className="md:col-span-2">
              <span className="font-semibold">Reviewed by:</span>{' '}
              {profileMap[row.reviewed_by]?.display_name || profileMap[row.reviewed_by]?.email || row.reviewed_by}{' '}
              ({row.reviewed_at ? formatUtcForUser(row.reviewed_at, session.profile.timezone) : '-'})
            </p>
          ) : null}
          {row.reviewer_notes ? (
            <p className="md:col-span-2 rounded-md bg-red-50 px-3 py-2 text-red-700">
              <span className="font-semibold">Reviewer notes:</span> {row.reviewer_notes}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <OpenSignedUrlButton endpoint={`/api/portal/report-cards/${row.id}/signed-url`} label="Open PDF" />
          <Link
            href="/portal/admin/report-cards"
            className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
          >
            Back to Queue
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="Review Actions" description="Only submitted cards can be approved or rejected.">
        <AdminReportCardReviewForm reportCardId={row.id} canReview={row.status === 'submitted'} />
      </SectionCard>
    </div>
  );
}
