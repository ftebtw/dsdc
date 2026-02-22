import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient } from '@/lib/supabase/route';

const bodySchema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(3000),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid payload.');

  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);

  const roleHint = session.profile.role === 'parent' ? 'parent' : 'student';
  const { error } = await supabase.from('anonymous_feedback').insert({
    role_hint: roleHint,
    subject: parsed.data.subject.trim(),
    body: parsed.data.body.trim(),
  });

  if (error) return jsonError(error.message, 400);
  return NextResponse.json({ ok: true });
}
