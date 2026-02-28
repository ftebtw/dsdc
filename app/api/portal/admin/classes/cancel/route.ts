import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendPortalEmails } from "@/lib/email/send";
import { classCancelledNotice } from "@/lib/email/templates";

const schema = z.object({
  classId: z.string().uuid(),
  cancellationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(1).max(1000),
});

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid input.", details: body.error.flatten() },
      { status: 400 }
    );
  }

  const { classId, cancellationDate, reason } = body.data;
  const admin = getSupabaseAdminClient();

  const { data: classRow, error: classError } = await admin
    .from("classes")
    .select("id,name,type,coach_id,schedule_day,schedule_start_time,schedule_end_time,timezone")
    .eq("id", classId)
    .single();

  if (classError || !classRow) {
    return NextResponse.json({ error: "Class not found." }, { status: 404 });
  }

  const { data: existing } = await admin
    .from("class_cancellations")
    .select("id")
    .eq("class_id", classId)
    .eq("cancellation_date", cancellationDate)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "This session is already cancelled." }, { status: 409 });
  }

  const { data: enrollmentsData } = await admin
    .from("enrollments")
    .select("student_id")
    .eq("class_id", classId)
    .eq("status", "active");

  const studentIds = [...new Set((enrollmentsData ?? []).map((row: { student_id: string }) => row.student_id))];

  const { error: cancelError } = await admin.from("class_cancellations").insert({
    class_id: classId,
    cancellation_date: cancellationDate,
    reason,
    cancelled_by: session.userId,
  });

  if (cancelError) {
    console.error("[cancel-class] insert failed:", cancelError);
    return NextResponse.json({ error: "Failed to record cancellation." }, { status: 500 });
  }

  if (studentIds.length > 0) {
    const credits = studentIds.map((studentId) => ({
      student_id: studentId,
      class_type: classRow.type,
      amount_sessions: 1,
      reason: `Class cancelled: ${classRow.name} on ${cancellationDate} - ${reason}`,
      issued_by: session.userId,
      redeemed: false,
    }));

    const { error: creditError } = await admin.from("class_credits").insert(credits);
    if (creditError) {
      console.error("[cancel-class] credit insert failed:", creditError);
    }
  }

  const recipientEmails: string[] = [];

  if (studentIds.length > 0) {
    const { data: studentProfiles } = await admin
      .from("profiles")
      .select("id,email")
      .in("id", studentIds);

    for (const student of studentProfiles ?? []) {
      if (student.email) recipientEmails.push(student.email);
    }

    const { data: parentLinks } = await admin
      .from("parent_student_links")
      .select("parent_id")
      .in("student_id", studentIds);

    const parentIds = [...new Set((parentLinks ?? []).map((row: { parent_id: string }) => row.parent_id))];

    if (parentIds.length > 0) {
      const { data: parentProfiles } = await admin
        .from("profiles")
        .select("id,email")
        .in("id", parentIds);

      for (const parent of parentProfiles ?? []) {
        if (parent.email && !recipientEmails.includes(parent.email)) {
          recipientEmails.push(parent.email);
        }
      }
    }
  }

  if (recipientEmails.length > 0) {
    const portalUrl = `${(process.env.PORTAL_APP_URL || "https://dsdc.ca").replace(/\/$/, "")}/portal`;
    const formattedDate = formatDate(cancellationDate);

    const emailContent = classCancelledNotice({
      className: classRow.name,
      cancellationDate: formattedDate,
      reason,
      creditIssued: studentIds.length > 0,
      portalUrl,
    });

    const emails = recipientEmails.map((to) => ({
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    }));

    void sendPortalEmails(emails).catch((err) => {
      console.error("[cancel-class] email batch failed:", err);
    });
  }

  return NextResponse.json({
    ok: true,
    studentsNotified: studentIds.length,
    emailsSent: recipientEmails.length,
    creditsIssued: studentIds.length,
  });
}
