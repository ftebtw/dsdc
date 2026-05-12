import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { isValidTimezone } from "@/lib/portal/timezone";
import { getSupabaseRouteClient, mergeCookies } from "@/lib/supabase/route";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);
const visibilitySchema = z.enum(["personal", "all_coaches", "everyone"]);

const updateSchema = z
  .object({
    title: z.string().min(1).max(160).optional(),
    description: z.string().max(4000).nullable().optional(),
    eventDate: dateSchema.optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    timezone: z.string().min(1).max(80).optional(),
    color: z.string().min(1).max(32).optional(),
    isAllDay: z.boolean().optional(),
    visibility: visibilitySchema.optional(),
    isImportant: z.boolean().optional(),
    attachmentName: z.string().trim().min(1).max(200).optional(),
    removeAttachment: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update.",
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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  const session = await requireApiRole(request, ["admin", "coach", "ta"]);
  if (!session) return jsonError("Unauthorized", 401);

  const { eventId } = await context.params;
  if (!eventId) return jsonError("Missing event ID.");

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
      removeAttachment: formBool(form, "removeAttachment"),
    };

    for (const key of Object.keys(rawPayload)) {
      if (rawPayload[key] === undefined) delete rawPayload[key];
    }
  } else {
    rawPayload = await request.json();
  }

  const parsed = updateSchema.safeParse(rawPayload);
  if (!parsed.success) return mergeCookies(supabaseResponse, jsonError("Invalid event payload."));

  const body = parsed.data;
  if (body.timezone !== undefined && !isValidTimezone(body.timezone)) {
    return mergeCookies(supabaseResponse, jsonError("Invalid timezone."));
  }
  if (body.startTime !== undefined && body.endTime !== undefined && body.endTime <= body.startTime) {
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

  const { data: existingData, error: existingError } = await supabase
    .from("calendar_events")
    .select("attachment_path")
    .eq("id", eventId)
    .maybeSingle();
  if (existingError) {
    return mergeCookies(supabaseResponse, jsonError(existingError.message, 500));
  }
  if (!existingData) {
    return mergeCookies(supabaseResponse, jsonError("Event not found.", 404));
  }
  const existingAttachmentPath = (existingData as { attachment_path: string | null }).attachment_path;

  let newAttachmentPath: string | null = null;
  if (attachmentFile) {
    const safeName = cleanFilename(attachmentFile.name || "attachment.bin");
    newAttachmentPath = `events/${session.userId}/${randomUUID()}/${safeName}`;
    const arrayBuffer = await attachmentFile.arrayBuffer();
    const uploadResult = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .upload(newAttachmentPath, arrayBuffer, {
        contentType: attachmentFile.type || undefined,
        upsert: false,
      });
    if (uploadResult.error) {
      return mergeCookies(supabaseResponse, jsonError(uploadResult.error.message, 400));
    }
  }

  const updateData: Record<string, unknown> = {};
  if (body.title !== undefined) updateData.title = body.title.trim();
  if (body.description !== undefined) updateData.description = body.description?.trim() || null;
  if (body.eventDate !== undefined) updateData.event_date = body.eventDate;
  if (body.startTime !== undefined) updateData.start_time = body.startTime;
  if (body.endTime !== undefined) updateData.end_time = body.endTime;
  if (body.timezone !== undefined) updateData.timezone = body.timezone;
  if (body.color !== undefined) updateData.color = body.color;
  if (body.isAllDay !== undefined) updateData.is_all_day = body.isAllDay;
  if (body.visibility !== undefined) updateData.visibility = body.visibility;
  if (body.isImportant !== undefined) updateData.is_important = body.isImportant;
  if (body.visibility === "personal") updateData.is_important = false;

  if (attachmentFile) {
    updateData.attachment_path = newAttachmentPath;
    updateData.attachment_name = body.attachmentName?.trim() || attachmentFile.name || "Attachment";
    updateData.attachment_mime_type = attachmentFile.type || null;
  } else if (body.removeAttachment) {
    updateData.attachment_path = null;
    updateData.attachment_name = null;
    updateData.attachment_mime_type = null;
  } else if (body.attachmentName) {
    updateData.attachment_name = body.attachmentName.trim();
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .update(updateData)
    .eq("id", eventId)
    .select("*")
    .single();

  if (error) {
    if (newAttachmentPath) {
      await supabase.storage.from(ATTACHMENT_BUCKET).remove([newAttachmentPath]);
    }
    return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  }

  const shouldRemoveOldFile =
    existingAttachmentPath && (attachmentFile || body.removeAttachment);
  if (shouldRemoveOldFile) {
    await supabase.storage.from(ATTACHMENT_BUCKET).remove([existingAttachmentPath!]);
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ event: data }));
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  const session = await requireApiRole(request, ["admin", "coach", "ta"]);
  if (!session) return jsonError("Unauthorized", 401);

  const { eventId } = await context.params;
  if (!eventId) return jsonError("Missing event ID.");

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const { data: existingData } = await supabase
    .from("calendar_events")
    .select("attachment_path")
    .eq("id", eventId)
    .maybeSingle();
  const existingAttachmentPath = (existingData as { attachment_path: string | null } | null)
    ?.attachment_path;

  const { error } = await supabase.from("calendar_events").delete().eq("id", eventId);

  if (error) {
    return mergeCookies(supabaseResponse, jsonError(error.message, 500));
  }

  if (existingAttachmentPath) {
    await supabase.storage.from(ATTACHMENT_BUCKET).remove([existingAttachmentPath]);
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ ok: true }));
}
