import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { classTypeLabel } from "@/lib/portal/labels";
import { getPortalAppUrl } from "@/lib/email/resend";
import { sendPortalEmails } from "@/lib/email/send";
import { enrollmentConfirmationFull } from "@/lib/email/templates";
import { convertFirstRegisteredReferral } from "@/lib/portal/referral-conversion";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

const bodySchema = z.object({
  studentId: z.string().uuid(),
  token: z.string().uuid(),
});

type ClassType = Database["public"]["Enums"]["class_type"];

const weekdayIndex: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function firstSessionDate(termStartDate: string, scheduleDay: string): string {
  const baseDate = new Date(`${termStartDate}T00:00:00Z`);
  const targetDay = weekdayIndex[scheduleDay] ?? 0;
  const delta = (targetDay - baseDate.getUTCDay() + 7) % 7;
  const session = new Date(baseDate);
  session.setUTCDate(baseDate.getUTCDate() + delta);
  return session.toISOString().slice(0, 10);
}

function formatScheduleInStudentTimezone(input: {
  scheduleDay: string;
  startTime: string;
  endTime: string;
  classTimezone: string;
  termStartDate: string;
  studentTimezone: string;
}): string {
  const sessionDate = firstSessionDate(input.termStartDate, input.scheduleDay);
  const startUtc = fromZonedTime(`${sessionDate}T${input.startTime}`, input.classTimezone);
  const endUtc = fromZonedTime(`${sessionDate}T${input.endTime}`, input.classTimezone);
  const day = formatInTimeZone(startUtc, input.studentTimezone, "EEEE");
  const start = formatInTimeZone(startUtc, input.studentTimezone, "h:mm a");
  const end = formatInTimeZone(endUtc, input.studentTimezone, "h:mm a zzz");
  return `Every ${day}, ${start} - ${end}`;
}

