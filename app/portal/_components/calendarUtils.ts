import { format, parseISO, startOfDay } from "date-fns";
import type { EventItem } from "@/app/portal/_components/EventFormModal";

export type CalendarClass = {
  id: string;
  name: string;
  type: string;
  coach_name: string;
  schedule_day: string;
  schedule_start_time: string;
  schedule_end_time: string;
  timezone: string;
  zoom_link: string | null;
  is_mine: boolean;
  weekday_index: number;
};

export type CalendarCancellation = {
  class_id: string;
  cancellation_date: string;
  reason: string;
};

export type CalendarPayload = {
  classes: CalendarClass[];
  events: EventItem[];
  cancellations: CalendarCancellation[];
  term: {
    start_date: string;
    end_date: string;
    name: string;
  } | null;
};

export const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const weekdayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export const classColorMap: Record<string, { solid: string; faded: string }> = {
  novice_debate: {
    solid: "bg-blue-600 text-white border border-blue-700",
    faded:
      "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-700/60",
  },
  intermediate_debate: {
    solid: "bg-teal-600 text-white border border-teal-700",
    faded:
      "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-700/60",
  },
  public_speaking: {
    solid: "bg-amber-500 text-navy-900 border border-amber-600",
    faded:
      "bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-700/60",
  },
  wsc: {
    solid: "bg-purple-600 text-white border border-purple-700",
    faded:
      "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/35 dark:text-purple-200 dark:border-purple-700/60",
  },
  advanced_debate: {
    solid: "bg-navy-800 text-white border border-navy-900",
    faded:
      "bg-navy-50 text-navy-800 border border-navy-200 dark:bg-navy-800/45 dark:text-navy-100 dark:border-navy-600/60",
  },
};

export const eventColorMap: Record<EventItem["event_type"], string> = {
  tournament:
    "bg-gold-100 text-gold-900 border border-gold-300 dark:bg-gold-900/30 dark:text-gold-100 dark:border-gold-700/60",
  workshop:
    "bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-700/60",
  social:
    "bg-pink-100 text-pink-900 border border-pink-300 dark:bg-pink-900/30 dark:text-pink-100 dark:border-pink-700/60",
  deadline:
    "bg-red-100 text-red-900 border border-red-300 dark:bg-red-900/30 dark:text-red-100 dark:border-red-700/60",
  event:
    "bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-700/60",
  important:
    "bg-red-100 text-red-900 border border-red-300 dark:bg-red-900/30 dark:text-red-100 dark:border-red-700/60",
  other:
    "bg-warm-100 text-charcoal border border-warm-300 dark:bg-navy-800/50 dark:text-navy-100 dark:border-navy-600/60",
};

export const timezoneOptions = [
  { value: "America/Vancouver", label: "Pacific - Vancouver (PT)" },
  { value: "America/Edmonton", label: "Mountain - Edmonton (MT)" },
  { value: "America/Winnipeg", label: "Central - Winnipeg (CT)" },
  { value: "America/Toronto", label: "Eastern - Toronto (ET)" },
  { value: "America/Halifax", label: "Atlantic - Halifax (AT)" },
  { value: "America/St_Johns", label: "Newfoundland - St. John's (NT)" },
  { value: "America/Los_Angeles", label: "Pacific - Los Angeles (PT)" },
  { value: "America/Chicago", label: "Central - Chicago (CT)" },
  { value: "America/New_York", label: "Eastern - New York (ET)" },
  { value: "America/Denver", label: "Mountain - Denver (MT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Shanghai", label: "Shanghai / Beijing (CST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Seoul", label: "Seoul (KST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
  { value: "Pacific/Auckland", label: "Auckland (NZST)" },
] as const;

export function toKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function toTimeLabel(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 5);
}

export function classPillClass(type: string, isMine: boolean) {
  const palette = classColorMap[type] ?? classColorMap.novice_debate;
  return isMine ? palette.solid : palette.faded;
}

export function eventPillClass(type: EventItem["event_type"]) {
  return eventColorMap[type] ?? eventColorMap.other;
}

export function eventPillStyle(eventItem: EventItem) {
  if (eventItem.source !== "calendar_events" || !eventItem.color) return undefined;
  return { backgroundColor: eventItem.color, borderColor: eventItem.color, color: "#ffffff" };
}

export function inTerm(date: Date, term: CalendarPayload["term"]) {
  if (!term) return false;
  const day = startOfDay(date).getTime();
  return day >= parseISO(term.start_date).getTime() && day <= parseISO(term.end_date).getTime();
}

