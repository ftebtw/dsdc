import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";
import ScheduleTemplateBuilder from "./_components/ScheduleTemplateBuilder";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const session = await requireRole(["admin"]);

  return (
    <SectionCard
      title="Schedule Maker"
      description="Build branded class schedules. Pick single-class or term-overview, fill in the details, and download as PNG or PDF."
    >
      <ScheduleTemplateBuilder
        defaultTimezone={session.profile.timezone || "America/Vancouver"}
      />
    </SectionCard>
  );
}
