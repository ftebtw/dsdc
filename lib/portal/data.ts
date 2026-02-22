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

  const { data } = await supabase
    .from('classes')
    .select('*')
    .eq('coach_id', coachId)
    .eq('term_id', activeTerm.id)
    .order('schedule_start_time', { ascending: true });

  return data ?? [];
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

export async function getProfileMap(supabase: Client, ids: string[]) {
  if (ids.length === 0) return {} as Record<string, Database['public']['Tables']['profiles']['Row']>;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .in('id', ids);

  const map: Record<string, Database['public']['Tables']['profiles']['Row']> = {};
  for (const profile of data ?? []) {
    map[profile.id] = profile;
  }
  return map;
}
