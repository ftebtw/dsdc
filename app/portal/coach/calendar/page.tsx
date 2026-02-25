import CalendarWeekView from "@/app/portal/_components/CalendarWeekView";
import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";
import { getActiveTerm, getProfileMap } from "@/lib/portal/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CoachCalendarPage() {
  const session = await requireRole(["coach", "ta"]);
  const supabase = await getSupabaseServerClient();
  const activeTerm = await getActiveTerm(supabase);

  type CalendarClassRow = {
    id: string;
    name: string;
    schedule_day: string;
    schedule_start_time: string;
    schedule_end_time: string;
    timezone: string;
    coach_id: string | null;
  };

  const allClassesData = activeTerm
    ? (((await supabase.from("classes").select("*").eq("term_id", activeTerm.id)).data ??
        []) as CalendarClassRow[])
    : [];

  const coachIds = [...new Set(allClassesData.map((classRow) => classRow.coach_id))];
  const profileMap = await getProfileMap(supabase, coachIds);

  const classBlocks = allClassesData.map((classRow) => {
    const coach = classRow.coach_id ? profileMap[classRow.coach_id] : null;
    return {
      kind: "class" as const,
      id: classRow.id,
      name: classRow.name,
      scheduleDay: classRow.schedule_day,
      startTime: classRow.schedule_start_time,
      endTime: classRow.schedule_end_time,
      timezone: classRow.timezone,
      coachName: coach?.display_name || coach?.email || null,
    };
  });

  return (
    <SectionCard
      title="Calendar"
      description="Weekly view of classes and events. Add your own events with the + button."
    >
      <CalendarWeekView
        classes={classBlocks}
        viewerTimezone={session.profile.timezone}
        userId={session.userId}
        isAdmin={false}
      />
    </SectionCard>
  );
}
