import { addHours, subHours } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { sendPortalEmails } from "@/lib/email/send";
import { etransferReminder } from "@/lib/email/templates";
import { isCronAuthorized } from "@/lib/portal/cron";
import { shouldSendAndRecord } from "@/lib/portal/notifications";
import { getPortalAppUrl } from "@/lib/email/resend";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) return jsonError("Unauthorized", 401);

  const admin = getSupabaseAdminClient();
  const { error: schemaError } = await admin.from("enrollments").select("etransfer_token").limit(0);
  if (schemaError) {
    return NextResponse.json({ skipped: true, reason: "etransfer not deployed" });
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const elevenHoursAgoIso = subHours(now, 11).toISOString();
  const inTwelveHoursIso = addHours(now, 12).toISOString();

  const { data: rowsData, error: rowsError } = await admin
    .from("enrollments")
    .select("id,student_id,class_id,status,created_at,etransfer_expires_at,etransfer_token")
    .eq("status", "pending_etransfer")
    .lt("created_at", elevenHoursAgoIso)
    .gt("etransfer_expires_at", nowIso)
    .lte("etransfer_expires_at", inTwelveHoursIso);

  if (rowsError) return jsonError(rowsError.message, 500);
  const rows = (rowsData ?? []) as Array<{
    id: string;
    student_id: string;
    class_id: string;
    status: string;
    created_at: string;
    etransfer_expires_at: string | null;
    etransfer_token: string | null;
  }>;
  if (!rows.length) {
    return NextResponse.json({ sentCount: 0 });
  }

  const groups = new Map<
    string,
    {
      studentId: string;
      token: string;
    }
  >();
  for (const row of rows) {
    if (!row.etransfer_token) continue;
    const key = `${row.student_id}:${row.etransfer_token}`;
    if (!groups.has(key)) {
      groups.set(key, {
        studentId: row.student_id,
        token: row.etransfer_token,
      });
    }
  }

  const studentIds = [...new Set([...groups.values()].map((group) => group.studentId))];
  const [{ data: studentProfilesData }, { data: parentLinksData }] = await Promise.all([
    studentIds.length
      ? admin
          .from("profiles")
          .select("id,email,display_name,locale")
          .in("id", studentIds)
      : Promise.resolve({ data: [] as Array<{ id: string; email: string; display_name: string | null; locale: string }> }),
    studentIds.length
      ? admin
          .from("parent_student_links")
          .select("parent_id,student_id")
          .in("student_id", studentIds)
      : Promise.resolve({ data: [] as Array<{ parent_id: string; student_id: string }> }),
  ]);

  const parentLinks = (parentLinksData ?? []) as Array<{ parent_id: string; student_id: string }>;
  const parentIds = [
    ...new Set(parentLinks.map((row) => row.parent_id).filter(Boolean)),
  ] as string[];
  const parentProfilesData =
    parentIds.length > 0
      ? (
          (
            await admin
              .from("profiles")
              .select("id,email,display_name,locale")
              .in("id", parentIds)
              .eq("role", "parent")
          ).data ?? []
        )
      : [];

  const students = (studentProfilesData ?? []) as Array<{
    id: string;
    email: string;
    display_name: string | null;
    locale: string;
  }>;
  const parents = parentProfilesData as Array<{
    id: string;
    email: string;
    display_name: string | null;
    locale: string;
  }>;

  const studentMap = new Map(students.map((row) => [row.id, row]));
  const parentMap = new Map(parents.map((row) => [row.id, row]));
  const parentIdsByStudent = new Map<string, string[]>();
  for (const link of parentLinks) {
    const current = parentIdsByStudent.get(link.student_id) ?? [];
    current.push(link.parent_id);
    parentIdsByStudent.set(link.student_id, current);
  }

  const appUrl = getPortalAppUrl().replace(/\/$/, "");
  const messages: Array<{ to: string; subject: string; html: string; text: string }> = [];
  let sentCount = 0;

  for (const group of groups.values()) {
    const student = studentMap.get(group.studentId);
    const studentName = student?.display_name || student?.email || "Student";
    const pendingPageUrl = `${appUrl}/register/etransfer-pending?student=${encodeURIComponent(group.studentId)}&token=${encodeURIComponent(group.token)}&lang=${student?.locale === "zh" ? "zh" : "en"}`;
    const referenceId = `${group.studentId}_${group.token}`;

    if (student?.id && student.email) {
      const shouldSend = await shouldSendAndRecord(
        admin,
        student.id,
        "etransfer_12h_reminder",
        referenceId
      );
      if (shouldSend) {
        messages.push({
          to: student.email,
          ...etransferReminder({
            studentName,
            pendingPageUrl,
            locale: student.locale === "zh" ? "zh" : "en",
          }),
        });
        sentCount += 1;
      }
    }

    for (const parentId of parentIdsByStudent.get(group.studentId) ?? []) {
      const parent = parentMap.get(parentId);
      if (!parent?.email) continue;
      const shouldSend = await shouldSendAndRecord(
        admin,
        parentId,
        "etransfer_12h_reminder",
        referenceId
      );
      if (!shouldSend) continue;
      messages.push({
        to: parent.email,
        ...etransferReminder({
          studentName,
          pendingPageUrl,
          locale: parent.locale === "zh" ? "zh" : "en",
        }),
      });
      sentCount += 1;
    }
  }

  if (messages.length) {
    await sendPortalEmails(messages);
  }

  return NextResponse.json({ sentCount });
}
