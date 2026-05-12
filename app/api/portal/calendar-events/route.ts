import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendCalendarEventNotifications } from "@/lib/email/calendar-notifications";
import { requireApiRole } from "@/lib/portal/auth";
import { isValidTimezone } from "@/lib/portal/timezone";
import { getSupabaseRouteClient, mergeCookies } from "@/lib/supabase/route";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);
const visibilitySchema = z.enum(["personal", "all_coaches", "everyone"]);

const createSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(4000).optional(),
  eventDate: dateSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  timezone: z.string().min(1).max(80).optional(),
  color: z.string().min(1).max(32).optional(),
  isAllDay: z.boolean().optional(),
  visibility: visibilitySchema.optional(),
  isImportant: z.boolean().optional(),
  attachmentName: z.string().trim().min(1).max(200).optional(),
});

const ATTACHMENT_BUCKET = process.env.PORTAL_BUCKET_CALENDAR || "portal-calendar";
const ATTACHMENT_MAX_BYTES = 25 * 1024 * 1024;
const ATTACHMENT_ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "text/plain",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ATTACHMENT_ALLOWED_EXTENSIONS = new Set([
  "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx",
  "zip", "txt", "csv", "jpg", "jpeg", "png", "webp", "gif",
]);

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function fileExtension(name: string): string {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex < 0) return "";
  return name.slice(dotIndex + 1).toLowerCase();
}

function isAllowedAttachment(file: File): boolean {
  const mime = (file.type || "").toLowerCase();
  if (mime && ATTACHMENT_ALLOWED_MIME_TYPES.has(mime)) return true;
  const ext = fileExtension(file.name || "");
  return !!ext && ATTACHMENT_ALLOWED_EXTENSIONS.has(ext);
}

function cleanFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function formString(form: FormData, key: string): string | undefined {
  const value = form.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function formBool(form: FormData, key: string): boolean | undefined {
  const value = form.get(key);
  if (typeof value !== "string") return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export async function GET(request: NextRequest) {
  const session = await requireApiRole(request, ["admin", "coach", "ta"]);
  if (!session) return jsonError("Unauthorized", 401);

  const startDate = request.nextUrl.searchParams.get("start");
  const endDate = request.nextUrl.searchParams.get("end");

  if (!startDate || !endDate) {
    return jsonError("start and end query params required");
  }
  if (!dateSchema.safeParse(startDate).success || !dateSchema.safeParse(endDate).success) {
    return jsonError("Invalid date range.");
  }

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .gte("event_date", startDate)
    .lte("event_date", endDate)
    .order("event_date")
    .order("start_time");

  if (error) {
    return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ events: data ?? [] }));
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ["admin", "coach", "ta"]);
  if (!session) return jsonError("Unauthorized", 401);

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const contentType = request.headers.get("content-type") || "";
  const isMultipart = contentType.includes("multipart/form-data");

  let rawPayload: Record<string, unknown>;
  let attachmentFile: File | null = null;

  if (isMultipart) {
    const form = await request.formData();
    const fileValue = form.get("file");
    attachmentFile = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

    rawPayload = {
      title: formString(form, "title"),
      description: formString(form, "description"),
      eventDate: formString(form, "eventDate"),
      startTime: formString(form, "startTime"),
      endTime: formString(form, "endTime"),
      timezone: formString(form, "timezone"),
      color: formString(form, "color"),
      isAllDay: formBool(form, "isAllDay"),
      visibility: formString(form, "visibility"),
      isImportant: formBool(form, "isImportant"),
      attachmentName: formString(form, "attachmentName"),
    };
  } else {
    rawPayload = await request.json();
  }

  const parsed = createSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return mergeCookies(supabaseResponse, jsonError("Invalid event payload."));
  }

  const body = parsed.data;
  const timezone = body.timezone || session.profile.timezone || "America/Vancouver";
  if (!isValidTimezone(timezone)) {
    return mergeCookies(supabaseResponse, jsonError("Invalid timezone."));
  }
  if (!body.isAllDay && body.endTime <= body.startTime) {
    return mergeCookies(supabaseResponse, jsonError("endTime must be after startTime."));
  }

  if (attachmentFile && attachmentFile.size > ATTACHMENT_MAX_BYTES) {
    return mergeCookies(supabaseResponse, jsonError("File is too large. Maximum size is 25MB."));
  }
  if (attachmentFile && !isAllowedAttachment(attachmentFile)) {
    return mergeCookies(
      supabaseResponse,
      jsonError("Unsupported file type. Allowed: PDF, Office docs, ZIP, text, and images.")
    );
  }

  let attachmentPath: string | null = null;
  let attachmentName: string | null = null;
  let attachmentMimeType: string | null = null;

  if (attachmentFile) {
    const eventId = randomUUID();
    const safeName = cleanFilename(attachmentFile.name || "attachment.bin");
    attachmentPath = `events/${session.userId}/${eventId}/${safeName}`;
    attachmentName = body.attachmentName?.trim() || attachmentFile.name || "Attachment";
    attachmentMimeType = attachmentFile.type || null;

    const arrayBuffer = await attachmentFile.arrayBuffer();
    const uploadResult = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .upload(attachmentPath, arrayBuffer, {
        contentType: attachmentFile.type || undefined,
        upsert: false,
      });

    if (uploadResult.error) {
      return mergeCookies(supabaseResponse, jsonError(uploadResult.error.message, 400));
    }
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      created_by: session.userId,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      event_date: body.eventDate,
      start_time: body.startTime,
      end_time: body.endTime,
      timezone,
      color: body.color || "#3b82f6",
      is_all_day: body.isAllDay ?? false,
      visibility: body.visibility || "personal",
      is_important:
        (body.visibility || "personal") === "personal" ? false : (body.isImportant ?? false),
      attachment_path: attachmentPath,
      attachment_name: attachmentName,
      attachment_mime_type: attachmentMimeType,
    })
    .select("*")
    .single();

  if (error) {
    if (attachmentPath) {
      await supabase.storage.from(ATTACHMENT_BUCKET).remove([attachmentPath]);
    }
    return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  }

  if (data.visibility === "everyone" || data.visibility === "all_coaches") {
    void sendCalendarEventNotifications(data, {
      display_name: session.profile.display_name,
      email: session.profile.email,
    }).catch((sendError) => {
      console.error("[calendar-event-notification] Failed:", sendError);
    });
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ event: data }));
}
