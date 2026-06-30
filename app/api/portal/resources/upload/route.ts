import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { fromZonedTime } from 'date-fns-tz';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';
import type { Database } from '@/lib/supabase/database.types';

const metadataSchema = z.object({
  classId: z.string().uuid().optional(),
  title: z.string().min(1).max(180),
  description: z.string().trim().max(12000).optional(),
  type: z.enum(['lesson_plan', 'slides', 'document', 'recording', 'other']),
  urls: z.array(z.string().url()).max(10).optional(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  publishAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  section: z.string().trim().max(120).optional(),
});

const RESOURCE_MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB
const RESOURCE_ALLOWED_MIME_TYPES = new Set([
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
const RESOURCE_ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'zip',
  'txt',
  'csv',
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'mp3',
  'm4a',
  'mp4',
]);

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function formStringValue(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function inferResourceTitle(input: {
  title?: string;
  description?: string;
  url?: string;
  file?: File | null;
}): string | undefined {
  if (input.title) return input.title.slice(0, 180);

  if (input.description) {
    const firstLine = input.description
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean);
    if (firstLine) return firstLine.slice(0, 180);
  }

  if (input.file?.name) {
    return input.file.name.trim().slice(0, 180);
  }

  if (input.url) {
    try {
      const parsedUrl = new URL(input.url);
      const readablePath = `${parsedUrl.hostname}${parsedUrl.pathname === '/' ? '' : parsedUrl.pathname}`;
      return readablePath.slice(0, 180);
    } catch {
      return input.url.slice(0, 180);
    }
  }

  return undefined;
}

function isLegacyResourceAttachmentConstraint(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: string }).code;
  const message = ((error as { message?: string }).message || '').toLowerCase();
  if (code !== '23514') return false;
  return message.includes('resources') && message.includes('url') && message.includes('file_path');
}

function cleanFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

function fileExtension(name: string): string {
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex < 0) return '';
  return name.slice(dotIndex + 1).toLowerCase();
}

