import { randomUUID } from "crypto";
import { formatInTimeZone } from "date-fns-tz";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendPortalEmails } from "@/lib/email/send";
import { etransferInstructions } from "@/lib/email/templates";
import { classTypeLabel } from "@/lib/portal/labels";
import { getProratedCadPrice } from "@/lib/portal/class-pricing";
import { getPortalAppUrl } from "@/lib/email/resend";
import { SESSIONS_PER_TERM } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";
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

type ClassType = Database["public"]["Enums"]["class_type"];

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const supabaseResponse = NextResponse.next();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = rateLimit(`register:${ip}`, 10, 15 * 60 * 1000);
  if (!allowed) {
    return mergeCookies(supabaseResponse, jsonError("Too many requests. Please try again in a few minutes.", 429));
  }

  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return mergeCookies(supabaseResponse, jsonError("You must sign in before reserving a spot.", 401));
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
      .select("id,role,email,display_name,locale,timezone")
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
    if (user.id !== payload.studentId) {
      return mergeCookies(
        supabaseResponse,
        jsonError("Students can only reserve spots for their own account.", 403)
      );
    }
  } else if (requesterProfile.role === "parent") {
    const parentId = payload.parentId ?? user.id;
    if (parentId !== user.id) {
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
    .select("id,name,end_date,weeks")
    .eq("is_active", true)
    .maybeSingle();
  if (!activeTerm) {
    return mergeCookies(supabaseResponse, jsonError("No active term is available for enrollment.", 400));
  }

  const { data: classRowsData, error: classRowsError } = await admin
    .from("classes")
    .select("id,name,type,max_students,term_id")
    .in("id", payload.classIds)
    .eq("term_id", activeTerm.id);
  if (classRowsError) {
    return mergeCookies(supabaseResponse, jsonError(classRowsError.message, 400));
  }

  const classRows = (classRowsData ?? []) as Array<{
    id: string;
    name: string;
    type: ClassType;
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

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const expiresAtIso = expiresAt.toISOString();
  const rows = payload.classIds.map((classId) => ({
    student_id: payload.studentId,
    class_id: classId,
    status: "pending_etransfer",
    payment_method: "etransfer",
    etransfer_expires_at: expiresAtIso,
    etransfer_token: token,
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

  const totalWeeks =
    typeof activeTerm.weeks === "number" && activeTerm.weeks > 0
      ? activeTerm.weeks
      : SESSIONS_PER_TERM;
  const totalAmountCad = classRows.reduce(
    (sum, classRow) =>
      sum + getProratedCadPrice(classRow.type, activeTerm.end_date, totalWeeks),
    0
  );
  const locale = payload.locale ?? (studentProfile.locale === "zh" ? "zh" : "en");
  const portalBase = getPortalAppUrl().replace(/\/$/, "");
  const pendingPageUrl = `${portalBase}/register/etransfer-pending?student=${encodeURIComponent(payload.studentId)}&token=${encodeURIComponent(token)}&lang=${locale}`;
  const redirectUrl = `/register/etransfer-pending?student=${encodeURIComponent(payload.studentId)}&token=${encodeURIComponent(token)}&lang=${locale}`;

  const parentIds = new Set<string>();
  if (payload.parentId) parentIds.add(payload.parentId);
  const { data: parentLinksData } = await admin
    .from("parent_student_links")
    .select("parent_id")
    .eq("student_id", payload.studentId);
  const parentLinks = (parentLinksData ?? []) as Array<{ parent_id: string }>;
  for (const row of parentLinks) {
    if (row.parent_id) parentIds.add(row.parent_id);
  }

  const parentProfiles =
    parentIds.size > 0
      ? (
          (
            await admin
              .from("profiles")
              .select("id,email,display_name,locale")
              .in("id", [...parentIds])
              .eq("role", "parent")
          ).data ?? []
        )
      : [];

  const etransferEmail = process.env.NEXT_PUBLIC_ETRANSFER_EMAIL?.trim() || "education.dsdc@gmail.com";
  const classItems = classRows.map((classRow) => ({
    name: classRow.name,
    type: classTypeLabel[classRow.type] || classRow.type,
  }));
  const studentName = studentProfile.display_name || studentProfile.email;
  const studentLocale = studentProfile.locale === "zh" ? "zh" : "en";
  const studentTz = studentProfile.timezone || "America/Vancouver";
  const expiresForStudent = formatInTimeZone(expiresAt, studentTz, "yyyy-MM-dd HH:mm zzz");

  const emailMessages: Array<{ to: string; subject: string; html: string; text: string }> = [];
  if (studentProfile.email) {
    emailMessages.push({
      to: studentProfile.email,
      ...etransferInstructions({
        studentName,
        classes: classItems,
        totalAmountCad,
        etransferEmail,
        pendingPageUrl,
        expiresAt: expiresForStudent,
        locale: studentLocale,
      }),
    });
  }

  for (const parent of parentProfiles) {
    if (!parent?.email) continue;
    emailMessages.push({
      to: parent.email,
      ...etransferInstructions({
        studentName,
        classes: classItems,
        totalAmountCad,
        etransferEmail,
        pendingPageUrl,
        expiresAt: expiresForStudent,
        locale: parent.locale === "zh" ? "zh" : "en",
        isParentVersion: true,
      }),
    });
  }

  if (emailMessages.length) {
    await sendPortalEmails(emailMessages);
  }

  return mergeCookies(
    supabaseResponse,
    NextResponse.json({
      redirectUrl,
      enrollmentCount: upsertedRows?.length ?? rows.length,
      expiresAt: expiresAtIso,
    })
  );
}
