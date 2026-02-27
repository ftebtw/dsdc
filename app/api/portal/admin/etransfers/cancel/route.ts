import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { sendPortalEmails } from "@/lib/email/send";
import { etransferCancelled } from "@/lib/email/templates";
import { DSDC_CONTACT_EMAIL } from "@/lib/constants";
import { classTypeLabel } from "@/lib/portal/labels";
import { getPortalAppUrl } from "@/lib/email/resend";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

const bodySchema = z.object({
  studentId: z.string().uuid(),
  token: z.string().uuid(),
  reason: z.string().max(400).optional(),
});

type ClassType = Database["public"]["Enums"]["class_type"];

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid request payload.");

  const admin = getSupabaseAdminClient();
  const { studentId, token, reason } = parsed.data;

  const { data: rows, error: rowsError } = await admin
    .from("enrollments")
    .select("id,student_id,class_id,status")
    .eq("student_id", studentId)
    .eq("etransfer_token", token)
    .in("status", ["pending_etransfer", "etransfer_sent"]);
  if (rowsError) return jsonError(rowsError.message, 500);
  if (!rows || rows.length === 0) {
    return jsonError("No pending e-transfer rows found for this student and token.", 404);
  }

  const { data: updatedRows, error: updateError } = await admin
    .from("enrollments")
    .update({ status: "dropped" })
    .eq("student_id", studentId)
    .eq("etransfer_token", token)
    .in("status", ["pending_etransfer", "etransfer_sent"])
    .select("id,class_id,student_id");
  if (updateError) return jsonError(updateError.message, 500);

  const matchedRows = (updatedRows ?? rows) as Array<{ id: string; class_id: string; student_id: string }>;
  const classIds = [...new Set(matchedRows.map((row) => row.class_id))];
  const [{ data: classRowsData }, { data: studentProfile }, { data: parentLinks }] = await Promise.all([
    admin.from("classes").select("id,name,type").in("id", classIds),
    admin
      .from("profiles")
      .select("id,email,display_name,locale")
      .eq("id", studentId)
      .maybeSingle(),
    admin.from("parent_student_links").select("parent_id").eq("student_id", studentId),
  ]);

  const classRows = (classRowsData ?? []) as Array<{ id: string; name: string; type: ClassType }>;
  const classItems = classRows.map((classRow) => ({
    name: classRow.name,
    type: classTypeLabel[classRow.type] || classRow.type,
  }));

  const parentLinkRows = (parentLinks ?? []) as Array<{ parent_id: string; student_id: string }>;
  const parentIds = [...new Set(parentLinkRows.map((row) => row.parent_id).filter(Boolean))] as string[];
  const parentProfiles =
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

  const registerUrl = `${getPortalAppUrl().replace(/\/$/, "")}/register`;
  const studentName = studentProfile?.display_name || studentProfile?.email || "Student";
  const messages: Array<{ to: string; subject: string; html: string; text: string }> = [];

  if (studentProfile?.email) {
    messages.push({
      to: studentProfile.email,
      ...etransferCancelled({
        studentName,
        classes: classItems,
        reason,
        contactEmail: DSDC_CONTACT_EMAIL,
        registerUrl,
        locale: studentProfile.locale === "zh" ? "zh" : "en",
      }),
    });
  }

  for (const parent of parentProfiles) {
    if (!parent?.email) continue;
    messages.push({
      to: parent.email,
      ...etransferCancelled({
        studentName,
        classes: classItems,
        reason,
        contactEmail: DSDC_CONTACT_EMAIL,
        registerUrl,
        locale: parent.locale === "zh" ? "zh" : "en",
        isParentVersion: true,
      }),
    });
  }

  if (messages.length) {
    await sendPortalEmails(messages);
  }

  return NextResponse.json({
    cancelledCount: updatedRows?.length ?? rows.length,
  });
}
