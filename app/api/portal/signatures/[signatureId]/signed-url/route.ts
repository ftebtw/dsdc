import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient } from '@/lib/supabase/route';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ signatureId: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta', 'student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const { signatureId } = await params;
  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);

  const { data: signature, error: signatureError } = await supabase
    .from('legal_signatures')
    .select('id,signature_image_path')
    .eq('id', signatureId)
    .maybeSingle();

  if (signatureError) return jsonError(signatureError.message, 400);
  if (!signature) return jsonError('Signature not found.', 404);

  const bucket = process.env.PORTAL_BUCKET_SIGNATURES || 'portal-signatures';
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(signature.signature_image_path, 60 * 15);

  if (error || !data?.signedUrl) return jsonError(error?.message || 'Unable to generate URL.', 400);
  return NextResponse.json({ url: data.signedUrl });
}
