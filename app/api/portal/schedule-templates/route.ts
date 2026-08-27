import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  mode: z.enum(['single', 'term', 'coach']),
  // data is the full form state; we accept any JSON object and let the
  // client own the shape so we don't need migrations when the form evolves.
  data: z.record(z.string(), z.unknown()),
});

export async function GET(request: NextRequest) {
  const session = await requireApiRole(request, ['admin']);
  if (!session) return jsonError('Unauthorized', 401);

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data, error } = await (supabase as any)
    .from('schedule_templates')
    .select('id,name,mode,data,created_by,created_at,updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ templates: data ?? [] }));
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['admin']);
  if (!session) return jsonError('Unauthorized', 401);

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return jsonError(issue?.message || 'Invalid payload.');
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data, error } = await (supabase as any)
    .from('schedule_templates')
    .insert({
      created_by: session.userId,
      name: parsed.data.name,
      mode: parsed.data.mode,
      data: parsed.data.data,
    })
    .select('id,name,mode,data,created_by,created_at,updated_at')
    .single();

  if (error) {
    return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ template: data }));
}
