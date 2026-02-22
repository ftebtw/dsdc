import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient } from '@/lib/supabase/route';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta', 'student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const { resourceId } = await params;
  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);
  const { data: resourceData, error: resourceError } = await supabase
    .from('resources')
    .select('*')
    .eq('id', resourceId)
    .maybeSingle();
  const resource = resourceData as any;

  if (resourceError) return jsonError(resourceError.message, 400);
  if (!resource) return jsonError('Resource not found.', 404);

  if (resource.url) {
    return NextResponse.json({ url: resource.url });
  }

  if (!resource.file_path) return jsonError('Resource file path missing.', 400);

  const bucket = process.env.PORTAL_BUCKET_RESOURCES || 'portal-resources';
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(resource.file_path, 60 * 15);

  if (error || !data?.signedUrl) return jsonError(error?.message || 'Failed to create signed URL.', 400);
  return NextResponse.json({ url: data.signedUrl });
}
