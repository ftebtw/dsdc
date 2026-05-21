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
  externalUrls: z.array(z.string().trim().url()).max(10).optional(),
  dueDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate must be YYYY-MM-DD')
    .optional(),
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
  const rawUrls = formData
    .getAll('externalUrls')
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 0);
  const parsed = schema.safeParse({
    classId: formData.get('classId'),
    title: formData.get('title'),
    notes: formData.get('notes') || undefined,
    externalUrls: rawUrls.length > 0 ? rawUrls : undefined,
    dueDate: formData.get('dueDate') || undefined,
  });
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return jsonError(firstIssue?.message || 'Invalid payload.');
  }

  const fileValue = formData.get('file');
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  const externalUrls = parsed.data.externalUrls ?? [];
  if (!file && externalUrls.length === 0) {
    return jsonError('Please attach a file or provide at least one link.');
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
    if (file.size > 10 * 1024 * 1024) {
      return mergeCookies(supabaseResponse, jsonError('File must be 10MB or smaller.', 400));
    }
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/',
    ];
    const fileType = (file.type || '').toLowerCase();
    if (!allowedTypes.some((t) => fileType.startsWith(t))) {
      return mergeCookies(supabaseResponse, jsonError('File type not allowed. Please upload a PDF, document, presentation, text, or image file.', 400));
    }
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
      console.error('[homework-submissions] upload error', { message: uploadResult.error.message });
      return mergeCookies(supabaseResponse, jsonError('Unable to upload file. Please try again.', 400));
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
      external_url: externalUrls[0] || null,
      external_urls: externalUrls,
      due_date: parsed.data.dueDate || null,
      file_path: filePath,
      file_name: fileName,
    })
    .select('*')
    .single();

  if (insertError) {
    if (filePath) {
      await admin.storage.from(bucket).remove([filePath]);
    }
    console.error('[homework-submissions] insert error', { code: insertError.code, message: insertError.message });
    return mergeCookies(supabaseResponse, jsonError('Unable to save submission. Please try again.', 400));
  }

  return mergeCookies(
    supabaseResponse,
    NextResponse.json({
      submission: inserted,
      className: classRow.name,
    })
  );
}
