import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";
import ScheduleTemplateBuilder from "./_components/ScheduleTemplateBuilder";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const session = await requireRole(["admin"]);

  return (
    <SectionCard
      title="Poster Maker"
      description="Build branded class schedules and coach cards. Pick single-class, term overview, or meet-the-coach, fill in the details, and download as PNG or PDF."
    >
      <ScheduleTemplateBuilder
        defaultTimezone={session.profile.timezone || "America/Vancouver"}
      />
    </SectionCard>
  );
}
