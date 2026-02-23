import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPortalAppUrl } from "@/lib/email/resend";
import { sendPortalEmails } from "@/lib/email/send";
import {
  pendingApprovalAdminTemplate,
  pendingApprovalStudentTemplate,
} from "@/lib/email/templates";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseRouteClient, mergeCookies } from "@/lib/supabase/route";
import type { Database } from "@/lib/supabase/database.types";

export const runtime = "nodejs";

const bodySchema = z.object({
  classIds: z.array(z.string().uuid()).min(1).max(8),
  studentId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  locale: z.enum(["en", "zh"]).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return mergeCookies(supabaseResponse, jsonError("You must sign in before submitting enrollment.", 401));
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return mergeCookies(supabaseResponse, jsonError("Invalid request payload."));
  }

  const payload = parsed.data;
  if (new Set(payload.classIds).size !== payload.classIds.length) {
    return mergeCookies(supabaseResponse, jsonError("Duplicate classes are not allowed."));
  }

  const admin = getSupabaseAdminClient();
  const [{ data: requesterProfile }, { data: studentProfile }] = await Promise.all([
    admin.from("profiles").select("id,role").eq("id", user.id).maybeSingle(),
    admin
      .from("profiles")
      .select("id,role,email,display_name,locale")
      .eq("id", payload.studentId)
      .maybeSingle(),
  ]);

  if (!requesterProfile) {
    return mergeCookies(supabaseResponse, jsonError("Could not verify your account.", 401));
  }
  if (!studentProfile || studentProfile.role !== "student") {
    return mergeCookies(supabaseResponse, jsonError("Invalid student account.", 400));
  }

  if (requesterProfile.role === "student") {
    if (requesterProfile.id !== payload.studentId) {
      return mergeCookies(
        supabaseResponse,
        jsonError("Students can only submit enrollment for their own account.", 403)
      );
    }
  } else if (requesterProfile.role === "parent") {
    const parentId = payload.parentId ?? requesterProfile.id;
    if (parentId !== requesterProfile.id) {
      return mergeCookies(supabaseResponse, jsonError("Invalid parent account for this request.", 403));
    }
    const { data: link } = await admin
      .from("parent_student_links")
      .select("id")
      .eq("parent_id", parentId)
      .eq("student_id", payload.studentId)
      .maybeSingle();
    if (!link) {
      return mergeCookies(supabaseResponse, jsonError("Parent is not linked to this student.", 403));
    }
  } else {
    return mergeCookies(
      supabaseResponse,
      jsonError("Only student and parent accounts can use this registration flow.", 403)
    );
  }

  const { data: activeTerm } = await admin
    .from("terms")
    .select("id")
    .eq("is_active", true)
    .maybeSingle();
  if (!activeTerm) {
    return mergeCookies(supabaseResponse, jsonError("No active term is available for enrollment.", 400));
  }

  const { data: classRowsData, error: classRowsError } = await admin
    .from("classes")
    .select("id,name,max_students,term_id")
    .in("id", payload.classIds)
    .eq("term_id", activeTerm.id);
  if (classRowsError) {
    return mergeCookies(supabaseResponse, jsonError(classRowsError.message, 400));
  }

  const classRows = (classRowsData ?? []) as Array<{
    id: string;
    name: string;
    max_students: number;
    term_id: string;
  }>;
  if (classRows.length !== payload.classIds.length) {
    return mergeCookies(
      supabaseResponse,
      jsonError("One or more selected classes are invalid for the active term.", 400)
    );
  }

  const [existingStatusRowsResult, classEnrollmentRowsResult] = await Promise.all([
    admin
      .from("enrollments")
      .select("id,class_id,status")
      .eq("student_id", payload.studentId)
      .in("class_id", payload.classIds)
      .in("status", ["active", "pending_etransfer", "etransfer_sent", "pending_approval"]),
    admin
      .from("enrollments")
      .select("class_id,status")
      .in("class_id", payload.classIds)
      .in("status", ["active", "pending_etransfer", "etransfer_sent", "pending_approval"]),
  ]);

  if (existingStatusRowsResult.error) {
    return mergeCookies(supabaseResponse, jsonError(existingStatusRowsResult.error.message, 400));
  }
  if (classEnrollmentRowsResult.error) {
    return mergeCookies(supabaseResponse, jsonError(classEnrollmentRowsResult.error.message, 400));
  }

  if ((existingStatusRowsResult.data ?? []).length > 0) {
    return mergeCookies(
      supabaseResponse,
      jsonError("Student is already enrolled or has a pending reservation in one of these classes.", 400)
    );
  }

  const countByClassId = new Map<string, number>();
  for (const row of classEnrollmentRowsResult.data ?? []) {
    const count = countByClassId.get(row.class_id) ?? 0;
    countByClassId.set(row.class_id, count + 1);
  }

  const fullClass = classRows.find((classRow) => {
    const count = countByClassId.get(classRow.id) ?? 0;
    return count >= Number(classRow.max_students);
  });
  if (fullClass) {
    return mergeCookies(
      supabaseResponse,
      jsonError(`${fullClass.name} is full. Please pick another class.`, 400)
    );
  }

  const rows = payload.classIds.map((classId) => ({
    student_id: payload.studentId,
    class_id: classId,
    status: "pending_approval",
    payment_method: "already_paid",
    etransfer_expires_at: null,
    etransfer_sent_at: null,
    etransfer_token: null,
  }));

  const { data: upsertedRows, error: upsertError } = await admin
    .from("enrollments")
    .upsert(rows as unknown as Database["public"]["Tables"]["enrollments"]["Insert"][], {
      onConflict: "student_id,class_id",
    })
    .select("id,class_id,status");

  if (upsertError) {
    return mergeCookies(supabaseResponse, jsonError(upsertError.message, 400));
  }

  const classList = classRows.map((classRow) => classRow.name).join(", ");
  const studentName = studentProfile.display_name || studentProfile.email;
  const locale = payload.locale ?? (studentProfile.locale === "zh" ? "zh" : "en");
  const portalBase = getPortalAppUrl().replace(/\/$/, "");
  const redirectUrl = `/register/pending-approval?student=${encodeURIComponent(payload.studentId)}&lang=${locale}`;

  const { data: parentLinks } = await admin
    .from("parent_student_links")
    .select("parent_id")
    .eq("student_id", payload.studentId);
  const parentIds = [
    ...new Set(
      ((parentLinks ?? []) as Array<{ parent_id: string | null }>)
        .map((link) => link.parent_id)
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

  const { data: adminProfiles } = await admin
    .from("profiles")
    .select("email")
    .eq("role", "admin");

  const messages: Array<{ to: string; subject: string; html: string; text: string }> = [];
  const seenEmails = new Set<string>();

  if (studentProfile.email) {
    const email = studentProfile.email.trim().toLowerCase();
    if (email) {
      seenEmails.add(email);
      messages.push({
        to: email,
        ...pendingApprovalStudentTemplate({
          studentName,
          classList,
          portalUrl: `${portalBase}/portal/login`,
          locale,
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
      ...pendingApprovalStudentTemplate({
        studentName,
        classList,
        portalUrl: `${portalBase}/portal/login`,
        locale: parent.locale === "zh" ? "zh" : "en",
        isParentVersion: true,
      }),
    });
  }

  const adminEmails = [
    ...new Set(
      ((adminProfiles ?? []) as Array<{ email: string | null }>)
        .map((row) => row.email?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value))
    ),
  ];
  if (adminEmails.length > 0) {
    const adminTemplate = pendingApprovalAdminTemplate({
      studentName,
      studentEmail: studentProfile.email,
      classList,
      queueUrl: `${portalBase}/portal/admin/pending-approvals`,
    });
    for (const adminEmail of adminEmails) {
      messages.push({
        to: adminEmail,
        ...adminTemplate,
      });
    }
  }

  if (messages.length > 0) {
    await sendPortalEmails(messages);
  }

  return mergeCookies(
    supabaseResponse,
    NextResponse.json({
      redirectUrl,
      enrollmentCount: upsertedRows?.length ?? rows.length,
    })
  );
}
