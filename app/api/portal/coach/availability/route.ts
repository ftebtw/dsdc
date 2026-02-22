import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient } from '@/lib/supabase/route';

const slotSchema = z.object({
  availableDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}/),
  endTime: z.string().regex(/^\d{2}:\d{2}/),
  timezone: z.string().min(2).max(80),
  isGroup: z.boolean().default(true),
  isPrivate: z.boolean().default(true),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isRangeValid(startTime: string, endTime: string) {
  return startTime < endTime;
}

export async function GET(request: NextRequest) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);
  const { searchParams } = new URL(request.url);
  const coachId = searchParams.get('coachId');
  const includePast = searchParams.get('includePast') === '1';

  let query = supabase
    .from('coach_availability')
    .select('*')
    .order('available_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (session.profile.role === 'admin') {
    if (coachId) query = query.eq('coach_id', coachId);
  } else {
    query = query.eq('coach_id', session.userId);
  }

  if (!includePast) {
    const today = new Date().toISOString().slice(0, 10);
    query = query.gte('available_date', today);
  }

  const { data, error } = await query;
  if (error) return jsonError(error.message, 400);
  return NextResponse.json({ slots: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const body = slotSchema.safeParse(await request.json());
  if (!body.success) return jsonError('Invalid payload.');
  if (!isRangeValid(body.data.startTime, body.data.endTime)) {
    return jsonError('End time must be later than start time.');
  }

  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);

  const { data, error } = await supabase
    .from('coach_availability')
    .insert({
      coach_id: session.userId,
      available_date: body.data.availableDate,
      start_time: body.data.startTime,
      end_time: body.data.endTime,
      timezone: body.data.timezone,
      is_group: body.data.isGroup,
      is_private: body.data.isPrivate,
    })
    .select('*')
    .single();

  if (error) return jsonError(error.message, 400);
  return NextResponse.json({ slot: data });
}
