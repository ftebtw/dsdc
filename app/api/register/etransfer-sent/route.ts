import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendPortalEmails } from "@/lib/email/send";
import { getPortalAppUrl } from "@/lib/email/resend";
import { etransferAdminSentNotice, etransferSentConfirmation } from "@/lib/email/templates";
import { classTypeLabel } from "@/lib/portal/labels";
import { getCadPriceForClassType } from "@/lib/portal/class-pricing";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

const bodySchema = z.object({
  token: z.string().uuid(),
});

type ClassType = Database["public"]["Enums"]["class_type"];

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("Invalid request payload.");
  }

  const admin = getSupabaseAdminClient();
  const token = parsed.data.token;

  const { data: pendingRows, error: pendingError } = await admin
    .from("enrollments")
    .select("id,student_id,class_id,status,etransfer_token")
    .eq("etransfer_token", token)
    .eq("status", "pending_etransfer");

  if (pendingError) return jsonError(pendingError.message, 500);
  if (!pendingRows || pendingRows.length === 0) {
    return jsonError("Invalid or expired token.", 404);
  }

  const pendingRowsTyped = pendingRows as Array<{
    id: string;
    student_id: string;
    class_id: string;
    status: string;
    etransfer_token: string | null;
  }>;
  const studentId = pendingRowsTyped[0].student_id;
  const classIds = [...new Set(pendingRowsTyped.map((row) => row.class_id))];

  const { data: updatedRows, error: updateError } = await admin
    .from("enrollments")
    .update({
      status: "etransfer_sent",
      etransfer_sent_at: new Date().toISOString(),
    })
    .eq("etransfer_token", token)
    .eq("status", "pending_etransfer")
    .select("id,class_id,student_id");

  if (updateError) return jsonError(updateError.message, 500);

  const [{ data: studentProfile }, { data: parentLinks }, { data: classesData }] = await Promise.all([
    admin
      .from("profiles")
      .select("id,email,display_name,locale")
      .eq("id", studentId)
      .maybeSingle(),
    admin
      .from("parent_student_links")
      .select("parent_id")
      .eq("student_id", studentId),
    admin
      .from("classes")
      .select("id,name,type")
      .in("id", classIds),
  ]);

  const classItems = ((classesData ?? []) as Array<{ id: string; name: string; type: ClassType }>).map(
    (classRow) => ({
      name: classRow.name,
      type: classTypeLabel[classRow.type] || classRow.type,
    })
  );
  const totalAmountCad = ((classesData ?? []) as Array<{ id: string; name: string; type: ClassType }>).reduce(
    (sum, classRow) => sum + getCadPriceForClassType(classRow.type),
    0
  );

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

  const studentName = studentProfile?.display_name || studentProfile?.email || "Student";
  const messages: Array<{ to: string; subject: string; html: string; text: string }> = [];

  if (studentProfile?.email) {
    messages.push({
      to: studentProfile.email,
      ...etransferSentConfirmation({
        studentName,
        classes: classItems,
        locale: studentProfile.locale === "zh" ? "zh" : "en",
      }),
    });
  }

  for (const parent of parentProfiles) {
    if (!parent?.email) continue;
    messages.push({
      to: parent.email,
      ...etransferSentConfirmation({
        studentName,
        classes: classItems,
        locale: parent.locale === "zh" ? "zh" : "en",
        isParentVersion: true,
      }),
    });
  }

  if (messages.length) {
    await sendPortalEmails(messages);
  }

  const { data: admins } = await admin
    .from("profiles")
    .select("email")
    .eq("role", "admin");

  const adminRows = (admins ?? []) as Array<{ email: string | null }>;
  const adminEmails = [...new Set(adminRows.map((row) => row.email?.trim()).filter(Boolean) as string[])];

  if (adminEmails.length > 0 && studentProfile?.email) {
    const adminTemplate = etransferAdminSentNotice({
      studentName: studentName,
      studentEmail: studentProfile.email,
      classes: classItems.map((classItem) => ({ name: classItem.name })),
      totalAmountCad,
      queueUrl: `${getPortalAppUrl()}/portal/admin/etransfers`,
    });
    const adminPayloads = adminEmails.map((email) => ({ to: email, ...adminTemplate }));
    await sendPortalEmails(adminPayloads);
  }

  return NextResponse.json({
    success: true,
    updatedCount: updatedRows?.length ?? pendingRowsTyped.length,
  });
}
