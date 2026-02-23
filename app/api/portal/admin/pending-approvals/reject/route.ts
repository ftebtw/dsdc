import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { getPortalAppUrl } from "@/lib/email/resend";
import { sendPortalEmails } from "@/lib/email/send";
import { pendingApprovalRejectedTemplate } from "@/lib/email/templates";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  studentId: z.string().uuid(),
  classIds: z.array(z.string().uuid()).min(1).max(20).optional(),
  reason: z.string().max(400).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid request payload.");

  const admin = getSupabaseAdminClient();
  const { studentId, classIds, reason } = parsed.data;

  let matchQuery = admin
    .from("enrollments")
    .select("id,class_id,student_id,status")
    .eq("student_id", studentId)
    .eq("status", "pending_approval");
  if (classIds?.length) {
    matchQuery = matchQuery.in("class_id", classIds);
  }
  const { data: matchedRows, error: matchError } = await matchQuery;
  if (matchError) return jsonError(matchError.message, 500);
  if (!matchedRows || matchedRows.length === 0) {
    return jsonError("No pending approval rows found for this student.", 404);
  }

  let updateQuery = admin
    .from("enrollments")
    .update({ status: "dropped" })
    .eq("student_id", studentId)
    .eq("status", "pending_approval");
  if (classIds?.length) {
    updateQuery = updateQuery.in("class_id", classIds);
  }
  const { data: updatedRows, error: updateError } = await updateQuery.select("id,class_id,student_id");
  if (updateError) return jsonError(updateError.message, 500);

  const rejectedRows = (updatedRows ?? matchedRows) as Array<{
    id: string;
    class_id: string;
    student_id: string;
  }>;
  const rejectedClassIds = [...new Set(rejectedRows.map((row) => row.class_id))];
  const [{ data: classRowsData }, { data: studentProfile }, { data: parentLinks }] = await Promise.all([
    admin.from("classes").select("id,name").in("id", rejectedClassIds),
    admin
      .from("profiles")
      .select("id,email,display_name,locale")
      .eq("id", studentId)
      .maybeSingle(),
    admin
      .from("parent_student_links")
      .select("parent_id")
      .eq("student_id", studentId),
  ]);

  const classRows = (classRowsData ?? []) as Array<{ id: string; name: string }>;
  const classList = classRows.map((classRow) => classRow.name).join(", ");
  const parentIds = [
    ...new Set(
      ((parentLinks ?? []) as Array<{ parent_id: string | null }>)
        .map((row) => row.parent_id)
        .filter((value): value is string => Boolean(value))
    ),
  ];
  const parentProfiles = parentIds.length
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
  const seenEmails = new Set<string>();

  if (studentProfile?.email) {
    const email = studentProfile.email.trim().toLowerCase();
    if (email) {
      seenEmails.add(email);
      messages.push({
        to: email,
        ...pendingApprovalRejectedTemplate({
          studentName,
          classList,
          reason,
          contactEmail: "education.dsdc@gmail.com",
          registerUrl,
          locale: studentProfile.locale === "zh" ? "zh" : "en",
        }),
      });
    }
  }

  for (const parent of parentProfiles) {
    if (!parent?.email) continue;
    const email = parent.email.trim().toLowerCase();
    if (!email || seenEmails.has(email)) continue;
    seenEmails.add(email);
    messages.push({
      to: email,
      ...pendingApprovalRejectedTemplate({
        studentName,
        classList,
        reason,
        contactEmail: "education.dsdc@gmail.com",
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
    rejectedCount: updatedRows?.length ?? matchedRows.length,
  });
}
