import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'audio/mpeg',
  'audio/mp4',
  'video/mp4',
]);
const ALLOWED_EXT = new Set([
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip',
  'txt', 'csv', 'jpg', 'jpeg', 'png', 'webp', 'gif',
  'mp3', 'm4a', 'mp4',
]);
const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB

const schema = z.object({
  classId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(12000).optional(),
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

function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
}

function cleanFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

function isAllowed(file: File): boolean {
  const mime = (file.type || '').toLowerCase();
  if (mime && ALLOWED_MIME.has(mime)) return true;
  const ext = fileExtension(file.name || '');
  return !!ext && ALLOWED_EXT.has(ext);
}

async function canManageClass(supabase: any, classId: string, userId: string): Promise<boolean> {
  const { data: classRow } = await supabase
    .from('classes')
    .select('id, coach_id')
    .eq('id', classId)
    .maybeSingle();
  if (!classRow) return false;
  if (classRow.coach_id === userId) return true;
  const [{ data: coCoach }, { data: subReq }, { data: taReq }] = await Promise.all([
    supabase.from('class_coaches').select('id').eq('class_id', classId).eq('coach_id', userId).maybeSingle(),
    supabase
      .from('sub_requests')
      .select('id')
      .eq('class_id', classId)
      .eq('accepting_coach_id', userId)
      .eq('status', 'accepted')
      .maybeSingle(),
    supabase
      .from('ta_requests')
      .select('id')
      .eq('class_id', classId)
      .eq('accepting_ta_id', userId)
      .eq('status', 'accepted')
      .maybeSingle(),
  ]);
  return Boolean(coCoach || subReq || taReq);
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const formData = await request.formData();
  const externalUrls = formData
    .getAll('externalUrls')
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter((v) => v.length > 0);

  const parsed = schema.safeParse({
    classId: formData.get('classId'),
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    externalUrls: externalUrls.length > 0 ? externalUrls : undefined,
    dueDate: formData.get('dueDate') || undefined,
  });
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid payload.');
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  // Admins skip the class-team check; coaches/TAs must be on the class team.
  if (session.profile.role !== 'admin') {
    const allowed = await canManageClass(supabase, parsed.data.classId, session.userId);
    if (!allowed) {
      return mergeCookies(supabaseResponse, jsonError('Not allowed for this class.', 403));
    }
  } else {
    const { data: classRow } = await supabase
      .from('classes')
      .select('id')
      .eq('id', parsed.data.classId)
      .maybeSingle();
    if (!classRow) return mergeCookies(supabaseResponse, jsonError('Class not found.', 404));
  }

  const fileValue = formData.get('file');
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

  const assignmentId = randomUUID();
  let filePath: string | null = null;
  let fileName: string | null = null;

  if (file) {
    if (file.size > MAX_FILE_BYTES) {
      return mergeCookies(supabaseResponse, jsonError('File is too large. Maximum size is 25MB.', 400));
    }
    if (!isAllowed(file)) {
      return mergeCookies(
        supabaseResponse,
        jsonError('Unsupported file type.', 400)
      );
    }
    const bucket = process.env.PORTAL_BUCKET_RESOURCES || 'portal-resources';
    const safeName = cleanFilename(file.name || 'attachment.bin');
    const objectPath = `class/${parsed.data.classId}/homework-assignments/${assignmentId}/${safeName}`;
    const admin = getSupabaseAdminClient();
    const uploadResult = await admin.storage
      .from(bucket)
      .upload(objectPath, await file.arrayBuffer(), {
        contentType: file.type || undefined,
        upsert: false,
      });
    if (uploadResult.error) {
      return mergeCookies(supabaseResponse, jsonError(uploadResult.error.message, 400));
    }
    filePath = objectPath;
    fileName = file.name || safeName;
  }

  const { data: inserted, error: insertError } = await (supabase as any)
    .from('homework_assignments')
    .insert({
      id: assignmentId,
      class_id: parsed.data.classId,
      posted_by: session.userId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      external_urls: externalUrls,
      file_path: filePath,
      file_name: fileName,
      due_date: parsed.data.dueDate || null,
    })
    .select('*')
    .single();

  if (insertError) {
    if (filePath) {
      const bucket = process.env.PORTAL_BUCKET_RESOURCES || 'portal-resources';
      await getSupabaseAdminClient().storage.from(bucket).remove([filePath]);
    }
    console.error('[homework-assignments] insert error', insertError);
    return mergeCookies(supabaseResponse, jsonError('Could not create assignment. Please try again.', 400));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ assignment: inserted }));
}
