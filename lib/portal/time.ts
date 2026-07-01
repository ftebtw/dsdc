import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
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

export function isClassToday(
  classRow: Pick<ClassRow, 'schedule_day' | 'schedule_days' | 'timezone' | 'start_date' | 'end_date'>,
  now = new Date()
): boolean {
  const localToday = formatInTimeZone(now, classRow.timezone, 'yyyy-MM-dd');
  if (classRow.start_date && localToday < classRow.start_date) return false;
  if (classRow.end_date && localToday > classRow.end_date) return false;
  const zoned = toZonedTime(now, classRow.timezone);
  const weekday = formatInTimeZone(zoned, classRow.timezone, 'EEE');
  const days = getClassScheduleDays(classRow);
  if (days.length === 0) return false;
  return days.some((code) => dayMap[code as keyof typeof dayMap] === weekday);
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

export function formatSessionTimeForViewer(
  sessionDate: string,
  sessionTime: string,
  sourceTimezone: string,
  viewerTimezone: string,
  pattern = 'yyyy-MM-dd HH:mm zzz'
): string {
  if (!sessionDate || !sessionTime || !sourceTimezone || !viewerTimezone) {
    return sessionTime ? `${sessionDate ?? '?'} ${sessionTime.slice(0, 5)}` : '—';
  }

  try {
    const utcDate = fromZonedTime(`${sessionDate}T${sessionTime}`, sourceTimezone);
    return formatInTimeZone(utcDate, viewerTimezone, pattern);
  } catch (error) {
    console.error(
      '[formatSessionTimeForViewer] Failed:',
      { sessionDate, sessionTime, sourceTimezone, viewerTimezone },
      error
    );
    return `${sessionDate} ${sessionTime.slice(0, 5)}`;
  }
}

export function formatSessionRangeForViewer(
  sessionDate: string,
  startTime: string | null,
  endTime: string | null,
  sourceTimezone: string,
  viewerTimezone: string
): string {
  if (!sessionDate || !startTime || !endTime || !sourceTimezone || !viewerTimezone) {
    return `${sessionDate ?? '?'} ${(startTime ?? '').slice(0, 5)}-${(endTime ?? '').slice(0, 5)}`;
  }

  try {
    const start = formatSessionTimeForViewer(
      sessionDate,
      startTime,
      sourceTimezone,
      viewerTimezone,
      'yyyy-MM-dd HH:mm'
    );
    const end = formatSessionTimeForViewer(
      sessionDate,
      endTime,
      sourceTimezone,
      viewerTimezone,
      'HH:mm zzz'
    );
    return `${start}-${end}`;
  } catch (error) {
    console.error(
      '[formatSessionRangeForViewer] Failed:',
      { sessionDate, startTime, endTime, sourceTimezone, viewerTimezone },
      error
    );
    return `${sessionDate} ${startTime.slice(0, 5)}-${endTime.slice(0, 5)}`;
  }
}

/**
 * Formats a recurring class schedule (day + time range) converted to the viewer's timezone.
 * Handles weekday shifts across timezone boundaries using the next matching schedule day.
 */
export function formatClassScheduleForViewer(
  scheduleDay: string | null,
  startTime: string | null,
  endTime: string | null,
  classTimezone: string,
  viewerTimezone: string
): string {
  // Private-session group classrooms (and any class without a fixed weekly
  // slot) have null schedule fields — bail out instead of calling .slice on null.
  if (!scheduleDay || !startTime || !endTime) {
    return 'No fixed schedule';
  }

  const dayIndex: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };

  const targetDayNum = dayIndex[scheduleDay];
  if (targetDayNum === undefined) {
    return `${scheduleDay} ${startTime.slice(0, 5)}-${endTime.slice(0, 5)}`;
  }

  const now = new Date();
  const refDate = new Date(now);
  const currentDay = refDate.getDay();
  const daysUntil = (targetDayNum - currentDay + 7) % 7 || 7;
  refDate.setDate(refDate.getDate() + daysUntil);
  const refYmd = refDate.toISOString().slice(0, 10);

  const startUtc = fromZonedTime(`${refYmd}T${startTime.slice(0, 5)}`, classTimezone);
  const endUtc = fromZonedTime(`${refYmd}T${endTime.slice(0, 5)}`, classTimezone);

  const startInViewer = formatInTimeZone(startUtc, viewerTimezone, 'EEEE HH:mm');
  const endInViewer = formatInTimeZone(endUtc, viewerTimezone, 'HH:mm');
  const tzAbbrev = formatInTimeZone(startUtc, viewerTimezone, 'zzz');

  const [viewerDayName, viewerStartTime] = startInViewer.split(' ');
  return `${viewerDayName} ${viewerStartTime}-${endInViewer} ${tzAbbrev}`;
}

