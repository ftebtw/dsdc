import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const bodySchema = z.object({
  classId: z.string().uuid(),
  weekNumber: z.number().int().min(1).max(200),
  title: z.string().trim().min(1).max(120).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function canManageClassWeekTitles(
  supabase: any,
  session: { userId: string; profile: { role: string } },
  classId: string
) {
  if (session.profile.role === 'admin') return true;
  if (session.profile.role !== 'coach' && session.profile.role !== 'ta') return false;

  const { data: classRow } = await supabase
    .from('classes')
    .select('id, coach_id')
    .eq('id', classId)
    .maybeSingle();

  if (!classRow) return false;
  if (classRow.coach_id === session.userId) return true;

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

  return Boolean(coCoach || subReq || taReq);
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const payload = bodySchema.safeParse(await request.json().catch(() => null));
  if (!payload.success || !payload.data.title) return jsonError('Invalid payload.');

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const canManage = await canManageClassWeekTitles(supabase, session as any, payload.data.classId);
  if (!canManage) return mergeCookies(supabaseResponse, jsonError('Not allowed for this class.', 403));

  const db = supabase as any;
  const { error } = await db.from('class_resource_week_titles').upsert(
    {
      class_id: payload.data.classId,
      week_number: payload.data.weekNumber,
      title: payload.data.title,
      updated_by: session.userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'class_id,week_number' }
  );

  if (error) {
    if (error.code === '42P01') {
      return mergeCookies(
        supabaseResponse,
        jsonError('Week title feature is not enabled yet. Please run migration 0033_resource_week_titles.sql.', 500)
      );
    }
    return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ ok: true }));
}

export async function DELETE(request: NextRequest) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const payload = bodySchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return jsonError('Invalid payload.');

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const canManage = await canManageClassWeekTitles(supabase, session as any, payload.data.classId);
  if (!canManage) return mergeCookies(supabaseResponse, jsonError('Not allowed for this class.', 403));

  const db = supabase as any;
  const { error } = await db
    .from('class_resource_week_titles')
    .delete()
    .eq('class_id', payload.data.classId)
    .eq('week_number', payload.data.weekNumber);

  if (error) {
    if (error.code === '42P01') {
      return mergeCookies(
        supabaseResponse,
        jsonError('Week title feature is not enabled yet. Please run migration 0033_resource_week_titles.sql.', 500)
      );
    }
    return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ ok: true }));
}
