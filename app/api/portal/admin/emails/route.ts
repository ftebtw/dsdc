import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { sendPortalEmail } from "@/lib/email/send";
import type { EmailAttachment } from "@/lib/email/send";
import {
  resolveAdminEmailRecipients,
  type AdminEmailTargetType,
} from "@/lib/portal/admin-email-recipients";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024; // 25MB per file
const ALLOWED_MIME = new Set([
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
  "audio/mpeg",
  "audio/mp4",
  "video/mp4",
]);
const ALLOWED_EXT = new Set([
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "zip",
  "txt",
  "csv",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "mp3",
  "m4a",
  "mp4",
]);

const targetSchema = z.object({
  targetType: z.enum(["person", "all_students", "all_coaches", "class", "custom"]),
  id: z.string().uuid().optional(),
  ids: z.array(z.string().uuid()).max(500).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot < 0 ? "" : name.slice(dot + 1).toLowerCase();
}

function isAllowedAttachment(file: File): boolean {
  const mime = (file.type || "").toLowerCase();
  if (mime && ALLOWED_MIME.has(mime)) return true;
  const ext = fileExtension(file.name || "");
  return Boolean(ext && ALLOWED_EXT.has(ext));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bodyToHtml(body: string, senderName: string): string {
  // Turn plain-text paragraphs into HTML; preserve line breaks; add a soft
  // signature line so recipients see who inside DSDC sent it.
  const paragraphs = body
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 12px;line-height:1.5;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#0f172a;">${paragraphs}<p style="margin:16px 0 0;color:#475569;font-size:12px;">— ${escapeHtml(senderName)} · DSDC</p></div>`;
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return jsonError("Multipart form data required.");
  }

  const form = await request.formData();

  const parsed = targetSchema.safeParse({
    targetType: form.get("targetType"),
    id: (form.get("id") as string) || undefined,
    ids: form.getAll("ids").map(String).filter(Boolean),
  });
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid target.");

  const subject = String(form.get("subject") || "").trim();
  const body = String(form.get("body") || "").trim();
  const forceSend = String(form.get("forceSend") || "") === "true";

  if (subject.length < 1 || subject.length > 200) {
    return jsonError("Subject must be 1–200 characters.");
  }
  if (body.length < 1 || body.length > 20000) {
    return jsonError("Body must be 1–20,000 characters.");
  }

  // Collect + validate attachments.
  const rawFiles: File[] = [];
  for (const value of form.getAll("attachments")) {
    if (value instanceof File && value.size > 0) rawFiles.push(value);
  }
  if (rawFiles.length > MAX_ATTACHMENTS) {
    return jsonError(`Attach up to ${MAX_ATTACHMENTS} files.`);
  }
  for (const file of rawFiles) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      return jsonError(`"${file.name}" is over the 25MB per-file limit.`);
    }
    if (!isAllowedAttachment(file)) {
      return jsonError(`"${file.name}" isn't an accepted file type.`);
    }
  }

  const admin = getSupabaseAdminClient();
  const recipients = await resolveAdminEmailRecipients(admin, {
    type: parsed.data.targetType as AdminEmailTargetType,
    id: parsed.data.id,
    ids: parsed.data.ids,
  });

  const wanted = forceSend ? recipients : recipients.filter((r) => r.wantsGeneralUpdates);
  if (wanted.length === 0) {
    return jsonError(
      forceSend
        ? "No recipients resolved for this target."
        : "Every matched recipient has opted out of general updates. Enable Force send to reach them anyway."
    );
  }

  // Read attachment bytes once and reuse across recipients — otherwise the
  // Buffers get consumed after the first send.
  const attachments: EmailAttachment[] = [];
  for (const file of rawFiles) {
    const buffer = Buffer.from(await file.arrayBuffer());
    attachments.push({
      filename: file.name,
      content: buffer,
      contentType: file.type || undefined,
    });
  }

  const replyTo = session.profile.email || undefined;
  const senderName = session.profile.display_name || session.profile.email || "DSDC Admin";
  const html = bodyToHtml(body, senderName);

  // Fire each send individually so per-recipient failures don't take the
  // whole batch down. We rely on Resend's own send concurrency; sending in
  // parallel keeps latency in check for the admin.
  const outcomes = await Promise.all(
    wanted.map((recipient) =>
      sendPortalEmail({
        to: recipient.email,
        subject,
        html,
        text: body,
        replyTo,
        attachments,
      })
    )
  );
  const failedCount = outcomes.filter((r) => !r.ok).length;

  const attachmentManifest = rawFiles.map((file) => ({
    name: file.name,
    size: file.size,
    contentType: file.type || null,
  }));
  const targetSpecPersisted: Record<string, unknown> = { type: parsed.data.targetType };
  if (parsed.data.id) targetSpecPersisted.id = parsed.data.id;
  if (parsed.data.ids && parsed.data.ids.length > 0) targetSpecPersisted.ids = parsed.data.ids;

  const { error: auditError } = await (admin as any).from("admin_emails").insert({
    sent_by: session.userId,
    subject,
    body,
    target_type: parsed.data.targetType,
    target_spec: targetSpecPersisted,
    recipient_count: wanted.length,
    force_send: forceSend,
    attachment_manifest: attachmentManifest,
    reply_to: replyTo || null,
  });
  if (auditError) {
    console.error("[admin-emails] audit insert failed", auditError);
  }

  return NextResponse.json({
    ok: true,
    recipientCount: wanted.length,
    skippedForOptOut: forceSend ? 0 : recipients.length - wanted.length,
    failedCount,
  });
}

export async function GET(request: NextRequest) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);
  const admin = getSupabaseAdminClient();
  const { data, error } = await (admin as any)
    .from("admin_emails")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ sends: data ?? [] });
}
