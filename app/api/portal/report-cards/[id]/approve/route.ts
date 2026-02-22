import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';
import { canReviewReportCard, readGeneralUpdatesPreference } from '@/lib/portal/report-cards';
import { sendPortalEmails } from '@/lib/email/send';
import { reportCardApproved } from '@/lib/email/templates';
import { portalPathUrl } from '@/lib/portal/phase-c';

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

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data: row, error: rowError } = await supabase
    .from('report_cards')
    .select('id,status,student_id,class_id,term_id')
    .eq('id', id)
    .maybeSingle();
  if (rowError) return mergeCookies(supabaseResponse, jsonError(rowError.message, 400));
  if (!row) return mergeCookies(supabaseResponse, jsonError('Report card not found.', 404));
  if (!canReviewReportCard(row.status)) {
    return mergeCookies(supabaseResponse, jsonError('Only submitted report cards can be approved.', 409));
  }

  const { data: updated, error: updateError } = await supabase
    .from('report_cards')
    .update({
      status: 'approved',
      reviewer_notes: null,
      reviewed_by: session.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));

  const [{ data: student }, { data: classRow }, { data: termRow }, { data: parentLinks }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id,email,display_name,notification_preferences')
      .eq('id', row.student_id)
      .maybeSingle(),
    supabase.from('classes').select('id,name').eq('id', row.class_id).maybeSingle(),
    supabase.from('terms').select('id,name').eq('id', row.term_id).maybeSingle(),
    supabase.from('parent_student_links').select('parent_id').eq('student_id', row.student_id),
  ]);

  const parentIds = [
    ...new Set(
      ((parentLinks ?? []) as Array<{ parent_id: string | null }>)
        .map((link) => link.parent_id)
        .filter((value): value is string => Boolean(value))
    ),
  ];
  const parents = parentIds.length
    ? (
        (
          await supabase
            .from('profiles')
            .select('id,email,display_name,notification_preferences')
            .in('id', parentIds)
            .eq('role', 'parent')
        ).data ?? []
      )
    : [];

  const portalUrl = portalPathUrl('/portal/login');
  const className = classRow?.name || 'Class';
  const termName = termRow?.name || 'Current Term';
  const messages: Array<{ to: string; subject: string; html: string; text: string }> = [];

  if (student?.email && readGeneralUpdatesPreference(student.notification_preferences)) {
    messages.push({
      to: student.email,
      ...reportCardApproved({
        studentName: student.display_name || student.email,
        className,
        termName,
        portalUrl,
      }),
    });
  }

  for (const parent of parents) {
    if (!parent?.email) continue;
    if (!readGeneralUpdatesPreference(parent.notification_preferences)) continue;
    messages.push({
      to: parent.email,
      ...reportCardApproved({
        studentName: student?.display_name || student?.email || 'Student',
        className,
        termName,
        portalUrl,
      }),
    });
  }

  if (messages.length) {
    await sendPortalEmails(messages);
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ reportCard: updated }));
}
