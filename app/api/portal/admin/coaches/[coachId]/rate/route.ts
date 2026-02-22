import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const bodySchema = z.object({
  hourlyRate: z.number().positive().nullable(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ coachId: string }> }
) {
  const session = await requireApiRole(request, ['admin']);
  if (!session) return jsonError('Unauthorized', 401);
  const { coachId } = await params;

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid hourly rate payload.');

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data, error } = await supabase
    .from('coach_profiles')
    .update({ hourly_rate: parsed.data.hourlyRate })
    .eq('coach_id', coachId)
    .select('*')
    .single();

  if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 400));
  return mergeCookies(supabaseResponse, NextResponse.json({ coachProfile: data }));
}
