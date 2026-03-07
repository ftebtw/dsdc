import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
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
import { shouldSendNotification } from '@/lib/portal/notifications';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const schema = z.object({
  classId: z.string().uuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(1000).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function cleanFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

async function parsePayload(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const fileValue = formData.get('attachment');
    const attachment = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
    return {
      parsed: schema.safeParse({
        classId: formData.get('classId'),
        sessionDate: formData.get('sessionDate'),
        reason: formData.get('reason') || undefined,
      }),
      attachment,
    };
  }

  return {
    parsed: schema.safeParse(await request.json()),
    attachment: null as File | null,
  };
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const { parsed, attachment } = await parsePayload(request);
  if (!parsed.success) return jsonError('Invalid payload.');

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const admin = getSupabaseAdminClient();

  const { data: classRow, error: classError } = await supabase
    .from('classes')
    .select('*')
    .eq('id', parsed.data.classId)
    .maybeSingle();
  if (classError) return mergeCookies(supabaseResponse, jsonError(classError.message, 400));
  if (!classRow) return mergeCookies(supabaseResponse, jsonError('Class not found.', 404));
  if (classRow.coach_id !== session.userId) {
    return mergeCookies(supabaseResponse, jsonError('You can only request TA support for your own class.', 403));
  }

  const requestId = randomUUID();
  const bucket = process.env.PORTAL_BUCKET_RESOURCES || 'portal-resources';
  let attachmentPath: string | null = null;
  let attachmentName: string | null = null;

  if (attachment) {
    const safeName = cleanFilename(attachment.name || 'attachment.bin');
    attachmentPath = `sub-ta-requests/ta/${requestId}/${safeName}`;
    attachmentName = attachment.name || safeName;
    const arrayBuffer = await attachment.arrayBuffer();
    const uploadResult = await supabase.storage
      .from(bucket)
      .upload(attachmentPath, arrayBuffer, { contentType: attachment.type || undefined, upsert: false });
    if (uploadResult.error) {
      return mergeCookies(supabaseResponse, jsonError(uploadResult.error.message, 400));
    }
  }

  const { data: taRequest, error: createError } = await supabase
    .from('ta_requests')
    .insert({
      id: requestId,
      requesting_coach_id: session.userId,
      class_id: parsed.data.classId,
      session_date: parsed.data.sessionDate,
      reason: parsed.data.reason || null,
      attachment_path: attachmentPath,
      attachment_name: attachmentName,
      status: 'open',
    })
    .select('*')
    .single();
  if (createError) {
    if (attachmentPath) {
      await supabase.storage.from(bucket).remove([attachmentPath]);
    }
    return mergeCookies(supabaseResponse, jsonError(createError.message, 400));
  }

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
          .select('id,email,timezone,role,notification_preferences')
          .in('id', taIds)
          .in('role', ['coach', 'ta'])
      ).data ?? []
    : [];
  const typedTaProfiles = taProfiles as Array<{
    id: string;
    email: string;
    timezone: string;
    role: string;
    notification_preferences: Record<string, unknown> | null;
  }>;

  const portalUrl = portalPathUrl('/portal/coach/subs');
  const optedInTaProfiles = typedTaProfiles.filter((profile) =>
    shouldSendNotification(profile.notification_preferences, 'ta_request_alerts', true)
  );
  const emails = uniqueEmails(optedInTaProfiles.map((profile) => profile.email));
  const payloads = emails.map((email) => {
    const taProfile = optedInTaProfiles.find((profile) => profile.email?.toLowerCase() === email);
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

  return mergeCookies(supabaseResponse, NextResponse.json({ request: taRequest }));
}

