import PortalCalendar from "@/app/portal/_components/PortalCalendar";
import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";

export const dynamic = "force-dynamic";

export default async function AdminCalendarPage() {
  const session = await requireRole(["admin"]);

  return (
    <SectionCard
      title="Calendar"
      description="All classes and events across the term. You can manage any event."
    >
      <PortalCalendar
        role={session.profile.role}
        userTimezone={session.profile.timezone || "America/Vancouver"}
      />
    </SectionCard>
  );
}