export function normalizeTimeZone(timezone: string | null | undefined) {
  const fallback = "America/Vancouver";
  const candidate = timezone || fallback;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: candidate });
    return candidate;
  } catch (error) {
    console.error("[portal-calendar] error:", error);
    return fallback;
  }
}

export function shortTimezoneLabel(timezone: string) {
  const value = timezone.split("/").pop() || timezone;
  return value.replace(/_/g, " ");
}

export function parseTimeParts(value: string) {
  const parts = value.split(":");
  const hour = Number(parts[0] || "0");
  const minute = Number(parts[1] || "0");
  const second = Number(parts[2] || "0");
  if ([hour, minute, second].some((part) => Number.isNaN(part))) return null;
  return { hour, minute, second };
}

export function getOffsetMinutesForTimeZone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const values = new Map<string, string>();
  for (const part of parts) {
    if (part.type !== "literal") values.set(part.type, part.value);
  }

  const asUtc = Date.UTC(
    Number(values.get("year") || "0"),
    Number(values.get("month") || "1") - 1,
    Number(values.get("day") || "1"),
    Number(values.get("hour") || "0"),
    Number(values.get("minute") || "0"),
    Number(values.get("second") || "0")
  );

  return (asUtc - date.getTime()) / 60000;
}

export function localTimeInTimezoneToUtc(dateStr: string, timeStr: string, timezone: string) {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const parsedTime = parseTimeParts(timeStr);
  if (!year || !month || !day || !parsedTime) return null;

  const utcGuess = new Date(
    Date.UTC(year, month - 1, day, parsedTime.hour, parsedTime.minute, parsedTime.second)
  );
  const offsetMinutes = getOffsetMinutesForTimeZone(utcGuess, timezone);
  return new Date(utcGuess.getTime() - offsetMinutes * 60000);
}

export function convertTimeForDisplay(
  time: string | null | undefined,
  fromTimezone: string | null | undefined,
  toTimezone: string | null | undefined,
  dateStr: string
) {
  if (!time) return "";
  const from = normalizeTimeZone(fromTimezone);
  const to = normalizeTimeZone(toTimezone);
  if (from === to) return toTimeLabel(time);

  try {
    const utcDate = localTimeInTimezoneToUtc(dateStr, time, from);
    if (!utcDate) return toTimeLabel(time);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: to,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(utcDate);
  } catch (error) {
    console.error("[portal-calendar] error:", error);
    return toTimeLabel(time);
  }
}

export function eventTimeRange(
  eventItem: EventItem,
  displayTimezone: string,
  t: (key: string, fallback: string) => string
) {
  if (eventItem.is_all_day) return t("portal.portalCalendar.allDay", "All day");
  if (!eventItem.start_time && !eventItem.end_time) return t("portal.portalCalendar.allDay", "All day");

  const sourceTimezone = normalizeTimeZone(eventItem.timezone);
  const targetTimezone = normalizeTimeZone(displayTimezone);
  const start = convertTimeForDisplay(
    eventItem.start_time,
    sourceTimezone,
    targetTimezone,
    eventItem.event_date
  );
  const end = convertTimeForDisplay(
    eventItem.end_time,
    sourceTimezone,
    targetTimezone,
    eventItem.event_date
  );

  const suffix =
    sourceTimezone !== targetTimezone
      ? t("portal.portalCalendar.fromTimezoneSuffix", "(from {timezone})").replace(
          "{timezone}",
          shortTimezoneLabel(sourceTimezone)
        )
      : "";

  if (start && end) return `${start} - ${end}${suffix}`;
  if (start) return `${start} ${t("portal.portalCalendar.startWord", "start")}${suffix}`;
  return `${t("portal.portalCalendar.untilWord", "Until")} ${end}${suffix}`;
}

export function classTimeRange(
  classItem: CalendarClass,
  displayTimezone: string,
  dateKey: string,
  t: (key: string, fallback: string) => string
) {
  const start = convertTimeForDisplay(
    classItem.schedule_start_time,
    classItem.timezone,
    displayTimezone,
    dateKey
  );
  const end = convertTimeForDisplay(
    classItem.schedule_end_time,
    classItem.timezone,
    displayTimezone,
    dateKey
  );
  if (start && end) return `${start} - ${end}`;
  if (start) return `${start} ${t("portal.portalCalendar.startWord", "start")}`;
  return `${t("portal.portalCalendar.untilWord", "Until")} ${end}`;
}
