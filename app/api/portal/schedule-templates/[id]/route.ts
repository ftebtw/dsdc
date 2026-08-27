import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  mode: z.enum(['single', 'term', 'coach']).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['admin']);
  if (!session) return jsonError('Unauthorized', 401);

  const { id } = await params;
  if (!id) return jsonError('Missing template id.');

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return jsonError(issue?.message || 'Invalid payload.');
  }
  if (Object.keys(parsed.data).length === 0) {
    return jsonError('Nothing to update.');
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data, error } = await (supabase as any)
    .from('schedule_templates')
    .update(parsed.data)
    .eq('id', id)
    .select('id,name,mode,data,created_by,created_at,updated_at')
    .single();

  if (error) {
    return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  }
  if (!data) {
    return mergeCookies(supabaseResponse, jsonError('Template not found.', 404));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ template: data }));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['admin']);
  if (!session) return jsonError('Unauthorized', 401);

  const { id } = await params;
  if (!id) return jsonError('Missing template id.');

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { error } = await (supabase as any)
    .from('schedule_templates')
    .delete()
    .eq('id', id);

  if (error) {
    return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ ok: true }));
}
