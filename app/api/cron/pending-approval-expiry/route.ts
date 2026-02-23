import { NextRequest, NextResponse } from "next/server";
import { getPortalAppUrl } from "@/lib/email/resend";
import { sendPortalEmails } from "@/lib/email/send";
import { pendingApprovalExpiredTemplate } from "@/lib/email/templates";
import { isCronAuthorized } from "@/lib/portal/cron";
import { shouldSendAndRecord } from "@/lib/portal/notifications";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

type ExpiredEnrollmentRow = {
  id: string;
  student_id: string;
  class_id: string;
  approval_expires_at: string | null;
};

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
  const { data: expiredRowsData, error: expiredRowsError } = await admin
    .from("enrollments")
    .select("id,student_id,class_id,approval_expires_at")
    .eq("status", "pending_approval")
    .lt("approval_expires_at", nowIso);

  if (expiredRowsError) return jsonError(expiredRowsError.message, 500);
  const expiredRows = (expiredRowsData ?? []) as ExpiredEnrollmentRow[];
  if (!expiredRows.length) {
    return NextResponse.json({ expiredCount: 0, emailsSent: 0 });
  }

  const enrollmentIds = [...new Set(expiredRows.map((row) => row.id))];
  const studentIds = [...new Set(expiredRows.map((row) => row.student_id))];
  const classIds = [...new Set(expiredRows.map((row) => row.class_id))];

  const { error: updateError } = await admin
    .from("enrollments")
    .update({ status: "dropped" })
    .in("id", enrollmentIds)
    .eq("status", "pending_approval");
  if (updateError) return jsonError(updateError.message, 500);

  const [{ data: studentProfilesData }, { data: parentLinksData }, { data: classRowsData }] =
    await Promise.all([
      studentIds.length
        ? admin
            .from("profiles")
            .select("id,email,display_name,locale")
            .in("id", studentIds)
        : Promise.resolve({
            data: [] as Array<{
              id: string;
              email: string;
              display_name: string | null;
              locale: string | null;
            }>,
          }),
      studentIds.length
        ? admin
            .from("parent_student_links")
            .select("parent_id,student_id")
            .in("student_id", studentIds)
        : Promise.resolve({ data: [] as Array<{ parent_id: string; student_id: string }> }),
      classIds.length
        ? admin.from("classes").select("id,name").in("id", classIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
    ]);

  const parentIds = [
    ...new Set(
      ((parentLinksData ?? []) as Array<{ parent_id: string; student_id: string }>)
        .map((row) => row.parent_id)
        .filter(Boolean)
    ),
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

  const studentMap = new Map(
    ((studentProfilesData ?? []) as Array<{
      id: string;
      email: string;
      display_name: string | null;
      locale: string | null;
    }>).map((row) => [row.id, row])
  );
  const classMap = new Map(
    ((classRowsData ?? []) as Array<{ id: string; name: string }>).map((row) => [row.id, row.name])
  );
  const parentMap = new Map(
    (parentProfilesData as Array<{
      id: string;
      email: string;
      display_name: string | null;
      locale: string | null;
    }>).map((row) => [row.id, row])
  );

  const parentIdsByStudent = new Map<string, string[]>();
  for (const link of (parentLinksData ?? []) as Array<{ parent_id: string; student_id: string }>) {
    const list = parentIdsByStudent.get(link.student_id) ?? [];
    list.push(link.parent_id);
    parentIdsByStudent.set(link.student_id, list);
  }

  const groups = new Map<
    string,
    {
      studentId: string;
      classNames: string[];
      enrollmentIds: string[];
    }
  >();
  for (const row of expiredRows) {
    const current = groups.get(row.student_id);
    const className = classMap.get(row.class_id) || row.class_id;
    if (!current) {
      groups.set(row.student_id, {
        studentId: row.student_id,
        classNames: [className],
        enrollmentIds: [row.id],
      });
      continue;
    }
    if (!current.classNames.includes(className)) current.classNames.push(className);
    current.enrollmentIds.push(row.id);
  }

  const registerUrl = `${getPortalAppUrl().replace(/\/$/, "")}/register`;
  const messages: Array<{ to: string; subject: string; html: string; text: string }> = [];
  let emailsSent = 0;

  for (const group of groups.values()) {
    const student = studentMap.get(group.studentId);
    const classList = group.classNames.join(", ");
    const studentName = student?.display_name || student?.email || "Student";

    if (student?.id && student.email) {
      let shouldSend = false;
      for (const enrollmentId of group.enrollmentIds) {
        const recorded = await shouldSendAndRecord(
          admin,
          student.id,
          "pending_approval_expiry",
          `pending_approval_expiry:${enrollmentId}`
        );
        shouldSend = shouldSend || recorded;
      }
      if (shouldSend) {
        messages.push({
          to: student.email,
          ...pendingApprovalExpiredTemplate({
            studentName,
            classList,
            registerUrl,
            locale: student.locale === "zh" ? "zh" : "en",
          }),
        });
        emailsSent += 1;
      }
    }

    for (const parentId of parentIdsByStudent.get(group.studentId) ?? []) {
      const parent = parentMap.get(parentId);
      if (!parent?.email) continue;
      let shouldSend = false;
      for (const enrollmentId of group.enrollmentIds) {
        const recorded = await shouldSendAndRecord(
          admin,
          parentId,
          "pending_approval_expiry",
          `pending_approval_expiry:${enrollmentId}`
        );
        shouldSend = shouldSend || recorded;
      }
      if (!shouldSend) continue;
      messages.push({
        to: parent.email,
        ...pendingApprovalExpiredTemplate({
          studentName,
          classList,
          registerUrl,
          locale: parent.locale === "zh" ? "zh" : "en",
          isParentVersion: true,
        }),
      });
      emailsSent += 1;
    }
  }

  if (messages.length > 0) {
    await sendPortalEmails(messages);
  }

  return NextResponse.json({ expiredCount: enrollmentIds.length, emailsSent });
}
