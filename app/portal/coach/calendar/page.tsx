import PortalCalendar from "@/app/portal/_components/PortalCalendar";
import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";

export const dynamic = "force-dynamic";

export default async function CoachCalendarPage() {
  const session = await requireRole(["coach", "ta"]);

  return (
    <SectionCard
      title="Calendar"
      description="Monthly view of classes and events. Add your own events with the + button."
    >
      <PortalCalendar
        role={session.profile.role}
        userTimezone={session.profile.timezone || "America/Vancouver"}
      />
    </SectionCard>
  );
}
