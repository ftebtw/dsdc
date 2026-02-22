import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta', 'student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const { documentId } = await params;
  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data: document, error: documentError } = await supabase
    .from('legal_documents')
    .select('id,file_path')
    .eq('id', documentId)
    .maybeSingle();

  if (documentError) return mergeCookies(supabaseResponse, jsonError(documentError.message, 400));
  if (!document) return mergeCookies(supabaseResponse, jsonError('Document not found.', 404));

  const bucket = process.env.PORTAL_BUCKET_LEGAL_DOCS || 'portal-legal-docs';
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(document.file_path, 60 * 15);
  if (error || !data?.signedUrl) return mergeCookies(supabaseResponse, jsonError(error?.message || 'Unable to generate URL.', 400));

  return mergeCookies(supabaseResponse, NextResponse.json({ url: data.signedUrl }));
}
