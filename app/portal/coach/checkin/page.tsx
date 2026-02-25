export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import CoachCheckinList from '@/app/portal/_components/CoachCheckinList';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getTodayClassesForCoach } from '@/lib/portal/data';
import { getSessionDateForClassTimezone, formatClassScheduleForViewer } from '@/lib/portal/time';

export default async function CoachCheckinPage() {
  const session = await requireRole(['coach', 'ta']);
  const supabase = await getSupabaseServerClient();
  const todayClasses = await getTodayClassesForCoach(supabase, session.userId);

  const checkins = await Promise.all(
    todayClasses.map(async (classRow) => {
      const sessionDate = getSessionDateForClassTimezone(classRow.timezone);
      const { data } = await supabase
        .from('coach_checkins')
        .select('checked_in_at')
        .eq('coach_id', session.userId)
        .eq('class_id', classRow.id)
        .eq('session_date', sessionDate)
        .maybeSingle();
      return [classRow.id, data?.checked_in_at ?? null] as const;
    })
  );

  const classItems = todayClasses.map((classRow) => ({
    id: classRow.id,
    name: classRow.name,
    schedule: formatClassScheduleForViewer(
      classRow.schedule_day,
      classRow.schedule_start_time,
      classRow.schedule_end_time,
      classRow.timezone,
      session.profile.timezone
    ),
    timezone: classRow.timezone,
  }));

  return (
    <SectionCard
      title="Coach Check-in"
      description="Tap “I’m Here” once for each class you teach today. This is your attendance clock-in."
    >
      <CoachCheckinList
        userId={session.userId}
        timezone={session.profile.timezone}
        classes={classItems}
        initialCheckins={Object.fromEntries(checkins.filter((entry) => Boolean(entry[1])))}
      />
    </SectionCard>
  );
}
