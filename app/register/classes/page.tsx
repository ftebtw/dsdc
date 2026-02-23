import { redirect } from "next/navigation";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import RegisterClassesClient from "./RegisterClassesClient";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { classTypeLabel } from "@/lib/portal/labels";
import { SESSIONS_PER_TERM, weeksRemainingInTerm } from "@/lib/pricing";

type ClassOption = {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  coachName: string;
  scheduleText: string;
  spotsRemaining: number;
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

function formatClassScheduleForViewer(
  input: {
    schedule_day: string;
    schedule_start_time: string;
    schedule_end_time: string;
    timezone: string;
  },
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

export default async function RegisterClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; setup?: string; lang?: string }>;
}) {
  const params = await searchParams;
  const lang = params.lang === "zh" ? "zh" : "en";
  const copy =
    lang === "zh"
      ? {
          title: "\u9009\u62e9\u8bfe\u7a0b",
          noLinked: "\u5f53\u524d\u5bb6\u957f\u8d26\u53f7\u5c1a\u672a\u5173\u8054\u5b66\u751f\uff0c\u8bf7\u8054\u7cfb DSDC \u652f\u6301\u3002",
          noActiveTerm: "\u5f53\u524d\u6ca1\u6709\u53ef\u62a5\u540d\u7684\u5b66\u671f\u3002",
        }
      : {
          title: "Class selection",
          noLinked: "No linked student account found for this parent profile. Please contact DSDC support.",
          noActiveTerm: "No active term is available right now.",
        };
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = new URLSearchParams();
    if (params.lang === "en" || params.lang === "zh") {
      next.set("lang", params.lang);
    }
    const suffix = next.toString() ? `?${next.toString()}` : "";
    redirect(`/register${suffix}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,role,timezone,locale,display_name,email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/register");
  }

  if (profile.role !== "student" && profile.role !== "parent") {
    redirect("/portal");
  }

  let studentId = profile.id;
  let parentId: string | null = null;

  if (profile.role === "parent") {
    parentId = profile.id;
    const { data: links } = await supabase
      .from("parent_student_links")
      .select("student_id")
      .eq("parent_id", profile.id);
    const linkedStudentIds = (links ?? []).map((row: any) => row.student_id as string);
    if (!linkedStudentIds.length) {
      return (
        <section className="min-h-screen bg-gradient-to-br from-warm-100 via-white to-gold-50 dark:from-navy-900 dark:via-navy-800 dark:to-navy-900 pt-28 pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white/95 dark:bg-navy-900/95 shadow-xl p-6">
              <h1 className="text-2xl font-bold text-navy-900 dark:text-white">{copy.title}</h1>
              <p className="mt-2 text-sm text-charcoal/70 dark:text-navy-300">
                {copy.noLinked}
              </p>
            </div>
          </div>
        </section>
      );
    }

    studentId =
      params.student && linkedStudentIds.includes(params.student)
        ? params.student
        : linkedStudentIds[0];
  } else if (params.student && params.student !== profile.id) {
    redirect("/register/classes");
  }

  const { data: activeTerm } = await supabase
    .from("terms")
    .select("id,name,start_date,end_date,weeks")
    .eq("is_active", true)
    .maybeSingle();

  if (!activeTerm) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-warm-100 via-white to-gold-50 dark:from-navy-900 dark:via-navy-800 dark:to-navy-900 pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white/95 dark:bg-navy-900/95 shadow-xl p-6">
            <h1 className="text-2xl font-bold text-navy-900 dark:text-white">{copy.title}</h1>
            <p className="mt-2 text-sm text-charcoal/70 dark:text-navy-300">
              {copy.noActiveTerm}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const { data: classesData } = await supabase
    .from("classes")
    .select("id,name,type,coach_id,schedule_day,schedule_start_time,schedule_end_time,timezone,max_students,term_id")
    .eq("term_id", activeTerm.id)
    .order("schedule_day", { ascending: true });
  const classRows = (classesData ?? []) as any[];
  const classIds = classRows.map((row) => row.id);

  const [{ data: enrollmentsData }, { data: studentEnrollmentsData }] = await Promise.all([
    classIds.length
      ? supabase
          .from("enrollments")
          .select("class_id,status")
          .in("class_id", classIds)
          .in("status", ["active", "pending_etransfer", "etransfer_sent"])
      : Promise.resolve({ data: [] as any[] }),
    classIds.length
      ? supabase
          .from("enrollments")
          .select("class_id,status")
          .in("class_id", classIds)
          .eq("student_id", studentId)
          .in("status", ["active", "pending_etransfer", "etransfer_sent"])
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const enrollmentRows = (enrollmentsData ?? []) as any[];
  const studentEnrollments = new Set((studentEnrollmentsData ?? []).map((row: any) => row.class_id as string));
  const enrollmentCountByClass = new Map<string, number>();
  for (const row of enrollmentRows) {
    const previous = enrollmentCountByClass.get(row.class_id) ?? 0;
    enrollmentCountByClass.set(row.class_id, previous + 1);
  }

  const coachIds = [...new Set(classRows.map((row) => row.coach_id))];
  const { data: coachProfilesData } = coachIds.length
    ? await supabase.from("profiles").select("id,display_name,email").in("id", coachIds)
    : { data: [] as any[] };
  const coachMap = Object.fromEntries(
    ((coachProfilesData ?? []) as any[]).map((coach) => [coach.id, coach])
  ) as Record<string, { display_name: string | null; email: string }>;

  const classOptions: ClassOption[] = classRows
    .map((classRow) => {
      const enrolledCount = enrollmentCountByClass.get(classRow.id) ?? 0;
      const spotsRemaining = Number(classRow.max_students) - enrolledCount;
      const coach = coachMap[classRow.coach_id];
      const coachName = coach?.display_name || coach?.email || "DSDC Coach";
      const type = classRow.type as keyof typeof classTypeLabel;
      const typeLabel = classTypeLabel[type] || classRow.type;
      return {
        id: classRow.id,
        name: classRow.name,
        type: classRow.type,
        typeLabel,
        coachName,
        scheduleText: formatClassScheduleForViewer(
          classRow,
          activeTerm.start_date,
          profile.timezone || "America/Vancouver"
        ),
        spotsRemaining,
      };
    })
    .filter((row) => row.spotsRemaining > 0 || studentEnrollments.has(row.id));
  const totalWeeks =
    typeof activeTerm.weeks === "number" && activeTerm.weeks > 0
      ? activeTerm.weeks
      : SESSIONS_PER_TERM;
  const weeksRemaining = weeksRemainingInTerm(activeTerm.end_date);

  return (
    <section className="min-h-screen bg-gradient-to-br from-warm-100 via-white to-gold-50 dark:from-navy-900 dark:via-navy-800 dark:to-navy-900 pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <RegisterClassesClient
          studentId={studentId}
          parentId={parentId}
          studentNeedsPasswordSetup={params.setup === "1"}
          termName={activeTerm.name}
          termDates={`${activeTerm.start_date} - ${activeTerm.end_date}`}
          weeksRemaining={weeksRemaining}
          totalWeeks={totalWeeks}
          classes={classOptions}
          localeHint={params.lang === "zh" ? "zh" : profile.locale === "zh" ? "zh" : "en"}
        />
      </div>
    </section>
  );
}

