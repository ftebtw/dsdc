import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const bodySchema = z.object({
  locale: z.enum(['en', 'zh']),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta', 'student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid locale.');

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const { error } = await supabase
    .from('profiles')
    .update({ locale: parsed.data.locale })
    .eq('id', session.userId);

  if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 400));
  return mergeCookies(supabaseResponse, NextResponse.json({ ok: true }));
}

