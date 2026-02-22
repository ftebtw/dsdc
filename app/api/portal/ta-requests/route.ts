import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { sendPortalEmails } from '@/lib/email/send';
import { taRequestCreatedTemplate } from '@/lib/email/templates';
import {
  portalPathUrl,
  profilePreferenceUrl,
  sessionRangeForRecipient,
  uniqueEmails,
} from '@/lib/portal/phase-c';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient } from '@/lib/supabase/route';

const schema = z.object({
  classId: z.string().uuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(1000).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid payload.');

  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);
  const admin = getSupabaseAdminClient();

  const { data: classRow, error: classError } = await supabase
    .from('classes')
    .select('*')
    .eq('id', parsed.data.classId)
    .maybeSingle();
  if (classError) return jsonError(classError.message, 400);
  if (!classRow) return jsonError('Class not found.', 404);
  if (classRow.coach_id !== session.userId) {
    return jsonError('You can only request TA support for your own class.', 403);
  }

  const { data: taRequest, error: createError } = await supabase
    .from('ta_requests')
    .insert({
      requesting_coach_id: session.userId,
      class_id: parsed.data.classId,
      session_date: parsed.data.sessionDate,
      reason: parsed.data.reason || null,
      status: 'open',
    })
    .select('*')
    .single();
  if (createError) return jsonError(createError.message, 400);

  const [requestingProfile, taProfilesRaw] = await Promise.all([
    admin
      .from('profiles')
      .select('display_name,email')
      .eq('id', session.userId)
      .maybeSingle(),
    admin
      .from('coach_profiles')
      .select('coach_id,is_ta')
      .eq('is_ta', true)
      .neq('coach_id', session.userId),
  ]);

  const taRows = (taProfilesRaw.data ?? []) as Array<{ coach_id: string }>;
  const taIds = taRows.map((row) => row.coach_id);
  const taProfiles = taIds.length
    ? (
        await admin
          .from('profiles')
          .select('id,email,timezone,role')
          .in('id', taIds)
          .in('role', ['coach', 'ta'])
      ).data ?? []
    : [];
  const typedTaProfiles = taProfiles as Array<{
    id: string;
    email: string;
    timezone: string;
    role: string;
  }>;

  const portalUrl = portalPathUrl('/portal/coach/subs');
  const emails = uniqueEmails(typedTaProfiles.map((profile) => profile.email));
  const payloads = emails.map((email) => {
    const taProfile = typedTaProfiles.find((profile) => profile.email?.toLowerCase() === email);
    const whenText = sessionRangeForRecipient({
      sessionDate: parsed.data.sessionDate,
      startTime: classRow.schedule_start_time,
      endTime: classRow.schedule_end_time,
      sourceTimezone: classRow.timezone,
      recipientTimezone: taProfile?.timezone,
    });
    const template = taRequestCreatedTemplate({
      className: classRow.name,
      whenText,
      requestingCoach: requestingProfile.data?.display_name || requestingProfile.data?.email || 'Coach',
      portalUrl,
      preferenceUrl: profilePreferenceUrl(taProfile?.role),
    });
    return { to: email, ...template };
  });
  await sendPortalEmails(payloads);

  return NextResponse.json({ request: taRequest });
}
