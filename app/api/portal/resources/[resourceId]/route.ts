import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const { resourceId } = await params;
  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data: resourceData, error: fetchError } = await supabase
    .from('resources')
    .select('*')
    .eq('id', resourceId)
    .maybeSingle();
  const resource = resourceData as any;

  if (fetchError) return mergeCookies(supabaseResponse, jsonError(fetchError.message, 400));
  if (!resource) return mergeCookies(supabaseResponse, jsonError('Resource not found.', 404));

  if (session.profile.role !== 'admin' && resource.posted_by !== session.userId) {
    return mergeCookies(supabaseResponse, jsonError('Not allowed to delete this resource.', 403));
  }

  const bucket = process.env.PORTAL_BUCKET_RESOURCES || 'portal-resources';
  if (resource.file_path) {
    const { error: storageError } = await supabase.storage.from(bucket).remove([resource.file_path]);
    if (storageError) return mergeCookies(supabaseResponse, jsonError(storageError.message, 400));
  }

  const { error: deleteError } = await supabase.from('resources').delete().eq('id', resource.id);
  if (deleteError) return mergeCookies(supabaseResponse, jsonError(deleteError.message, 400));

  return mergeCookies(supabaseResponse, NextResponse.json({ ok: true }));
}
