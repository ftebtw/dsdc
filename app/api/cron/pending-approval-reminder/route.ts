import { NextRequest, NextResponse } from "next/server";
import { getPortalAppUrl } from "@/lib/email/resend";
import { sendPortalEmails } from "@/lib/email/send";
import { pendingApprovalAdminReminderTemplate } from "@/lib/email/templates";
import { isCronAuthorized } from "@/lib/portal/cron";
import { shouldSendAndRecord } from "@/lib/portal/notifications";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function formatAgeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) return "just now";
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return jsonError("Unauthorized", 401);
  }

  const admin = getSupabaseAdminClient();
  const { error: schemaError } = await admin.from("enrollments").select("approval_expires_at").limit(0);
  if (schemaError) {
    return NextResponse.json({ skipped: true, reason: "pending approval expiry not deployed" });
  }

  const nowIso = new Date().toISOString();
  const { data: pendingRowsData, error: pendingRowsError } = await admin
    .from("enrollments")
    .select("id,student_id,enrolled_at,approval_expires_at")
    .eq("status", "pending_approval")
    .gt("approval_expires_at", nowIso)
    .order("enrolled_at", { ascending: true });

  if (pendingRowsError) return jsonError(pendingRowsError.message, 500);
  const pendingRows = (pendingRowsData ?? []) as Array<{
    id: string;
    student_id: string;
    enrolled_at: string;
    approval_expires_at: string | null;
  }>;

  if (!pendingRows.length) {
    return NextResponse.json({ sentCount: 0, skipped: true, reason: "no pending approvals" });
  }

  const { data: adminProfilesData, error: adminProfilesError } = await admin
    .from("profiles")
    .select("id,email")
    .eq("role", "admin");
  if (adminProfilesError) return jsonError(adminProfilesError.message, 500);

  const adminProfiles = (adminProfilesData ?? []) as Array<{ id: string; email: string | null }>;
  if (!adminProfiles.length) {
    return NextResponse.json({ sentCount: 0, skipped: true, reason: "no admin recipients" });
  }

  const oldestSubmittedAt = pendingRows[0]?.enrolled_at ?? new Date().toISOString();
  const pendingCount = pendingRows.length;
  const referenceDate = new Date().toISOString().slice(0, 10);
  const referenceId = `pending_approval_reminder:${referenceDate}`;
  const queueUrl = `${getPortalAppUrl().replace(/\/$/, "")}/portal/admin/pending-approvals`;
  const template = pendingApprovalAdminReminderTemplate({
    pendingCount,
    oldestSubmittedAtText: formatAgeAgo(oldestSubmittedAt),
    queueUrl,
  });

  const messages: Array<{ to: string; subject: string; html: string; text: string }> = [];

  for (const profile of adminProfiles) {
    if (!profile.email) continue;
    const shouldSend = await shouldSendAndRecord(
      admin,
      profile.id,
      "pending_approval_reminder",
      referenceId
    );
    if (!shouldSend) continue;
    messages.push({
      to: profile.email,
      ...template,
    });
  }

  if (messages.length > 0) {
    await sendPortalEmails(messages);
  }

  return NextResponse.json({ sentCount: messages.length, pendingCount });
}
