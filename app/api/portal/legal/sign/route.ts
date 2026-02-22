import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const bodySchema = z.object({
  documentId: z.string().uuid(),
  dataUrl: z.string().min(30),
  signedForStudentId: z.string().uuid().optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function parseDataUrl(dataUrl: string): Buffer | null {
  const match = dataUrl.match(/^data:image\/png;base64,(.+)$/);
  if (!match) return null;
  try {
    return Buffer.from(match[1], 'base64');
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid payload.');

  const imageBuffer = parseDataUrl(parsed.data.dataUrl);
  if (!imageBuffer) return jsonError('Signature image is invalid.');

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const { data: document, error: documentError } = await supabase
    .from('legal_documents')
    .select('id,required_for')
    .eq('id', parsed.data.documentId)
    .maybeSingle();

  if (documentError) return mergeCookies(supabaseResponse, jsonError(documentError.message, 400));
  if (!document) return mergeCookies(supabaseResponse, jsonError('Document not found.', 404));
  if (document.required_for === 'all_coaches') {
    return mergeCookies(supabaseResponse, jsonError('Document is not required for your role.', 403));
  }

  let signedForStudentId: string | null = null;
  if (session.profile.role === 'parent') {
    signedForStudentId = parsed.data.signedForStudentId || null;
    if (!signedForStudentId) return mergeCookies(supabaseResponse, jsonError('Missing student selection.', 400));

    const { data: link } = await supabase
      .from('parent_student_links')
      .select('id')
      .eq('parent_id', session.userId)
      .eq('student_id', signedForStudentId)
      .maybeSingle();
    if (!link) return mergeCookies(supabaseResponse, jsonError('You can only sign for linked students.', 403));
  }

  const duplicateClause =
    session.profile.role === 'student'
      ? `signer_id.eq.${session.userId},signed_for_student_id.eq.${session.userId}`
      : `signer_id.eq.${signedForStudentId},signed_for_student_id.eq.${signedForStudentId}`;

  const { data: existingSignature } = await supabase
    .from('legal_signatures')
    .select('id')
    .eq('document_id', parsed.data.documentId)
    .or(duplicateClause)
    .limit(1)
    .maybeSingle();

  if (existingSignature) return mergeCookies(supabaseResponse, jsonError('Document already signed.', 409));

  const bucket = process.env.PORTAL_BUCKET_SIGNATURES || 'portal-signatures';
  const objectPath = `signature/${parsed.data.documentId}/${session.userId}/${Date.now()}-${randomUUID()}.png`;

  const uploadResult = await supabase.storage.from(bucket).upload(objectPath, imageBuffer, {
    contentType: 'image/png',
    upsert: false,
  });
  if (uploadResult.error) return mergeCookies(supabaseResponse, jsonError(uploadResult.error.message, 400));

  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0]?.trim() : null;

  const { data: signature, error: signatureError } = await supabase
    .from('legal_signatures')
    .insert({
      document_id: parsed.data.documentId,
      signer_id: session.userId,
      signer_role: session.profile.role,
      signed_for_student_id: signedForStudentId,
      signature_image_path: objectPath,
      ip_address: ipAddress,
      user_agent: request.headers.get('user-agent'),
    })
    .select('*')
    .single();

  if (signatureError) {
    return mergeCookies(supabaseResponse, jsonError(signatureError.message, 400));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ signature }));
}