function formatTermDateRange(startDate: string, endDate: string, timezone: string): string {
  const start = formatInTimeZone(new Date(`${startDate}T00:00:00Z`), timezone, "MMMM d, yyyy");
  const end = formatInTimeZone(new Date(`${endDate}T00:00:00Z`), timezone, "MMMM d, yyyy");
  return `${start} - ${end}`;
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid request payload.");

  const admin = getSupabaseAdminClient();
  const { studentId, token } = parsed.data;

  const { data: matchRows, error: matchError } = await admin
    .from("enrollments")
    .select("id,student_id,class_id,status,etransfer_token")
    .eq("student_id", studentId)
    .eq("etransfer_token", token)
    .in("status", ["pending_etransfer", "etransfer_sent"]);
  if (matchError) return jsonError(matchError.message, 500);
  if (!matchRows || matchRows.length === 0) {
    return jsonError("No pending e-transfer rows found for this student and token.", 404);
  }

  const { data: updatedRows, error: updateError } = await admin
    .from("enrollments")
    .update({
      status: "active",
      payment_method: "etransfer",
    })
    .eq("student_id", studentId)
    .eq("etransfer_token", token)
    .in("status", ["pending_etransfer", "etransfer_sent"])
    .select("id,class_id,student_id");
  if (updateError) return jsonError(updateError.message, 500);

  const matchedRows = (updatedRows ?? matchRows) as Array<{ id: string; class_id: string; student_id: string }>;
  const classIds = [...new Set(matchedRows.map((row) => row.class_id))];
  const convertedReferralId = await convertFirstRegisteredReferral(admin, [studentId]);
  if (convertedReferralId) {
    console.log(`[etransfers-confirm] Referral converted: referral=${convertedReferralId}, student=${studentId}`);
  }

  const [{ data: studentProfile }, { data: classRowsData }, { data: parentLinks }] = await Promise.all([
    admin
      .from("profiles")
      .select("id,email,display_name,locale,timezone")
      .eq("id", studentId)
      .maybeSingle(),
    admin
      .from("classes")
      .select("id,name,type,coach_id,schedule_day,schedule_start_time,schedule_end_time,timezone,zoom_link,term_id")
      .in("id", classIds),
    admin
      .from("parent_student_links")
      .select("parent_id")
      .eq("student_id", studentId),
  ]);

  if (!studentProfile || !classRowsData || classRowsData.length === 0) {
    return NextResponse.json({ confirmedCount: updatedRows?.length ?? matchRows.length });
  }

  const classRows = classRowsData as Array<{
    id: string;
    name: string;
    type: ClassType;
    coach_id: string;
    schedule_day: string;
    schedule_start_time: string;
    schedule_end_time: string;
    timezone: string;
    zoom_link: string | null;
    term_id: string;
  }>;

  const coachIds = [...new Set(classRows.map((row) => row.coach_id))];
  const termIds = [...new Set(classRows.map((row) => row.term_id))];
  const parentLinkRows = (parentLinks ?? []) as Array<{ parent_id: string; student_id: string }>;
  const linkedParentIds = [...new Set(parentLinkRows.map((row) => row.parent_id).filter(Boolean))] as string[];
  const [coachProfilesResult, termRowsResult, parentProfilesResult] = await Promise.all([
    coachIds.length
      ? admin.from("profiles").select("id,display_name,email").in("id", coachIds)
      : Promise.resolve({ data: [] as Array<{ id: string; display_name: string | null; email: string }> }),
    termIds.length
      ? admin.from("terms").select("id,name,start_date,end_date").in("id", termIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string; start_date: string; end_date: string }> }),
    linkedParentIds.length > 0
      ? admin
          .from("profiles")
          .select("id,email,display_name,locale")
          .in("id", linkedParentIds)
          .eq("role", "parent")
      : Promise.resolve({ data: [] as Array<{ id: string; email: string; display_name: string | null; locale: string }> }),
  ]);

  const coachRows = (coachProfilesResult.data ?? []) as Array<{
    id: string;
    display_name: string | null;
    email: string;
  }>;
  const termRows = (termRowsResult.data ?? []) as Array<{
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  }>;

  const coachMap = Object.fromEntries(coachRows.map((row) => [row.id, row])) as Record<
    string,
    { display_name: string | null; email: string }
  >;
  const termMap = Object.fromEntries(termRows.map((row) => [row.id, row])) as Record<
    string,
    { id: string; name: string; start_date: string; end_date: string }
  >;
  const studentTimezone = studentProfile.timezone || "America/Vancouver";

  const enrolledClasses = classRows.map((classRow) => {
    const coach = coachMap[classRow.coach_id];
    const term = termMap[classRow.term_id];
    const coachName = coach?.display_name || coach?.email || "DSDC Coach";
    const typeLabel = classTypeLabel[classRow.type] || classRow.type;
    return {
      name: classRow.name,
      type: typeLabel,
      coachName,
      scheduleText: term
        ? formatScheduleInStudentTimezone({
            scheduleDay: classRow.schedule_day,
            startTime: classRow.schedule_start_time,
            endTime: classRow.schedule_end_time,
            classTimezone: classRow.timezone,
            termStartDate: term.start_date,
            studentTimezone,
          })
        : `${classRow.schedule_day} ${classRow.schedule_start_time}-${classRow.schedule_end_time}`,
      timezoneLabel: studentTimezone,
      zoomLink: classRow.zoom_link,
      termDates: term ? formatTermDateRange(term.start_date, term.end_date, studentTimezone) : "Term dates pending",
    };
  });

  const portalLoginUrl = `${getPortalAppUrl().replace(/\/$/, "")}/portal/login`;
  const studentName = studentProfile.display_name || studentProfile.email;
  const messages: Array<{ to: string; subject: string; html: string; text: string }> = [];
  const seenEmails = new Set<string>();

  if (studentProfile.email) {
    const email = studentProfile.email.trim().toLowerCase();
    if (email) {
      seenEmails.add(email);
      messages.push({
        to: email,
        ...enrollmentConfirmationFull({
          studentName,
          classes: enrolledClasses,
          portalLoginUrl,
          isParentVersion: false,
          studentNeedsPasswordSetup: false,
          contactEmail: "education.dsdc@gmail.com",
          locale: studentProfile.locale === "zh" ? "zh" : "en",
        }),
      });
    }
  }

  for (const parent of parentProfilesResult.data ?? []) {
    if (!parent?.email) continue;
    const email = parent.email.trim().toLowerCase();
    if (!email || seenEmails.has(email)) continue;
    seenEmails.add(email);
    messages.push({
      to: email,
      ...enrollmentConfirmationFull({
        studentName,
        parentName: parent.display_name || undefined,
        classes: enrolledClasses,
        portalLoginUrl,
        isParentVersion: true,
        studentNeedsPasswordSetup: false,
        contactEmail: "education.dsdc@gmail.com",
        locale: parent.locale === "zh" ? "zh" : "en",
      }),
    });
  }

  if (messages.length) {
    await sendPortalEmails(messages);
  }

  return NextResponse.json({
    confirmedCount: updatedRows?.length ?? matchRows.length,
  });
}
