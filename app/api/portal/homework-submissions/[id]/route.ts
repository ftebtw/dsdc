import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const schema = z.object({
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

// Students edit their own already-posted submission (while it is ungraded).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['student']);
  if (!session) return jsonError('Unauthorized', 401);
  const { id } = await params;
  if (!id) return jsonError('Missing submission id.');

  const formData = await request.formData();
  const rawUrls = formData
    .getAll('externalUrls')
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 0);
  const removeFile = formData.get('removeFile') === '1';
  const parsed = schema.safeParse({
    title: formData.get('title'),
    notes: formData.get('notes') || undefined,
    externalUrls: rawUrls.length > 0 ? rawUrls : undefined,
    dueDate: formData.get('dueDate') || undefined,
  });
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return jsonError(firstIssue?.message || 'Invalid payload.');
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const admin = getSupabaseAdminClient();

  // Load the existing submission (RLS limits the student to their own rows).
  const { data: existing } = await (supabase as any)
    .from('homework_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!existing) {
    return mergeCookies(supabaseResponse, jsonError('Submission not found.', 404));
  }
  if (existing.student_id !== session.userId) {
    return mergeCookies(supabaseResponse, jsonError('Not allowed.', 403));
  }
  if (existing.graded_at) {
    return mergeCookies(
      supabaseResponse,
      jsonError('This submission has been graded and can no longer be edited.', 409)
    );
  }

  const fileValue = formData.get('file');
  const newFile = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  const externalUrls = parsed.data.externalUrls ?? [];

  const bucket = process.env.PORTAL_BUCKET_RESOURCES || 'portal-resources';
  let filePath: string | null = existing.file_path ?? null;
  let fileName: string | null = existing.file_name ?? null;

  if (newFile) {
    if (newFile.size > 10 * 1024 * 1024) {
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
    const fileType = (newFile.type || '').toLowerCase();
    if (!allowedTypes.some((t) => fileType.startsWith(t))) {
      return mergeCookies(
        supabaseResponse,
        jsonError('File type not allowed. Please upload a PDF, document, presentation, text, or image file.', 400)
      );
    }
    const safeName = cleanFilename(newFile.name || 'homework-upload.bin');
    const newPath = `class/${existing.class_id}/homework-submissions/${session.userId}/${id}/${randomUUID()}-${safeName}`;
    const uploadResult = await admin.storage
      .from(bucket)
      .upload(newPath, await newFile.arrayBuffer(), {
        contentType: newFile.type || undefined,
        upsert: false,
      });
    if (uploadResult.error) {
      console.error('[homework-submissions PATCH] upload error', { message: uploadResult.error.message });
      return mergeCookies(supabaseResponse, jsonError('Unable to upload file. Please try again.', 400));
    }
    // Remove the previous file if it existed.
    if (existing.file_path) {
      await admin.storage.from(bucket).remove([existing.file_path]);
    }
    filePath = newPath;
    fileName = newFile.name || safeName;
  } else if (removeFile && existing.file_path) {
    await admin.storage.from(bucket).remove([existing.file_path]);
    filePath = null;
    fileName = null;
  }

  // Require at least a file or one link, mirroring the create flow.
  if (!filePath && externalUrls.length === 0) {
    return mergeCookies(
      supabaseResponse,
      jsonError('Please keep a file or at least one link on the submission.', 400)
    );
  }

  const { data: updated, error: updateError } = await (supabase as any)
    .from('homework_submissions')
    .update({
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      external_url: externalUrls[0] || null,
      external_urls: externalUrls,
      due_date: parsed.data.dueDate || null,
      file_path: filePath,
      file_name: fileName,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (updateError) {
    console.error('[homework-submissions PATCH] update error', {
      code: updateError.code,
      message: updateError.message,
    });
    return mergeCookies(supabaseResponse, jsonError('Unable to save changes. Please try again.', 400));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ submission: updated }));
}