const scheduleDayCodes = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
type ScheduleDayCode = (typeof scheduleDayCodes)[number];

export function normalizeScheduleDays(input: unknown): ScheduleDayCode[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<ScheduleDayCode>();
  for (const value of input) {
    const code = typeof value === 'string' ? value.toLowerCase() : '';
    if ((scheduleDayCodes as readonly string[]).includes(code)) {
      seen.add(code as ScheduleDayCode);
    }
  }
  return scheduleDayCodes.filter((code) => seen.has(code));
}

/**
 * Returns the days-of-week a class recurs on. Prefers the multi-day
 * `schedule_days` array; falls back to the legacy single `schedule_day`.
 * Returns `[]` for classes without a weekly slot (private session groups).
 */
export function getClassScheduleDays(
  classRow: Pick<ClassRow, 'schedule_day' | 'schedule_days'>
): ScheduleDayCode[] {
  const fromArray = normalizeScheduleDays(classRow.schedule_days);
  if (fromArray.length > 0) return fromArray;
  const single = classRow.schedule_day as string | null;
  if (single && (scheduleDayCodes as readonly string[]).includes(single)) {
    return [single as ScheduleDayCode];
  }
  return [];
}

/**
 * Returns the effective start/end window for a class. Prefers per-class
 * `start_date`/`end_date`; falls back to the term's dates when the class
 * is term-anchored.
 */
export function getClassWindow(
  classRow: Pick<ClassRow, 'start_date' | 'end_date'>,
  term?: Pick<TermRow, 'start_date' | 'end_date'> | null
): { start: string | null; end: string | null } {
  const start = classRow.start_date ?? term?.start_date ?? null;
  const end = classRow.end_date ?? term?.end_date ?? null;
  return { start, end };
}

/**
 * True if `ymd` (YYYY-MM-DD, in the class timezone) is inside the class's
 * effective window and matches one of its scheduled days.
 */
export function isClassSessionDate(
  ymd: string,
  classRow: Pick<ClassRow, 'schedule_day' | 'schedule_days' | 'start_date' | 'end_date'>,
  term?: Pick<TermRow, 'start_date' | 'end_date'> | null
): boolean {
  const { start, end } = getClassWindow(classRow, term);
  if (start && ymd < start) return false;
  if (end && ymd > end) return false;
  const days = getClassScheduleDays(classRow);
  if (days.length === 0) return false;
  const [y, m, d] = ymd.split('-').map((n) => Number.parseInt(n, 10));
  if (!y || !m || !d) return false;
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const code = scheduleDayCodes[dow];
  return days.includes(code);
}

/**
 * Human label for a multi-day schedule, in the viewer's timezone. Handles
 * timezone-driven weekday shifts by resolving each day independently and
 * de-duplicating the resulting labels.
 */
export function formatClassScheduleDaysForViewer(
  scheduleDays: string[] | null | undefined,
  fallbackScheduleDay: string | null | undefined,
  startTime: string | null,
  endTime: string | null,
  classTimezone: string,
  viewerTimezone: string
): string {
  const days = normalizeScheduleDays(scheduleDays);
  const list =
    days.length > 0
      ? days
      : fallbackScheduleDay && (scheduleDayCodes as readonly string[]).includes(fallbackScheduleDay)
        ? [fallbackScheduleDay]
        : [];
  if (list.length === 0 || !startTime || !endTime) return 'No fixed schedule';

  const parts = list
    .map((day) => formatClassScheduleForViewer(day, startTime, endTime, classTimezone, viewerTimezone))
    .filter((s) => s && s !== 'No fixed schedule');

  const dayLabels: string[] = [];
  let sharedTime = '';
  for (const part of parts) {
    const spaceIndex = part.indexOf(' ');
    if (spaceIndex < 0) continue;
    const dayLabel = part.slice(0, spaceIndex);
    const timeLabel = part.slice(spaceIndex + 1);
    if (!sharedTime) sharedTime = timeLabel;
    if (!dayLabels.includes(dayLabel)) dayLabels.push(dayLabel);
    if (timeLabel !== sharedTime) {
      // Different times per day (rare, e.g. DST edge) — fall back to
      // listing each schedule line separately.
      return parts.join(' / ');
    }
  }
  if (dayLabels.length === 0 || !sharedTime) return 'No fixed schedule';
  return `${dayLabels.join('/')} ${sharedTime}`;
}
