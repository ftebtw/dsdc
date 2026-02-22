import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient } from '@/lib/supabase/route';
import { canReviewReportCard } from '@/lib/portal/report-cards';
import { sendPortalEmails } from '@/lib/email/send';
import { reportCardRejected } from '@/lib/email/templates';
import { portalPathUrl } from '@/lib/portal/phase-c';

const bodySchema = z.object({
  reviewerNotes: z.string().trim().min(1).max(3000),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['admin']);
  if (!session) return jsonError('Unauthorized', 401);
  const { id } = await params;

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Reviewer notes are required.');

  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);

  const { data: row, error: rowError } = await supabase
    .from('report_cards')
    .select('id,status,student_id,class_id,written_by')
    .eq('id', id)
    .maybeSingle();
  if (rowError) return jsonError(rowError.message, 400);
  if (!row) return jsonError('Report card not found.', 404);
  if (!canReviewReportCard(row.status)) {
    return jsonError('Only submitted report cards can be rejected.', 409);
  }

  const { data: updated, error: updateError } = await supabase
    .from('report_cards')
    .update({
      status: 'rejected',
      reviewer_notes: parsed.data.reviewerNotes,
      reviewed_by: session.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (updateError) return jsonError(updateError.message, 400);

  const [{ data: coach }, { data: student }, { data: classRow }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id,email,display_name')
      .eq('id', row.written_by)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('id,email,display_name')
      .eq('id', row.student_id)
      .maybeSingle(),
    supabase.from('classes').select('id,name').eq('id', row.class_id).maybeSingle(),
  ]);

  if (coach?.email) {
    await sendPortalEmails([
      {
        to: coach.email,
        ...reportCardRejected({
          coachName: coach.display_name || coach.email,
          studentName: student?.display_name || student?.email || 'Student',
          className: classRow?.name || 'Class',
          reviewerNotes: parsed.data.reviewerNotes,
          portalUrl: portalPathUrl('/portal/coach/report-cards'),
        }),
      },
    ]);
  }

  return NextResponse.json({ reportCard: updated });
}
