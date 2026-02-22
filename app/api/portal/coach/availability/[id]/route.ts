import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const updateSchema = z.object({
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);
  const { id } = await params;

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid payload.');
  if (!isRangeValid(parsed.data.startTime, parsed.data.endTime)) {
    return jsonError('End time must be later than start time.');
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const { data: slot, error: fetchError } = await supabase
    .from('coach_availability')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (fetchError) return mergeCookies(supabaseResponse, jsonError(fetchError.message, 400));
  if (!slot) return mergeCookies(supabaseResponse, jsonError('Availability slot not found.', 404));
  if (session.profile.role !== 'admin' && slot.coach_id !== session.userId) {
    return mergeCookies(supabaseResponse, jsonError('Not allowed to update this slot.', 403));
  }

  const { data, error } = await supabase
    .from('coach_availability')
    .update({
      available_date: parsed.data.availableDate,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime,
      timezone: parsed.data.timezone,
      is_group: parsed.data.isGroup,
      is_private: parsed.data.isPrivate,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 400));
  return mergeCookies(supabaseResponse, NextResponse.json({ slot: data }));
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

  const { data: slot, error: fetchError } = await supabase
    .from('coach_availability')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (fetchError) return mergeCookies(supabaseResponse, jsonError(fetchError.message, 400));
  if (!slot) return mergeCookies(supabaseResponse, jsonError('Availability slot not found.', 404));
  if (session.profile.role !== 'admin' && slot.coach_id !== session.userId) {
    return mergeCookies(supabaseResponse, jsonError('Not allowed to delete this slot.', 403));
  }

  const { data: confirmedSession, error: confirmedError } = await supabase
    .from('private_sessions')
    .select('id')
    .eq('availability_id', id)
    .eq('status', 'confirmed')
    .limit(1)
    .maybeSingle();
  if (confirmedError) return mergeCookies(supabaseResponse, jsonError(confirmedError.message, 400));
  if (confirmedSession) {
    return mergeCookies(supabaseResponse, jsonError('Cannot delete availability with a confirmed private session.', 409));
  }

  const { error } = await supabase.from('coach_availability').delete().eq('id', id);
  if (error) return mergeCookies(supabaseResponse, jsonError(error.message, 400));
  return mergeCookies(supabaseResponse, NextResponse.json({ ok: true }));
}
