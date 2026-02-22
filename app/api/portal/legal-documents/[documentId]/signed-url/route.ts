import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient } from '@/lib/supabase/route';

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
  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);

  const { data: document, error: documentError } = await supabase
    .from('legal_documents')
    .select('id,file_path')
    .eq('id', documentId)
    .maybeSingle();

  if (documentError) return jsonError(documentError.message, 400);
  if (!document) return jsonError('Document not found.', 404);

  const bucket = process.env.PORTAL_BUCKET_LEGAL_DOCS || 'portal-legal-docs';
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(document.file_path, 60 * 15);
  if (error || !data?.signedUrl) return jsonError(error?.message || 'Unable to generate URL.', 400);

  return NextResponse.json({ url: data.signedUrl });
}
