import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const schema = z.object({
  classId: z.string().uuid(),
  title: z.string().trim().min(1).max(180),
  notes: z.string().trim().max(4000).optional(),
  externalUrl: z.string().trim().url().optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function cleanFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['student']);
  if (!session) return jsonError('Unauthorized', 401);

  const formData = await request.formData();
  const parsed = schema.safeParse({
    classId: formData.get('classId'),
    title: formData.get('title'),
    notes: formData.get('notes') || undefined,
    externalUrl: formData.get('externalUrl') || undefined,
  });
  if (!parsed.success) return jsonError('Invalid payload.');

  const fileValue = formData.get('file');
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  if (!file && !parsed.data.externalUrl) {
    return jsonError('Please attach a file or provide an external URL.');
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const admin = getSupabaseAdminClient();

  const { data: classRow } = await supabase
    .from('classes')
    .select('id,name')
    .eq('id', parsed.data.classId)
    .maybeSingle();
  if (!classRow) return mergeCookies(supabaseResponse, jsonError('Class not found.', 404));

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('class_id', parsed.data.classId)
    .eq('student_id', session.userId)
    .in('status', ['active', 'completed'])
    .maybeSingle();
  if (!enrollment) {
    return mergeCookies(supabaseResponse, jsonError('You are not enrolled in this class.', 403));
  }

  const submissionId = randomUUID();
  const bucket = process.env.PORTAL_BUCKET_RESOURCES || 'portal-resources';
  let filePath: string | null = null;
  let fileName: string | null = null;

  if (file) {
    const safeName = cleanFilename(file.name || 'homework-upload.bin');
    filePath = `class/${parsed.data.classId}/homework-submissions/${session.userId}/${submissionId}/${safeName}`;
    fileName = file.name || safeName;
    const uploadResult = await admin.storage
      .from(bucket)
      .upload(filePath, await file.arrayBuffer(), {
        contentType: file.type || undefined,
        upsert: false,
      });
    if (uploadResult.error) {
      return mergeCookies(supabaseResponse, jsonError(uploadResult.error.message, 400));
    }
  }

  const { data: inserted, error: insertError } = await (supabase as any)
    .from('homework_submissions')
    .insert({
      id: submissionId,
      class_id: parsed.data.classId,
      student_id: session.userId,
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      external_url: parsed.data.externalUrl || null,
      file_path: filePath,
      file_name: fileName,
    })
    .select('*')
    .single();

  if (insertError) {
    if (filePath) {
      await admin.storage.from(bucket).remove([filePath]);
    }
    return mergeCookies(supabaseResponse, jsonError(insertError.message, 400));
  }

  return mergeCookies(
    supabaseResponse,
    NextResponse.json({
      submission: inserted,
      className: classRow.name,
    })
  );
}
