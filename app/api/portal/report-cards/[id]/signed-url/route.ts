import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
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
  const { data: row, error: rowError } = await supabase
    .from('report_cards')
    .select('id,file_path,status,student_id,class_id,written_by')
    .eq('id', id)
    .maybeSingle();
  if (rowError) return mergeCookies(supabaseResponse, jsonError(rowError.message, 400));
  if (!row) return mergeCookies(supabaseResponse, jsonError('Report card not found.', 404));

  if (session.profile.role === 'student') {
    if (row.student_id !== session.userId || row.status !== 'approved') {
      return mergeCookies(supabaseResponse, jsonError('Not allowed to view this report card.', 403));
    }
  } else if (session.profile.role === 'parent') {
    if (row.status !== 'approved') return mergeCookies(supabaseResponse, jsonError('Not allowed to view this report card.', 403));
    const { data: link } = await supabase
      .from('parent_student_links')
      .select('id')
      .eq('parent_id', session.userId)
      .eq('student_id', row.student_id)
      .maybeSingle();
    if (!link) return mergeCookies(supabaseResponse, jsonError('Not allowed to view this report card.', 403));
  } else if (session.profile.role === 'coach' || session.profile.role === 'ta') {
    const { data: classRow } = await supabase
      .from('classes')
      .select('id,coach_id')
      .eq('id', row.class_id)
      .maybeSingle();
    const ownsClass = classRow?.coach_id === session.userId;
    const wroteCard = row.written_by === session.userId;
    if (!ownsClass && !wroteCard) {
      return mergeCookies(supabaseResponse, jsonError('Not allowed to view this report card.', 403));
    }
  }

  const bucket = process.env.PORTAL_BUCKET_REPORT_CARDS || 'portal-report-cards';
  const { data: signed, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(row.file_path, 60 * 15);
  if (signedError || !signed?.signedUrl) {
    return mergeCookies(supabaseResponse, jsonError(signedError?.message || 'Unable to generate report card URL.', 400));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ url: signed.signedUrl }));
}
