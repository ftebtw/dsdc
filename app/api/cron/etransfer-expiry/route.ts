import { NextRequest, NextResponse } from "next/server";
import { sendPortalEmails } from "@/lib/email/send";
import { etransferLapsed } from "@/lib/email/templates";
import { isCronAuthorized } from "@/lib/portal/cron";
import { shouldSendAndRecord } from "@/lib/portal/notifications";
import { classTypeLabel } from "@/lib/portal/labels";
import { getPortalAppUrl } from "@/lib/email/resend";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type ClassType = Database["public"]["Enums"]["class_type"];

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

  const nowIso = new Date().toISOString();
  const { data: rowsData, error: rowsError } = await admin
    .from("enrollments")
    .select("id,student_id,class_id,status,etransfer_expires_at,etransfer_token")
    .eq("status", "pending_etransfer")
    .lt("etransfer_expires_at", nowIso);

  if (rowsError) return jsonError(rowsError.message, 500);
  const rows = (rowsData ?? []) as Array<{
    id: string;
    student_id: string;
    class_id: string;
    status: string;
    etransfer_expires_at: string | null;
    etransfer_token: string | null;
  }>;

  if (!rows.length) {
    return NextResponse.json({ expiredCount: 0, emailsSent: 0 });
  }

  const groups = new Map<
    string,
    {
      studentId: string;
      token: string;
      classIds: string[];
      rowIds: string[];
    }
  >();

  for (const row of rows) {
    if (!row.etransfer_token) continue;
    const key = `${row.student_id}:${row.etransfer_token}`;
    const current = groups.get(key);
    if (!current) {
      groups.set(key, {
        studentId: row.student_id,
        token: row.etransfer_token,
        classIds: [row.class_id],
        rowIds: [row.id],
      });
      continue;
    }
    if (!current.classIds.includes(row.class_id)) current.classIds.push(row.class_id);
    current.rowIds.push(row.id);
  }

  const allRowIds = [...new Set([...groups.values()].flatMap((group) => group.rowIds))];
  if (allRowIds.length > 0) {
    const { error: updateError } = await admin
      .from("enrollments")
      .update({ status: "etransfer_lapsed" })
      .in("id", allRowIds)
      .eq("status", "pending_etransfer");
    if (updateError) {
      return jsonError(updateError.message, 500);
    }
  }

  const studentIds = [...new Set([...groups.values()].map((group) => group.studentId))];
  const classIds = [...new Set([...groups.values()].flatMap((group) => group.classIds))];
  const [{ data: studentProfilesData }, { data: parentLinksData }, { data: classesData }] = await Promise.all([
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
    classIds.length
      ? admin.from("classes").select("id,name,type").in("id", classIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string; type: ClassType }> }),
  ]);

  const parentIds = [
    ...new Set(
      (parentLinksData ?? [])
        .map((row: { parent_id: string; student_id: string }) => row.parent_id)
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
  const classes = (classesData ?? []) as Array<{ id: string; name: string; type: ClassType }>;

  const studentMap = new Map(students.map((row) => [row.id, row]));
  const parentMap = new Map(parents.map((row) => [row.id, row]));
  const classMap = new Map(classes.map((row) => [row.id, row]));
  const parentLinks = (parentLinksData ?? []) as Array<{ parent_id: string; student_id: string }>;
  const parentIdsByStudent = new Map<string, string[]>();
  for (const link of parentLinks) {
    const list = parentIdsByStudent.get(link.student_id) ?? [];
    list.push(link.parent_id);
    parentIdsByStudent.set(link.student_id, list);
  }

  const registerUrl = `${getPortalAppUrl().replace(/\/$/, "")}/register`;
  const messages: Array<{ to: string; subject: string; html: string; text: string }> = [];
  let emailsSent = 0;

  for (const group of groups.values()) {
    const student = studentMap.get(group.studentId);
    const studentName = student?.display_name || student?.email || "Student";
    const classes = group.classIds
      .map((id) => classMap.get(id))
      .filter(Boolean)
      .map((classRow) => ({
        name: classRow!.name,
        type: classTypeLabel[classRow!.type] || classRow!.type,
      }));

    const referenceId = `${group.studentId}_${group.token}`;
    if (student?.id && student.email) {
      const shouldSend = await shouldSendAndRecord(admin, student.id, "etransfer_lapsed", referenceId);
      if (shouldSend) {
        messages.push({
          to: student.email,
          ...etransferLapsed({
            studentName,
            classes,
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
      const shouldSend = await shouldSendAndRecord(admin, parentId, "etransfer_lapsed", referenceId);
      if (!shouldSend) continue;
      messages.push({
        to: parent.email,
        ...etransferLapsed({
          studentName,
          classes,
          registerUrl,
          locale: parent.locale === "zh" ? "zh" : "en",
          isParentVersion: true,
        }),
      });
      emailsSent += 1;
    }
  }

  if (messages.length) {
    await sendPortalEmails(messages);
  }

  return NextResponse.json({
    expiredCount: allRowIds.length,
    emailsSent,
  });
}
