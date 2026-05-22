import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
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

  // Rely on the homework_assignments RLS policies to filter access — if the
  // requesting user can read the row, they can sign a URL for its file.
  const { data: assignment, error } = await (supabase as any)
    .from('homework_assignments')
    .select('id, file_path')
    .eq('id', id)
    .maybeSingle();

  if (error || !assignment) {
    return mergeCookies(supabaseResponse, jsonError('Assignment not found.', 404));
  }
  if (!assignment.file_path) {
    return mergeCookies(supabaseResponse, jsonError('No file attached.', 404));
  }

  const bucket = process.env.PORTAL_BUCKET_RESOURCES || 'portal-resources';
  const admin = getSupabaseAdminClient();
  const { data: signed, error: signError } = await admin.storage
    .from(bucket)
    .createSignedUrl(assignment.file_path, 300);
  if (signError || !signed?.signedUrl) {
    return mergeCookies(supabaseResponse, jsonError('Could not create download link.', 400));
  }
  return mergeCookies(supabaseResponse, NextResponse.json({ url: signed.signedUrl }));
}
