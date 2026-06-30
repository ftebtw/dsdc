import { NextRequest, NextResponse } from 'next/server';
import { fromZonedTime } from 'date-fns-tz';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const patchSchema = z.object({
  title: z.string().trim().min(1).max(180).optional(),
  description: z.string().trim().max(12000).nullable().optional(),
  type: z.enum(['lesson_plan', 'slides', 'document', 'recording', 'other']).optional(),
  urls: z.array(z.string().trim().url()).max(10).optional(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  publishAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  section: z.string().trim().max(120).nullable().optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function canEditClassResource(
  supabase: any,
  classId: string | null,
  userId: string
): Promise<{ ok: boolean; timezone: string }> {
  if (!classId) return { ok: false, timezone: 'UTC' };
  const { data: classRow } = await supabase
    .from('classes')
    .select('id, coach_id, timezone')
    .eq('id', classId)
    .maybeSingle();
  if (!classRow) return { ok: false, timezone: 'UTC' };
  const timezone = classRow.timezone || 'UTC';
  if (classRow.coach_id === userId) return { ok: true, timezone };

  const [{ data: coCoach }, { data: subReq }, { data: taReq }] = await Promise.all([
    supabase
      .from('class_coaches')
      .select('id')
      .eq('class_id', classId)
      .eq('coach_id', userId)
      .maybeSingle(),
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
  return { ok: Boolean(coCoach || subReq || taReq), timezone };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const { resourceId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid payload.');
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data: resourceData, error: fetchError } = await supabase
    .from('resources')
    .select('*')
    .eq('id', resourceId)
    .maybeSingle();
  const resource = resourceData as any;
  if (fetchError) return mergeCookies(supabaseResponse, jsonError(fetchError.message, 400));
  if (!resource) return mergeCookies(supabaseResponse, jsonError('Resource not found.', 404));

  let classTimezone = 'UTC';
  if (session.profile.role !== 'admin') {
    if (resource.posted_by !== session.userId) {
      const access = await canEditClassResource(supabase, resource.class_id, session.userId);
      if (!access.ok) {
        return mergeCookies(supabaseResponse, jsonError('Not allowed to edit this resource.', 403));
      }
      classTimezone = access.timezone;
    } else if (resource.class_id) {
      const { data: classRow } = await supabase
        .from('classes')
        .select('timezone')
        .eq('id', resource.class_id)
        .maybeSingle();
      classTimezone = (classRow as { timezone?: string } | null)?.timezone || 'UTC';
    }
  } else if (resource.class_id) {
    const { data: classRow } = await supabase
      .from('classes')
      .select('timezone')
      .eq('id', resource.class_id)
      .maybeSingle();
    classTimezone = (classRow as { timezone?: string } | null)?.timezone || 'UTC';
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) update.title = parsed.data.title;
  if (parsed.data.description !== undefined) {
    update.description = parsed.data.description === null ? null : parsed.data.description;
  }
  if (parsed.data.type !== undefined) update.type = parsed.data.type;
  if (parsed.data.sessionDate !== undefined) {
    update.session_date = parsed.data.sessionDate;
  }
  if (parsed.data.urls !== undefined) {
    const cleaned = parsed.data.urls;
    update.urls = cleaned;
    update.url = cleaned[0] ?? null;
  }
  if (parsed.data.publishAt !== undefined) {
    update.publish_at = fromZonedTime(
      `${parsed.data.publishAt}T00:00:00`,
      classTimezone
    ).toISOString();
  }
  if (parsed.data.section !== undefined) {
    update.section = parsed.data.section === null || parsed.data.section === ''
      ? null
      : parsed.data.section;
  }

  if (Object.keys(update).length === 0) {
    return mergeCookies(supabaseResponse, NextResponse.json({ resource }));
  }

  const { data: updated, error: updateError } = await supabase
    .from('resources')
    .update(update)
    .eq('id', resourceId)
    .select('*')
    .single();

  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));
  return mergeCookies(supabaseResponse, NextResponse.json({ resource: updated }));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const { resourceId } = await params;
  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data: resourceData, error: fetchError } = await supabase
    .from('resources')
    .select('*')
    .eq('id', resourceId)
    .maybeSingle();
  const resource = resourceData as any;

  if (fetchError) return mergeCookies(supabaseResponse, jsonError(fetchError.message, 400));
  if (!resource) return mergeCookies(supabaseResponse, jsonError('Resource not found.', 404));

  if (session.profile.role !== 'admin' && resource.posted_by !== session.userId) {
    return mergeCookies(supabaseResponse, jsonError('Not allowed to delete this resource.', 403));
  }

  const bucket = process.env.PORTAL_BUCKET_RESOURCES || 'portal-resources';
  if (resource.file_path) {
    const { error: storageError } = await supabase.storage.from(bucket).remove([resource.file_path]);
    if (storageError) return mergeCookies(supabaseResponse, jsonError(storageError.message, 400));
  }

  const { error: deleteError } = await supabase.from('resources').delete().eq('id', resource.id);
  if (deleteError) return mergeCookies(supabaseResponse, jsonError(deleteError.message, 400));

  return mergeCookies(supabaseResponse, NextResponse.json({ ok: true }));
}
