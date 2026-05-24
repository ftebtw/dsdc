import 'server-only';
import { formatInTimeZone } from 'date-fns-tz';
import type { Database } from '@/lib/supabase/database.types';
import { isClassInDateRange, isClassToday } from '@/lib/portal/time';

type Client = any;
type PortalClass = Database['public']['Tables']['classes']['Row'];
type PortalTerm = Database['public']['Tables']['terms']['Row'];

export async function getActiveTerm(supabase: Client): Promise<PortalTerm | null> {
  const { data } = await supabase
    .from('terms')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  return data ?? null;
}

export async function getClassesForCoachInActiveTerm(
  supabase: Client,
  coachId: string
): Promise<PortalClass[]> {
  const activeTerm = await getActiveTerm(supabase);
  if (!activeTerm) return [];

  // Classes where this coach is primary.
  const { data: primary } = await supabase
    .from('classes')
    .select('*')
    .eq('coach_id', coachId)
    .eq('term_id', activeTerm.id)
    .order('schedule_start_time', { ascending: true });

  // Classes where this coach is an additional co-coach.
  const { data: coCoachRows } = await supabase
    .from('class_coaches')
    .select('class_id')
    .eq('coach_id', coachId);

  const coClassIds = (coCoachRows ?? []).map((row: any) => row.class_id);
  let secondary: PortalClass[] = [];
  if (coClassIds.length) {
    const { data } = await supabase
      .from('classes')
      .select('*')
      .in('id', coClassIds)
      .eq('term_id', activeTerm.id)
      .order('schedule_start_time', { ascending: true });
    secondary = data ?? [];
  }

  // Deduplicate and merge primary + co-coach classes.
  const seen = new Set((primary ?? []).map((classRow: any) => classRow.id));
  const merged = [...(primary ?? [])];
  for (const classRow of secondary) {
    if (!seen.has(classRow.id)) {
      seen.add(classRow.id);
      merged.push(classRow);
    }
  }

  return merged;
}

export async function getTodayClassesForCoach(
  supabase: Client,
  coachId: string,
  now = new Date()
): Promise<PortalClass[]> {
  const activeTerm = await getActiveTerm(supabase);
  if (!activeTerm || !isClassInDateRange(activeTerm, now)) return [];

  const classes = await getClassesForCoachInActiveTerm(supabase, coachId);
  return classes.filter((classRow) => isClassToday(classRow, now));
}

export type TodayPrivateGroupSession = {
  sessionId: string;
  classId: string;
  className: string;
  classTimezone: string;
  startTime: string;
  endTime: string;
  sessionTimezone: string;
  zoomLink: string | null;
};

// Returns today's private session group sessions where this coach is teaching.
// These are private_sessions rows tied to a classroom (class_id is set).
//
// Date matching is timezone-aware: a session's "today" is computed in that
// session's own timezone (since requested_date is the local calendar date,
// not a UTC date). We query a 3-day window in UTC to catch sessions whose
// requested_date is "today" in their local timezone but UTC-yesterday or
// UTC-tomorrow on the server clock.
export async function getTodayPrivateGroupSessionsForCoach(
  supabase: Client,
  coachId: string,
  now = new Date()
): Promise<TodayPrivateGroupSession[]> {
  const utcToday = now.toISOString().slice(0, 10);
  const utcYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const utcTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data: sessionRows } = await supabase
    .from('private_sessions')
    .select('id,class_id,requested_date,requested_start_time,requested_end_time,timezone,zoom_link,status')
    .eq('coach_id', coachId)
    .in('requested_date', [utcYesterday, utcToday, utcTomorrow])
    .not('class_id', 'is', null)
    .neq('status', 'cancelled')
    .order('requested_start_time', { ascending: true });

  const rows = (sessionRows ?? []) as Array<{
    id: string;
    class_id: string | null;
    requested_date: string;
    requested_start_time: string;
    requested_end_time: string;
    timezone: string;
    zoom_link: string | null;
    status: string;
  }>;
  if (rows.length === 0) return [];

  // Keep only rows where requested_date equals "today" in that session's own timezone.
  const matching = rows.filter((row) => {
    try {
      const localToday = formatInTimeZone(now, row.timezone, 'yyyy-MM-dd');
      return row.requested_date === localToday;
    } catch {
      return row.requested_date === utcToday;
    }
  });
  if (matching.length === 0) return [];

  const classIds = [...new Set(matching.map((row) => row.class_id).filter((id): id is string => Boolean(id)))];
  const { data: classData } = await supabase
    .from('classes')
    .select('id,name,timezone')
    .in('id', classIds);
  const classMap = new Map(
    ((classData ?? []) as Array<{ id: string; name: string; timezone: string }>).map((c) => [c.id, c])
  );

  return matching
    .filter((row) => row.class_id && classMap.has(row.class_id))
    .map((row) => {
      const klass = classMap.get(row.class_id as string)!;
      return {
        sessionId: row.id,
        classId: row.class_id as string,
        className: klass.name,
        classTimezone: klass.timezone,
        startTime: row.requested_start_time,
        endTime: row.requested_end_time,
        sessionTimezone: row.timezone,
        zoomLink: row.zoom_link,
      };
    });
}

export async function getProfileMap(supabase: Client, ids: Array<string | null | undefined>) {
  const normalizedIds = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (normalizedIds.length === 0) return {} as Record<string, Database['public']['Tables']['profiles']['Row']>;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .in('id', normalizedIds);

  const map: Record<string, Database['public']['Tables']['profiles']['Row']> = {};
  for (const profile of data ?? []) {
    map[profile.id] = profile;
  }
  return map;
}
