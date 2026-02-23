import PortalCalendar from "@/app/portal/_components/PortalCalendar";
import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";

export default async function PortalCalendarPage() {
  const session = await requireRole(["admin", "coach", "ta", "student", "parent"]);

  return (
    <SectionCard
      title="Calendar"
      description="Class schedule and upcoming events for the current term."
    >
      <PortalCalendar role={session.profile.role} />
    </SectionCard>
  );
}
