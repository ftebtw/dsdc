import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient } from '@/lib/supabase/route';
import type { Database } from '@/lib/supabase/database.types';

const metadataSchema = z.object({
  classId: z.string().uuid().optional(),
  title: z.string().min(1).max(180),
  type: z.enum(['homework', 'lesson_plan', 'slides', 'document', 'recording', 'other']),
  url: z.string().url().optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function cleanFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);
  const formData = await request.formData();
  const parsed = metadataSchema.safeParse({
    classId: formData.get('classId') || undefined,
    title: formData.get('title'),
    type: formData.get('type'),
    url: formData.get('url') || undefined,
  });
  if (!parsed.success) return jsonError('Invalid upload payload.');

  const fileValue = formData.get('file');
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  const hasUrl = Boolean(parsed.data.url);
  if (!file && !hasUrl) return jsonError('Provide a file or URL.');

  const classId = parsed.data.classId ?? null;

  if (classId && session.profile.role !== 'admin') {
    const { data: classRowData } = await supabase
      .from('classes')
      .select('id, coach_id')
      .eq('id', classId)
      .maybeSingle();
    const classRow = classRowData as any;

    if (!classRow || classRow.coach_id !== session.userId) {
      return jsonError('Not allowed for this class.', 403);
    }
  }

  const rowPayload: Database['public']['Tables']['resources']['Insert'] = {
    class_id: classId,
    posted_by: session.userId,
    title: parsed.data.title,
    type: parsed.data.type,
  };

  if (hasUrl) {
    rowPayload.url = parsed.data.url!;
    const { data: insertedData, error } = await supabase
      .from('resources')
      .insert(rowPayload)
      .select('*')
      .single();
    const inserted = insertedData as any;
    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ resource: inserted });
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

  if (uploadResult.error) return jsonError(uploadResult.error.message, 400);

  rowPayload.file_path = objectPath;

  const { data: insertedData, error: insertError } = await supabase
    .from('resources')
    .insert(rowPayload)
    .select('*')
    .single();
  const inserted = insertedData as any;

  if (insertError) {
    await supabase.storage.from(bucket).remove([objectPath]);
    return jsonError(insertError.message, 400);
  }

  return NextResponse.json({ resource: inserted });
}
