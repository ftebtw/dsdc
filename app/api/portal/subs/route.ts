import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { formatInTimeZone } from 'date-fns-tz';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { sendPortalEmails } from '@/lib/email/send';
import { subRequestCreatedTemplate } from '@/lib/email/templates';
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

const ATTACHMENT_MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB
const ATTACHMENT_ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const ATTACHMENT_ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'zip',
  'txt',
  'csv',
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
]);

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isMissingTierAssignmentsTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  return (error as { code?: string }).code === '42P01';
}

function cleanFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

function fileExtension(name: string): string {
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex < 0) return '';
  return name.slice(dotIndex + 1).toLowerCase();
}

function isAllowedAttachmentFile(file: File): boolean {
  const mime = (file.type || '').toLowerCase();
  if (mime && ATTACHMENT_ALLOWED_MIME_TYPES.has(mime)) return true;
  const ext = fileExtension(file.name || '');
  return !!ext && ATTACHMENT_ALLOWED_EXTENSIONS.has(ext);
}

function normalizeTime(value: string): string {
  if (!value) return '00:00:00';
  return value.length === 5 ? `${value}:00` : value.slice(0, 8);
}

function isSessionRequestStillOpen(
  sessionDate: string,
  classTimezone: string,
  classEndTime: string,
  now = new Date()
): boolean {
  const todayInClassTimezone = formatInTimeZone(now, classTimezone, 'yyyy-MM-dd');
  if (sessionDate > todayInClassTimezone) return true;
  if (sessionDate < todayInClassTimezone) return false;

  const nowTimeInClassTimezone = formatInTimeZone(now, classTimezone, 'HH:mm:ss');
  return nowTimeInClassTimezone <= normalizeTime(classEndTime);
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
  if (attachment && attachment.size > ATTACHMENT_MAX_FILE_BYTES) {
    return jsonError('Attachment is too large. Maximum size is 15MB.');
  }
  if (attachment && !isAllowedAttachmentFile(attachment)) {
    return jsonError(
      'Unsupported attachment type. Allowed: PDF, Office docs, ZIP, text, and images.'
    );
  }

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
    return mergeCookies(supabaseResponse, jsonError('You can only request subs for your own class.', 403));
  }
  if (
    !isSessionRequestStillOpen(
      parsed.data.sessionDate,
      classRow.timezone || 'UTC',
      classRow.schedule_end_time
    )
  ) {
    return mergeCookies(
      supabaseResponse,
      jsonError('This class session has already ended. You can only request a sub before class ends.', 400)
    );
  }

  const requestId = randomUUID();
  const bucket = process.env.PORTAL_BUCKET_RESOURCES || 'portal-resources';
  let attachmentPath: string | null = null;
  let attachmentName: string | null = null;

  if (attachment) {
    const safeName = cleanFilename(attachment.name || 'attachment.bin');
    attachmentPath = `sub-ta-requests/sub/${requestId}/${safeName}`;
    attachmentName = attachment.name || safeName;
    const arrayBuffer = await attachment.arrayBuffer();
    const uploadResult = await supabase.storage
      .from(bucket)
      .upload(attachmentPath, arrayBuffer, { contentType: attachment.type || undefined, upsert: false });
    if (uploadResult.error) {
      return mergeCookies(supabaseResponse, jsonError(uploadResult.error.message, 400));
    }
  }

  const { data: subRequest, error: createError } = await supabase
    .from('sub_requests')
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

  const { data: requester } = await admin
    .from('profiles')
    .select('display_name,email')
    .eq('id', session.userId)
    .maybeSingle();

  const [eligibleTierAssignmentsResult, fallbackProfilesResult] = await Promise.all([
    admin
      .from('coach_tier_assignments')
      .select('coach_id')
      .eq('tier', classRow.eligible_sub_tier),
    admin
      .from('coach_profiles')
      .select('coach_id')
      .eq('tier', classRow.eligible_sub_tier),
  ]);

  const tierAssignmentsError = eligibleTierAssignmentsResult.error;
  if (tierAssignmentsError && !isMissingTierAssignmentsTableError(tierAssignmentsError)) {
    return mergeCookies(supabaseResponse, jsonError(tierAssignmentsError.message, 400));
  }
  if (fallbackProfilesResult.error) {
    return mergeCookies(supabaseResponse, jsonError(fallbackProfilesResult.error.message, 400));
  }

  const eligibleRows = [
    ...((eligibleTierAssignmentsResult.data ?? []) as Array<{ coach_id: string }>),
    ...((fallbackProfilesResult.data ?? []) as Array<{ coach_id: string }>),
  ];
  const recipientIds = [
    ...new Set(
      eligibleRows
        .map((row) => row.coach_id)
        .filter((coachId) => coachId && coachId !== session.userId)
    ),
  ];
  const recipients = recipientIds.length
    ? (
        await admin
          .from('profiles')
          .select('id,email,timezone,role,notification_preferences')
          .in('id', recipientIds)
          .in('role', ['coach', 'ta'])
      ).data ?? []
    : [];
  const typedRecipients = recipients as Array<{
    id: string;
    email: string;
    timezone: string;
    role: string;
    notification_preferences: Record<string, unknown> | null;
  }>;

  const allowedRecipients = typedRecipients.filter((recipient) =>
    shouldSendNotification(recipient.notification_preferences, 'sub_request_alerts', true)
  );
  const emails = uniqueEmails(allowedRecipients.map((recipient) => recipient.email));
  const portalUrl = portalPathUrl('/portal/coach/subs');
  const emailPayloads = emails.map((email) => {
    const recipient = allowedRecipients.find((profile) => profile.email?.toLowerCase() === email);
    const whenText = sessionRangeForRecipient({
      sessionDate: parsed.data.sessionDate,
      startTime: classRow.schedule_start_time,
      endTime: classRow.schedule_end_time,
      sourceTimezone: classRow.timezone,
      recipientTimezone: recipient?.timezone,
    });
    const template = subRequestCreatedTemplate({
      className: classRow.name,
      whenText,
      requestingCoach: requester?.display_name || requester?.email || 'Coach',
      portalUrl,
      preferenceUrl: profilePreferenceUrl(recipient?.role),
    });
    return { to: email, ...template };
  });
  await sendPortalEmails(emailPayloads);

  return mergeCookies(supabaseResponse, NextResponse.json({ request: subRequest }));
}

