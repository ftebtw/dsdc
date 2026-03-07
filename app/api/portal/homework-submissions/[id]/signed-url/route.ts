import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function canManageClassHomework(supabase: any, classId: string, userId: string) {
  const { data: classRow } = await supabase
    .from('classes')
    .select('id,coach_id')
    .eq('id', classId)
    .maybeSingle();
  if (!classRow) return false;
  if (classRow.coach_id === userId) return true;

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
  return Boolean(coCoach || subReq || taReq);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta', 'student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);
  const { id } = await params;

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const admin = getSupabaseAdminClient();

  const { data: row, error: rowError } = await (supabase as any)
    .from('homework_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (rowError) return mergeCookies(supabaseResponse, jsonError(rowError.message, 400));
  if (!row) return mergeCookies(supabaseResponse, jsonError('Homework submission not found.', 404));

  if (session.profile.role === 'student') {
    if (row.student_id !== session.userId) {
      return mergeCookies(supabaseResponse, jsonError('Not allowed.', 403));
    }
  } else if (session.profile.role === 'parent') {
    const { data: link } = await supabase
      .from('parent_student_links')
      .select('id')
      .eq('parent_id', session.userId)
      .eq('student_id', row.student_id)
      .maybeSingle();
    if (!link) return mergeCookies(supabaseResponse, jsonError('Not allowed.', 403));
  } else if (session.profile.role === 'coach' || session.profile.role === 'ta') {
    const allowed = await canManageClassHomework(supabase, row.class_id, session.userId);
    if (!allowed) return mergeCookies(supabaseResponse, jsonError('Not allowed.', 403));
  }

  if (row.external_url) {
    return mergeCookies(supabaseResponse, NextResponse.json({ url: row.external_url }));
  }
  if (!row.file_path) return mergeCookies(supabaseResponse, jsonError('File path missing.', 400));

  const bucket = process.env.PORTAL_BUCKET_RESOURCES || 'portal-resources';
  const { data: signed, error: signedError } = await admin.storage
    .from(bucket)
    .createSignedUrl(row.file_path, 60 * 15);
  if (signedError || !signed?.signedUrl) {
    return mergeCookies(
      supabaseResponse,
      jsonError(signedError?.message || 'Could not generate file URL.', 400)
    );
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ url: signed.signedUrl }));
}
