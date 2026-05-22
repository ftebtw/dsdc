import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const patchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(12000).nullable().optional(),
  externalUrls: z.array(z.string().trim().url()).max(10).optional(),
  dueDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate must be YYYY-MM-DD')
    .nullable()
    .optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function fetchAndAuthorize(
  supabase: any,
  assignmentId: string,
  userId: string,
  role: string
): Promise<{ ok: boolean; assignment?: any; reason?: string; status?: number }> {
  const { data: assignment } = await supabase
    .from('homework_assignments')
    .select('*')
    .eq('id', assignmentId)
    .maybeSingle();
  if (!assignment) return { ok: false, reason: 'Assignment not found.', status: 404 };
  if (role === 'admin') return { ok: true, assignment };

  const { data: classRow } = await supabase
    .from('classes')
    .select('id, coach_id')
    .eq('id', assignment.class_id)
    .maybeSingle();
  if (!classRow) return { ok: false, reason: 'Class not found.', status: 404 };
  if (classRow.coach_id === userId) return { ok: true, assignment };

  const [{ data: coCoach }, { data: subReq }, { data: taReq }] = await Promise.all([
    supabase
      .from('class_coaches')
      .select('id')
      .eq('class_id', assignment.class_id)
      .eq('coach_id', userId)
      .maybeSingle(),
    supabase
      .from('sub_requests')
      .select('id')
      .eq('class_id', assignment.class_id)
      .eq('accepting_coach_id', userId)
      .eq('status', 'accepted')
      .maybeSingle(),
    supabase
      .from('ta_requests')
      .select('id')
      .eq('class_id', assignment.class_id)
      .eq('accepting_ta_id', userId)
      .eq('status', 'accepted')
      .maybeSingle(),
  ]);
  if (coCoach || subReq || taReq) return { ok: true, assignment };
  return { ok: false, reason: 'Not allowed.', status: 403 };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as unknown;
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid payload.');
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const auth = await fetchAndAuthorize(supabase, id, session.userId, session.profile.role);
  if (!auth.ok) {
    return mergeCookies(supabaseResponse, jsonError(auth.reason || 'Not allowed.', auth.status ?? 403));
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) update.title = parsed.data.title;
  if (parsed.data.description !== undefined) {
    update.description = parsed.data.description === null ? null : parsed.data.description;
  }
  if (parsed.data.externalUrls !== undefined) update.external_urls = parsed.data.externalUrls;
  if (parsed.data.dueDate !== undefined) update.due_date = parsed.data.dueDate;
  if (Object.keys(update).length === 0) {
    return mergeCookies(supabaseResponse, NextResponse.json({ assignment: auth.assignment }));
  }

  const { data: updated, error } = await (supabase as any)
    .from('homework_assignments')
    .update(update)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return mergeCookies(supabaseResponse, jsonError(error.message, 400));
  }
  return mergeCookies(supabaseResponse, NextResponse.json({ assignment: updated }));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const { id } = await params;
  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const auth = await fetchAndAuthorize(supabase, id, session.userId, session.profile.role);
  if (!auth.ok) {
    return mergeCookies(supabaseResponse, jsonError(auth.reason || 'Not allowed.', auth.status ?? 403));
  }

  // Best-effort: remove the assignment's attached file from storage.
  if (auth.assignment?.file_path) {
    const bucket = process.env.PORTAL_BUCKET_RESOURCES || 'portal-resources';
    await getSupabaseAdminClient().storage.from(bucket).remove([auth.assignment.file_path]);
  }

  const { error } = await (supabase as any)
    .from('homework_assignments')
    .delete()
    .eq('id', id);

  if (error) {
    return mergeCookies(supabaseResponse, jsonError(error.message, 400));
  }
  return mergeCookies(supabaseResponse, NextResponse.json({ ok: true }));
}
