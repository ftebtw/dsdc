export const dynamic = "force-dynamic";

import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import PortalEnrollClient from "@/app/portal/_components/PortalEnrollClient";
import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";
import { getActiveTerm } from "@/lib/portal/data";
import { classTypeLabel } from "@/lib/portal/labels";
import { SESSIONS_PER_TERM, weeksRemainingInTerm } from "@/lib/pricing";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ClassOption = {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  coachName: string;
  scheduleText: string;
  spotsRemaining: number;
  alreadyEnrolled: boolean;
};

const weekdayIndex: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function firstSessionDate(termStartDate: string, scheduleDay: string): string {
  const baseDate = new Date(`${termStartDate}T00:00:00Z`);
  const targetDay = weekdayIndex[scheduleDay] ?? 0;
  const delta = (targetDay - baseDate.getUTCDay() + 7) % 7;
  const session = new Date(baseDate);
  session.setUTCDate(baseDate.getUTCDate() + delta);
  return session.toISOString().slice(0, 10);
}

function formatScheduleForViewer(
  input: { schedule_day: string; schedule_start_time: string; schedule_end_time: string; timezone: string },
  termStartDate: string,
  viewerTimezone: string
): string {
  const sessionDate = firstSessionDate(termStartDate, input.schedule_day);
  const startUtc = fromZonedTime(`${sessionDate}T${input.schedule_start_time}`, input.timezone);
  const endUtc = fromZonedTime(`${sessionDate}T${input.schedule_end_time}`, input.timezone);
  const day = formatInTimeZone(startUtc, viewerTimezone, "EEEE");
  const start = formatInTimeZone(startUtc, viewerTimezone, "h:mm a");
  const end = formatInTimeZone(endUtc, viewerTimezone, "h:mm a zzz");
  return `Every ${day}, ${start} - ${end}`;
}

export default async function StudentEnrollPage() {
  const session = await requireRole(["student"]);
  const supabase = await getSupabaseServerClient();
  const activeTerm = await getActiveTerm(supabase);
  const locale = session.profile.locale === "zh" ? "zh" : "en";

  if (!activeTerm) {
    return (
      <SectionCard
        title={locale === "zh" ? "报名课程" : "Enroll in Classes"}
        description={locale === "zh" ? "当前没有激活学期。" : "No active term right now."}
      >
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {locale === "zh"
            ? "当前未开放课程报名，请稍后再试。"
            : "Registration is not currently open. Please check back later."}
        </p>
      </SectionCard>
    );
  }

  const [{ data: classRows }, { data: allEnrollments }, { data: myEnrollments }] = await Promise.all([
    supabase.from("classes").select("*").eq("term_id", activeTerm.id).order("name"),
    supabase
      .from("enrollments")
      .select("class_id,status")
      .in("status", ["active", "pending_etransfer", "etransfer_sent", "pending_approval"]),
    supabase
      .from("enrollments")
      .select("class_id,status")
      .eq("student_id", session.userId)
      .in("status", ["active", "pending_etransfer", "etransfer_sent", "pending_approval"]),
  ]);
  const typedClassRows = (classRows ?? []) as Array<Record<string, any>>;

  const enrolledClassIds = new Set((myEnrollments ?? []).map((row: any) => row.class_id as string));
  const enrollmentCountByClass = new Map<string, number>();
  for (const row of (allEnrollments ?? []) as any[]) {
    enrollmentCountByClass.set(row.class_id, (enrollmentCountByClass.get(row.class_id) ?? 0) + 1);
  }

  const coachIds = [...new Set(typedClassRows.map((row) => row.coach_id).filter(Boolean))];
  const { data: coachProfiles } = coachIds.length
    ? await supabase.from("profiles").select("id,display_name,email").in("id", coachIds)
    : { data: [] };
  const coachMap = Object.fromEntries(((coachProfiles ?? []) as any[]).map((row) => [row.id, row]));

  const classes: ClassOption[] = typedClassRows
    .map((classRow) => {
      const enrolledCount = enrollmentCountByClass.get(classRow.id) ?? 0;
      const coach = coachMap[classRow.coach_id];
      return {
        id: classRow.id,
        name: classRow.name,
        type: classRow.type,
        typeLabel: classTypeLabel[classRow.type as keyof typeof classTypeLabel] || classRow.type,
        coachName: coach?.display_name || coach?.email || "DSDC Coach",
        scheduleText: formatScheduleForViewer(
          {
            schedule_day: String(classRow.schedule_day ?? ""),
            schedule_start_time: String(classRow.schedule_start_time ?? ""),
            schedule_end_time: String(classRow.schedule_end_time ?? ""),
            timezone: String(classRow.timezone ?? "America/Vancouver"),
          },
          activeTerm.start_date,
          session.profile.timezone || "America/Vancouver"
        ),
        spotsRemaining: Number(classRow.max_students) - enrolledCount,
        alreadyEnrolled: enrolledClassIds.has(classRow.id),
      };
    })
    .filter((row) => row.spotsRemaining > 0 || row.alreadyEnrolled);

  const totalWeeks =
    typeof activeTerm.weeks === "number" && activeTerm.weeks > 0
      ? activeTerm.weeks
      : SESSIONS_PER_TERM;
  const weeksRemaining = weeksRemainingInTerm(activeTerm.end_date);

  return (
    <SectionCard
      title={locale === "zh" ? "报名课程" : "Enroll in Classes"}
      description={`${activeTerm.name} - ${locale === "zh" ? "选择课程并完成付款" : "select classes and complete payment"}.`}
    >
      <PortalEnrollClient
        studentId={session.userId}
        parentId={null}
        termName={activeTerm.name}
        weeksRemaining={weeksRemaining}
        totalWeeks={totalWeeks}
        classes={classes}
        locale={locale}
        returnTo="/portal/student/classes"
      />
    </SectionCard>
  );
}
