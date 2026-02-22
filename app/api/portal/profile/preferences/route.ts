import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';
import { normalizeClassReminderValue } from '@/lib/portal/notifications';

const bodySchema = z.object({
  class_reminders: z.union([z.literal('both'), z.literal('1day'), z.literal('1hour'), z.literal('none'), z.literal('day_before'), z.literal('hour_before')]).optional(),
  absence_alerts: z.boolean().optional(),
  general_updates: z.boolean().optional(),
  sub_request_alerts: z.boolean().optional(),
  ta_request_alerts: z.boolean().optional(),
  private_session_alerts: z.boolean().optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return { ...(value as Record<string, unknown>) };
}

export async function PATCH(request: NextRequest) {
  const session = await requireApiRole(request, ['coach', 'ta', 'student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid payload.');

  const body = parsed.data;
  const patch: Record<string, unknown> = {};

  if (session.profile.role === 'coach' || session.profile.role === 'ta') {
    if (body.sub_request_alerts !== undefined) patch.sub_request_alerts = body.sub_request_alerts;
    if (body.ta_request_alerts !== undefined) patch.ta_request_alerts = body.ta_request_alerts;
    if (body.private_session_alerts !== undefined) patch.private_session_alerts = body.private_session_alerts;
  } else {
    if (body.class_reminders !== undefined) {
      const normalized = normalizeClassReminderValue(body.class_reminders);
      if (!normalized) return jsonError('Invalid class_reminders value.');
      patch.class_reminders = normalized;
    }
    if (body.absence_alerts !== undefined) patch.absence_alerts = body.absence_alerts;
    if (body.general_updates !== undefined) patch.general_updates = body.general_updates;
  }

  if (Object.keys(patch).length === 0) {
    return jsonError('No allowed preference keys were provided for this role.');
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('id', session.userId)
    .maybeSingle();

  if (profileError) return mergeCookies(supabaseResponse, jsonError(profileError.message, 400));

  const existing = asObject(profile?.notification_preferences);
  const nextPreferences = { ...existing, ...patch };

  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update({ notification_preferences: nextPreferences })
    .eq('id', session.userId)
    .select('notification_preferences')
    .single();

  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));

  return mergeCookies(supabaseResponse, NextResponse.json({
    ok: true,
    preferences: updatedProfile.notification_preferences,
  }));
}

