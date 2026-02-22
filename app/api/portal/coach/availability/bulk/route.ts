import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient } from '@/lib/supabase/route';

const bulkSchema = z.object({
  slots: z
    .array(
      z.object({
        availableDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        startTime: z.string().regex(/^\d{2}:\d{2}/),
        endTime: z.string().regex(/^\d{2}:\d{2}/),
        timezone: z.string().min(2).max(80),
        isGroup: z.boolean().default(true),
        isPrivate: z.boolean().default(true),
      })
    )
    .min(1)
    .max(200),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const parsed = bulkSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid payload.');
  if (parsed.data.slots.some((slot) => slot.startTime >= slot.endTime)) {
    return jsonError('Each slot must have end time later than start time.');
  }

  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);
  const rows = parsed.data.slots.map((slot) => ({
    coach_id: session.userId,
    available_date: slot.availableDate,
    start_time: slot.startTime,
    end_time: slot.endTime,
    timezone: slot.timezone,
    is_group: slot.isGroup,
    is_private: slot.isPrivate,
  }));

  const { data, error } = await supabase.from('coach_availability').insert(rows).select('*');
  if (error) return jsonError(error.message, 400);

  return NextResponse.json({ slots: data ?? [], count: (data ?? []).length });
}
