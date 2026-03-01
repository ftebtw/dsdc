import 'server-only';
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
