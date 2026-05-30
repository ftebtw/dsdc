export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import CoachCheckinList from '@/app/portal/_components/CoachCheckinList';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  getTodayClassesForCoach,
  getTodayPrivateGroupSessionsForCoach,
  getTodaySubbedClassesForCoach,
} from '@/lib/portal/data';
import {
  getSessionDateForClassTimezone,
  formatClassScheduleForViewer,
  formatSessionRangeForViewer,
} from '@/lib/portal/time';

export default async function CoachCheckinPage() {
  const session = await requireRole(['coach', 'ta']);
  const supabase = await getSupabaseServerClient();
  const [ownClasses, todayPrivateSessions, subbedClasses] = await Promise.all([
    getTodayClassesForCoach(supabase, session.userId),
    getTodayPrivateGroupSessionsForCoach(supabase, session.userId),
    getTodaySubbedClassesForCoach(supabase, session.userId),
  ]);

  // Merge own classes + classes being covered today (dedupe). Track which ids
  // are covers so we can label them.
  const ownClassIds = new Set(ownClasses.map((c) => c.id));
  const coverClassIds = new Set(
    subbedClasses.filter((c) => !ownClassIds.has(c.id)).map((c) => c.id)
  );
  const todayClasses = [
    ...ownClasses,
    ...subbedClasses.filter((c) => !ownClassIds.has(c.id)),
  ];

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

  // De-dupe private group classrooms — multiple sessions today share one check-in.
  const privateGroupClassIds = [...new Set(todayPrivateSessions.map((row) => row.classId))];
  const privateCheckins = await Promise.all(
    privateGroupClassIds.map(async (classId) => {
      const classTimezone =
        todayPrivateSessions.find((row) => row.classId === classId)?.classTimezone ||
        session.profile.timezone;
      const sessionDate = getSessionDateForClassTimezone(classTimezone);
      const { data } = await supabase
        .from('coach_checkins')
        .select('checked_in_at')
        .eq('coach_id', session.userId)
        .eq('class_id', classId)
        .eq('session_date', sessionDate)
        .maybeSingle();
      return [classId, data?.checked_in_at ?? null] as const;
    })
  );

  const classItems = [
    ...todayClasses.map((classRow) => ({
      id: classRow.id,
      name: coverClassIds.has(classRow.id) ? `${classRow.name} (Cover)` : classRow.name,
      schedule: formatClassScheduleForViewer(
        classRow.schedule_day,
        classRow.schedule_start_time,
        classRow.schedule_end_time,
        classRow.timezone,
        session.profile.timezone
      ),
      timezone: classRow.timezone,
    })),
    // One row per private session (so a coach with multiple group sessions today
    // sees them all). Check-in itself is class-scoped, so multiple rows share state.
    ...todayPrivateSessions.map((row) => ({
      id: row.classId,
      name: `${row.className} (Private)`,
      schedule: (() => {
        try {
          return formatSessionRangeForViewer(
            new Date().toISOString().slice(0, 10),
            row.startTime,
            row.endTime,
            row.sessionTimezone,
            session.profile.timezone
          );
        } catch {
          return `${row.startTime.slice(0, 5)}-${row.endTime.slice(0, 5)} (${row.sessionTimezone})`;
        }
      })(),
      timezone: row.classTimezone,
    })),
  ];

  return (
    <SectionCard
      title="Coach Check-in"
      description="Tap “I’m Here” once for each class you teach today. This is your attendance clock-in."
    >
      <CoachCheckinList
        userId={session.userId}
        timezone={session.profile.timezone}
        classes={classItems}
        initialCheckins={Object.fromEntries(
          [...checkins, ...privateCheckins].filter((entry) => Boolean(entry[1]))
        )}
      />
    </SectionCard>
  );
}
