import PrivateSessionsManager from "@/app/portal/_components/PrivateSessionsManager";
import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";
import { getProfileMap } from "@/lib/portal/data";
import { formatSessionRangeForViewer } from "@/lib/portal/time";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function stepForStatus(status: string): number {
  if (status === "pending") return 1;
  if (status === "rescheduled_by_coach" || status === "rescheduled_by_student") return 2;
  if (status === "coach_accepted") return 3;
  if (status === "awaiting_payment") return 4;
  if (status === "confirmed") return 5;
  if (status === "completed") return 6;
  return 1;
}

export default async function StudentPrivateSessionsPage() {
  const session = await requireRole(["student"]);
  const supabase = await getSupabaseServerClient();

  const { data: sessionRowsData } = await supabase
    .from("private_sessions")
    .select("*")
    .eq("student_id", session.userId)
    .order("requested_date", { ascending: false })
    .order("requested_start_time", { ascending: false });
  const sessionRows = (sessionRowsData ?? []) as Array<Record<string, any>>;

  const coachIds = [
    ...new Set(
      [
        ...sessionRows.map((row: any) => row.coach_id),
        ...sessionRows.map((row: any) => row.proposed_by).filter(Boolean),
      ].filter(Boolean)
    ),
  ];
  const coachMap = await getProfileMap(supabase, coachIds);

  const items = sessionRows.map((row: any) => {
    const status = String(row.status || "pending");
    return {
      ...row,
      coachName: coachMap[row.coach_id]?.display_name || coachMap[row.coach_id]?.email || row.coach_id,
      studentName: session.profile.display_name || session.profile.email || session.userId,
      proposedByName: row.proposed_by
        ? coachMap[row.proposed_by]?.display_name || coachMap[row.proposed_by]?.email || row.proposed_by
        : null,
      whenText: formatSessionRangeForViewer(
        row.requested_date,
        row.requested_start_time,
        row.requested_end_time,
        row.timezone,
        session.profile.timezone
      ),
      step: stepForStatus(status),
      canAccept: false,
      canReject: false,
      canReschedule: ["pending", "rescheduled_by_student", "rescheduled_by_coach"].includes(status),
      canAcceptReschedule: status === "rescheduled_by_coach",
      canApprove: false,
      canPay: status === "awaiting_payment",
      canCancel: ["pending", "rescheduled_by_coach", "rescheduled_by_student", "awaiting_payment"].includes(
        status
      ),
      canComplete: false,
    };
  });

  return (
    <SectionCard
      title="My Private Sessions"
      description="Review your private session status, reschedule requests, and payments."
    >
      <PrivateSessionsManager sessions={items} viewerRole="student" />
    </SectionCard>
  );
}
