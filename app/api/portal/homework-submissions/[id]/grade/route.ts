import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { sendPortalEmails } from '@/lib/email/send';
import { homeworkFeedbackTemplate } from '@/lib/email/templates';
import { readGeneralUpdatesPreference } from '@/lib/portal/report-cards';
import { portalPathUrl } from '@/lib/portal/phase-c';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const schema = z.object({
  grade: z.string().trim().min(1).max(64),
  feedback: z.string().trim().max(4000).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function canManageClassHomework(supabase: any, classId: string, userId: string) {
  const { data: classRow } = await supabase
    .from('classes')
    .select('id,coach_id,name')
    .eq('id', classId)
    .maybeSingle();
  if (!classRow) return { ok: false as const, className: null as string | null };
  if (classRow.coach_id === userId) return { ok: true as const, className: classRow.name as string };

  const [{ data: coCoach }, { data: subReq }, { data: taReq }] = await Promise.all([
    supabase
      .from('class_coaches')
      .select('id')
      .eq('class_id', classId)
      .eq('coach_id', userId)
      .maybeSingle(),
    supabase
      .from('sub_requests')
      .select('id')
      .eq('class_id', classId)
      .eq('accepting_coach_id', userId)
      .eq('status', 'accepted')
      .maybeSingle(),
    supabase
      .from('ta_requests')
      .select('id')
      .eq('class_id', classId)
      .eq('accepting_ta_id', userId)
      .eq('status', 'accepted')
      .maybeSingle(),
  ]);

  return {
    ok: Boolean(coCoach || subReq || taReq),
    className: classRow.name as string,
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError('Invalid grade payload.');

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data: row, error: rowError } = await (supabase as any)
    .from('homework_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (rowError) return mergeCookies(supabaseResponse, jsonError(rowError.message, 400));
  if (!row) return mergeCookies(supabaseResponse, jsonError('Homework submission not found.', 404));

  let className: string | null = null;
  if (session.profile.role !== 'admin') {
    const permission = await canManageClassHomework(supabase, row.class_id, session.userId);
    className = permission.className;
    if (!permission.ok) {
      return mergeCookies(supabaseResponse, jsonError('Not allowed for this class.', 403));
    }
  } else {
    const { data: classRow } = await supabase
      .from('classes')
      .select('name')
      .eq('id', row.class_id)
      .maybeSingle();
    className = classRow?.name ?? null;
  }

  const { data: updated, error: updateError } = await (supabase as any)
    .from('homework_submissions')
    .update({
      grade: parsed.data.grade,
      feedback: parsed.data.feedback || null,
      graded_by: session.userId,
      graded_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));

  const { data: student } = await supabase
    .from('profiles')
    .select('id,email,display_name,notification_preferences')
    .eq('id', row.student_id)
    .maybeSingle();

  if (student?.email && readGeneralUpdatesPreference(student.notification_preferences)) {
    const template = homeworkFeedbackTemplate({
      studentName: student.display_name || student.email,
      className: className || row.class_id,
      homeworkTitle: row.title,
      grade: parsed.data.grade,
      feedback: parsed.data.feedback || '',
      portalUrl: portalPathUrl('/portal/student/homework'),
    });
    await sendPortalEmails([{ to: student.email, ...template }]);
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ submission: updated }));
}
