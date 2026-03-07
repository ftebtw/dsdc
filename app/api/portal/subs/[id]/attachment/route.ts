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
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const { id } = await params;
  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data: requestRow, error: requestError } = await supabase
    .from('sub_requests')
    .select('id,attachment_path,attachment_name')
    .eq('id', id)
    .maybeSingle();
  if (requestError) return mergeCookies(supabaseResponse, jsonError(requestError.message, 400));
  if (!requestRow) return mergeCookies(supabaseResponse, jsonError('Request not found.', 404));
  if (!requestRow.attachment_path) {
    return mergeCookies(supabaseResponse, jsonError('No attachment on this request.', 404));
  }

  const bucket = process.env.PORTAL_BUCKET_RESOURCES || 'portal-resources';
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(requestRow.attachment_path, 60 * 15);

  if (error || !data?.signedUrl) {
    return mergeCookies(
      supabaseResponse,
      jsonError(error?.message || 'Failed to create signed URL.', 400)
    );
  }

  return mergeCookies(
    supabaseResponse,
    NextResponse.json({ url: data.signedUrl, name: requestRow.attachment_name })
  );
}