function isAllowedResourceFile(file: File): boolean {
  const mime = (file.type || '').toLowerCase();
  if (mime && RESOURCE_ALLOWED_MIME_TYPES.has(mime)) return true;
  const ext = fileExtension(file.name || '');
  return !!ext && RESOURCE_ALLOWED_EXTENSIONS.has(ext);
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const formData = await request.formData();
  const fileValue = formData.get('file');
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  const rawDescription = formStringValue(formData, 'description');
  // Accept both legacy single `url` and new repeated `urls[]` form fields so
  // older clients (or callers that pass a single URL) keep working.
  const rawUrls = (() => {
    const fromArray = formData
      .getAll('urls')
      .map((v) => (typeof v === 'string' ? v.trim() : ''))
      .filter((v) => v.length > 0);
    if (fromArray.length > 0) return fromArray;
    const single = formStringValue(formData, 'url');
    return single ? [single] : [];
  })();
  const primaryUrl = rawUrls[0];
  const inferredTitle = inferResourceTitle({
    title: formStringValue(formData, 'title'),
    description: rawDescription,
    url: primaryUrl,
    file,
  });

  if (!inferredTitle && !rawDescription && rawUrls.length === 0 && !file) {
    return mergeCookies(
      supabaseResponse,
      jsonError('Add a note, link, or file before posting this resource.', 400)
    );
  }

  const parsed = metadataSchema.safeParse({
    classId: formStringValue(formData, 'classId'),
    title: inferredTitle,
    description: rawDescription,
    type: formStringValue(formData, 'type') ?? 'other',
    urls: rawUrls.length > 0 ? rawUrls : undefined,
    sessionDate: formStringValue(formData, 'sessionDate'),
    publishAt: formStringValue(formData, 'publishAt'),
    section: formStringValue(formData, 'section'),
  });
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return mergeCookies(
      supabaseResponse,
      jsonError(firstIssue?.message || 'Invalid upload payload.')
    );
  }

  const cleanedUrls = parsed.data.urls ?? [];
  const hasUrl = cleanedUrls.length > 0;
  if (file && file.size > RESOURCE_MAX_FILE_BYTES) {
    return mergeCookies(
      supabaseResponse,
      jsonError('File is too large. Maximum size is 25MB.', 400)
    );
  }
  if (file && !isAllowedResourceFile(file)) {
    return mergeCookies(
      supabaseResponse,
      jsonError(
        'Unsupported file type. Allowed: PDF, Office docs, ZIP, text, images, MP3/M4A, and MP4.',
        400
      )
    );
  }

  const classId = parsed.data.classId ?? null;

  let classTimezone = 'UTC';
  if (classId && session.profile.role !== 'admin') {
    const { data: classRowData } = await supabase
      .from('classes')
      .select('id, coach_id, timezone')
      .eq('id', classId)
      .maybeSingle();
    const classRow = classRowData as any;

    if (!classRow) {
      return mergeCookies(supabaseResponse, jsonError('Class not found.', 404));
    }
    classTimezone = classRow.timezone || 'UTC';

    // Allow primary coach, co-coaches, accepted subs, or accepted TAs.
    if (classRow.coach_id !== session.userId) {
      const [{ data: coCoach }, { data: subReq }, { data: taReq }] = await Promise.all([
        supabase
          .from('class_coaches')
          .select('id')
          .eq('class_id', classId)
          .eq('coach_id', session.userId)
          .maybeSingle(),
        supabase
          .from('sub_requests')
          .select('id')
          .eq('class_id', classId)
          .eq('accepting_coach_id', session.userId)
          .eq('status', 'accepted')
          .maybeSingle(),
        supabase
          .from('ta_requests')
          .select('id')
          .eq('class_id', classId)
          .eq('accepting_ta_id', session.userId)
          .eq('status', 'accepted')
          .maybeSingle(),
      ]);
      if (!coCoach && !subReq && !taReq) {
        return mergeCookies(supabaseResponse, jsonError('Not allowed for this class.', 403));
      }
    }
  } else if (classId) {
    const { data: classRowData } = await supabase
      .from('classes')
      .select('id, timezone')
      .eq('id', classId)
      .maybeSingle();
    const classRow = classRowData as any;
    if (!classRow) {
      return mergeCookies(supabaseResponse, jsonError('Class not found.', 404));
    }
    classTimezone = classRow.timezone || 'UTC';
  }

  const publishAt =
    parsed.data.publishAt
      ? fromZonedTime(`${parsed.data.publishAt}T00:00:00`, classTimezone).toISOString()
      : new Date().toISOString();

  const rowPayload: Database['public']['Tables']['resources']['Insert'] = {
    class_id: classId,
    posted_by: session.userId,
    title: parsed.data.title,
    description: parsed.data.description?.trim() || null,
    type: parsed.data.type,
    session_date: parsed.data.sessionDate || new Date().toISOString().slice(0, 10),
    publish_at: publishAt,
    section: parsed.data.section?.trim() ? parsed.data.section.trim() : null,
  };

  if (hasUrl) {
    // Keep the legacy single-URL column populated with the first link so
    // any reader still on the old shape continues to work.
    rowPayload.url = cleanedUrls[0];
    (rowPayload as Record<string, unknown>).urls = cleanedUrls;
  }

  if (!file) {
    const { data: insertedData, error } = await supabase
      .from('resources')
      .insert(rowPayload)
      .select('*')
      .single();
    const inserted = insertedData as any;
    if (error) {
      if (isLegacyResourceAttachmentConstraint(error)) {
        return mergeCookies(
          supabaseResponse,
          jsonError(
            'Text-only resources are enabled in the app, but this database still requires a file or URL. Please run the latest resources migration.',
            400
          )
        );
      }
      return mergeCookies(supabaseResponse, jsonError(error.message, 400));
    }
    return mergeCookies(supabaseResponse, NextResponse.json({ resource: inserted }));
  }

  const resourceId = randomUUID();
  const bucket = process.env.PORTAL_BUCKET_RESOURCES || 'portal-resources';
  const safeName = cleanFilename(file!.name || 'upload.bin');
  const objectPath = classId
    ? `class/${classId}/${resourceId}/${safeName}`
    : `general/${session.userId}/${resourceId}/${safeName}`;

  const arrayBuffer = await file!.arrayBuffer();
  const uploadResult = await supabase.storage
    .from(bucket)
    .upload(objectPath, arrayBuffer, { contentType: file!.type || undefined, upsert: false });

  if (uploadResult.error) return mergeCookies(supabaseResponse, jsonError(uploadResult.error.message, 400));

  rowPayload.file_path = objectPath;

  const { data: insertedData, error: insertError } = await supabase
    .from('resources')
    .insert(rowPayload)
    .select('*')
    .single();
  const inserted = insertedData as any;

  if (insertError) {
    await supabase.storage.from(bucket).remove([objectPath]);
    if (isLegacyResourceAttachmentConstraint(insertError)) {
      return mergeCookies(
        supabaseResponse,
        jsonError(
          'Text-only resources are enabled in the app, but this database still requires a file or URL. Please run the latest resources migration.',
          400
        )
      );
    }
    return mergeCookies(supabaseResponse, jsonError(insertError.message, 400));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ resource: inserted }));
}
