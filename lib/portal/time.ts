import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import type { Database } from '@/lib/supabase/database.types';

type ClassRow = Database['public']['Tables']['classes']['Row'];
type TermRow = Database['public']['Tables']['terms']['Row'];

const dayMap: Record<Database['public']['Enums']['schedule_day'], string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

export function isClassInDateRange(term: Pick<TermRow, 'start_date' | 'end_date'>, date: Date): boolean {
  const day = formatInTimeZone(date, 'UTC', 'yyyy-MM-dd');
  return day >= term.start_date && day <= term.end_date;
}

export function isClassToday(classRow: Pick<ClassRow, 'schedule_day' | 'timezone'>, now = new Date()): boolean {
  const zoned = toZonedTime(now, classRow.timezone);
  const weekday = formatInTimeZone(zoned, classRow.timezone, 'EEE');
  const day = dayMap[classRow.schedule_day as keyof typeof dayMap];
  return weekday === day;
}

export function getSessionDateForClassTimezone(timezone: string, now = new Date()): string {
  return formatInTimeZone(now, timezone, 'yyyy-MM-dd');
}

export function formatUtcForUser(
  utcIso: string,
  timezone: string,
  pattern = 'yyyy-MM-dd HH:mm zzz'
): string {
  return formatInTimeZone(new Date(utcIso), timezone, pattern);
}
