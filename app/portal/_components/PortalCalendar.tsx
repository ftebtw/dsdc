"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { PortalRole } from "@/lib/portal/auth";
import EventFormModal, { type EventItem } from "@/app/portal/_components/EventFormModal";

type CalendarClass = {
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

type CalendarPayload = {
  classes: CalendarClass[];
  events: EventItem[];
  term: {
    start_date: string;
    end_date: string;
    name: string;
  } | null;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const classColorMap: Record<string, { solid: string; faded: string }> = {
  novice_debate: {
    solid: "bg-blue-600 text-white border border-blue-700",
    faded: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-700/60",
  },
  intermediate_debate: {
    solid: "bg-teal-600 text-white border border-teal-700",
    faded: "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-700/60",
  },
  public_speaking: {
    solid: "bg-amber-500 text-navy-900 border border-amber-600",
    faded: "bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-700/60",
  },
  wsc: {
    solid: "bg-purple-600 text-white border border-purple-700",
    faded: "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/35 dark:text-purple-200 dark:border-purple-700/60",
  },
  advanced_debate: {
    solid: "bg-navy-800 text-white border border-navy-900",
    faded: "bg-navy-50 text-navy-800 border border-navy-200 dark:bg-navy-800/45 dark:text-navy-100 dark:border-navy-600/60",
  },
};

const eventColorMap: Record<EventItem["event_type"], string> = {
  tournament: "bg-gold-100 text-gold-900 border border-gold-300 dark:bg-gold-900/30 dark:text-gold-100 dark:border-gold-700/60",
  workshop: "bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-700/60",
  social: "bg-pink-100 text-pink-900 border border-pink-300 dark:bg-pink-900/30 dark:text-pink-100 dark:border-pink-700/60",
  deadline: "bg-red-100 text-red-900 border border-red-300 dark:bg-red-900/30 dark:text-red-100 dark:border-red-700/60",
  event: "bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-700/60",
  important: "bg-red-100 text-red-900 border border-red-300 dark:bg-red-900/30 dark:text-red-100 dark:border-red-700/60",
  other: "bg-warm-100 text-charcoal border border-warm-300 dark:bg-navy-800/50 dark:text-navy-100 dark:border-navy-600/60",
};

const timezoneOptions = [
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

function toKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function toTimeLabel(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 5);
}

function classPillClass(type: string, isMine: boolean) {
  const palette = classColorMap[type] ?? classColorMap.novice_debate;
  return isMine ? palette.solid : palette.faded;
}

function eventPillClass(type: EventItem["event_type"]) {
  return eventColorMap[type] ?? eventColorMap.other;
}

function eventPillStyle(eventItem: EventItem) {
  if (eventItem.source !== "calendar_events" || !eventItem.color) return undefined;
  return { backgroundColor: eventItem.color, borderColor: eventItem.color, color: "#ffffff" };
}

function inTerm(date: Date, term: CalendarPayload["term"]) {
  if (!term) return false;
  const day = startOfDay(date).getTime();
  const start = parseISO(term.start_date).getTime();
  const end = parseISO(term.end_date).getTime();
  return day >= start && day <= end;
}

function normalizeTimeZone(timezone: string | null | undefined) {
  const fallback = "America/Vancouver";
  const candidate = timezone || fallback;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: candidate });
    return candidate;
  } catch {
    return fallback;
  }
}

function shortTimezoneLabel(timezone: string) {
  const value = timezone.split("/").pop() || timezone;
  return value.replace(/_/g, " ");
}

function parseTimeParts(value: string) {
  const parts = value.split(":");
  const hour = Number(parts[0] || "0");
  const minute = Number(parts[1] || "0");
  const second = Number(parts[2] || "0");
  if ([hour, minute, second].some((part) => Number.isNaN(part))) return null;
  return { hour, minute, second };
}

function getOffsetMinutesForTimeZone(date: Date, timezone: string) {
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

function localTimeInTimezoneToUtc(dateStr: string, timeStr: string, timezone: string) {
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

function convertTimeForDisplay(
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
  } catch {
    return toTimeLabel(time);
  }
}

function eventTimeRange(eventItem: EventItem, displayTimezone: string) {
  if (eventItem.is_all_day) return "All day";
  if (!eventItem.start_time && !eventItem.end_time) return "All day";

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
    sourceTimezone !== targetTimezone ? ` (from ${shortTimezoneLabel(sourceTimezone)})` : "";

  if (start && end) return `${start} - ${end}${suffix}`;
  if (start) return `${start} start${suffix}`;
  return `Until ${end}${suffix}`;
}

function classTimeRange(classItem: CalendarClass, displayTimezone: string, dateKey: string) {
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
  if (start) return `${start} start`;
  return `Until ${end}`;
}

export default function PortalCalendar({
  role,
  userTimezone,
}: {
  role: PortalRole;
  userTimezone?: string | null;
}) {
  const canManageEvents = role === "admin" || role === "coach" || role === "ta";
  const [mobileView, setMobileView] = useState<"agenda" | "grid">("agenda");
  const [monthDate, setMonthDate] = useState<Date>(() => startOfMonth(new Date()));
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [displayTimezone, setDisplayTimezone] = useState(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return normalizeTimeZone(userTimezone || browserTimezone || "America/Vancouver");
  });
  const [payload, setPayload] = useState<CalendarPayload>({ classes: [], events: [], term: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<CalendarClass | null>(null);
  const [selectedClassDate, setSelectedClassDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventModalDate, setEventModalDate] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("filter");
    if (initial === "mine") {
      setFilter("mine");
    }
  }, []);

  useEffect(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDisplayTimezone(normalizeTimeZone(userTimezone || browserTimezone || "America/Vancouver"));
  }, [userTimezone]);

  const monthStart = useMemo(() => startOfMonth(monthDate), [monthDate]);
  const monthEnd = useMemo(() => endOfMonth(monthDate), [monthDate]);
  const gridStart = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 0 }), [monthStart]);
  const gridEnd = useMemo(() => endOfWeek(monthEnd, { weekStartsOn: 0 }), [monthEnd]);

  const dayCells = useMemo(() => {
    const result: Date[] = [];
    let cursor = gridStart;
    while (cursor <= gridEnd) {
      result.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return result;
  }, [gridEnd, gridStart]);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      setLoading(true);
      setError(null);
      const from = toKey(gridStart);
      const to = toKey(gridEnd);
      const response = await fetch(`/api/portal/calendar?from=${from}&to=${to}&filter=${filter}`, {
        cache: "no-store",
      });
      const result = (await response.json()) as CalendarPayload & { error?: string };
      if (ignore) return;
      if (!response.ok) {
        setError(result.error || "Could not load calendar.");
        setLoading(false);
        return;
      }
      setPayload({
        classes: result.classes ?? [],
        events: result.events ?? [],
        term: result.term ?? null,
      });
      setLoading(false);
    }

    void loadData();
    return () => {
      ignore = true;
    };
  }, [filter, gridEnd, gridStart]);

  const classesByDate = useMemo(() => {
    const map = new Map<string, CalendarClass[]>();
    for (const date of dayCells) {
      if (!inTerm(date, payload.term)) continue;
      const list = payload.classes.filter((classItem) => classItem.weekday_index === date.getDay());
      if (list.length) map.set(toKey(date), list);
    }
    return map;
  }, [dayCells, payload.classes, payload.term]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const eventItem of payload.events) {
      const key = eventItem.event_date;
      const existing = map.get(key) ?? [];
      existing.push(eventItem);
      map.set(key, existing);
    }
    return map;
  }, [payload.events]);

  const agendaDays = useMemo(() => {
    return dayCells
      .map((date) => {
        const key = toKey(date);
        const classItems = classesByDate.get(key) ?? [];
        const eventItems = eventsByDate.get(key) ?? [];
        return { date, key, classItems, eventItems };
      })
      .filter((row) => row.classItems.length > 0 || row.eventItems.length > 0 || isToday(row.date));
  }, [classesByDate, dayCells, eventsByDate]);

  function updateFilter(nextFilter: "all" | "mine") {
    setFilter(nextFilter);
    const params = new URLSearchParams(window.location.search);
    if (nextFilter === "mine") params.set("filter", "mine");
    else params.delete("filter");
    const next = params.toString();
    window.history.replaceState({}, "", next ? `?${next}` : window.location.pathname);
  }

  function openCreateEvent(date: string | null) {
    setEditingEvent(null);
    setEventModalDate(date);
    setEventModalOpen(true);
  }

  function onSavedEvent() {
    const from = toKey(gridStart);
    const to = toKey(gridEnd);
    void fetch(`/api/portal/calendar?from=${from}&to=${to}&filter=${filter}`, { cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json()) as CalendarPayload & { error?: string };
        if (!response.ok) {
          throw new Error(result.error || "Could not refresh calendar.");
        }
        setPayload(result);
      })
      .catch(() => {
        setError("Could not refresh calendar.");
      });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthDate((current) => addDays(startOfMonth(current), -1))}
            className="rounded-md border border-warm-300 dark:border-navy-600 px-2 py-1.5"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-lg font-semibold text-navy-900 dark:text-white min-w-[180px] text-center">
            {format(monthDate, "MMMM yyyy")}
          </h3>
          <button
            type="button"
            onClick={() => setMonthDate((current) => addDays(endOfMonth(current), 1))}
            className="rounded-md border border-warm-300 dark:border-navy-600 px-2 py-1.5"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-2 py-1">
            <label className="text-xs text-charcoal/60 dark:text-navy-300" htmlFor="calendar-timezone">
              Display in:
            </label>
            <select
              id="calendar-timezone"
              value={displayTimezone}
              onChange={(eventValue) => setDisplayTimezone(eventValue.target.value)}
              className="text-xs rounded border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 dark:text-white px-2 py-1"
            >
              {timezoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {role !== "admin" ? (
            <div className="inline-flex rounded-lg border border-warm-300 dark:border-navy-600 overflow-hidden">
              <button
                type="button"
                onClick={() => updateFilter("all")}
                className={`px-3 py-1.5 text-sm ${filter === "all" ? "bg-navy-800 text-white" : "bg-white dark:bg-navy-900 text-navy-800 dark:text-navy-100"}`}
              >
                All Classes
              </button>
              <button
                type="button"
                onClick={() => updateFilter("mine")}
                className={`px-3 py-1.5 text-sm ${filter === "mine" ? "bg-navy-800 text-white" : "bg-white dark:bg-navy-900 text-navy-800 dark:text-navy-100"}`}
              >
                My Classes
              </button>
            </div>
          ) : null}

          {canManageEvents ? (
            <button
              type="button"
              onClick={() => openCreateEvent(toKey(new Date()))}
              className="inline-flex items-center gap-1 rounded-md bg-gold-300 text-navy-900 px-3 py-1.5 text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          ) : null}
        </div>
      </div>

      {payload.term ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {payload.term.name}: {payload.term.start_date} to {payload.term.end_date}
        </p>
      ) : (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          No active term found. Event-only calendar is displayed.
        </p>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-sm text-charcoal/70 dark:text-navy-300">Loading calendar...</p> : null}

      <div className="hidden md:block rounded-xl border border-warm-200 dark:border-navy-600 overflow-hidden">
        <div className="grid grid-cols-7 bg-warm-100 dark:bg-navy-800 border-b border-warm-200 dark:border-navy-600">
          {weekdayLabels.map((label) => (
            <div key={label} className="px-2 py-2 text-xs font-semibold text-charcoal/75 dark:text-navy-200">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {dayCells.map((date) => {
            const key = toKey(date);
            const classItems = classesByDate.get(key) ?? [];
            const eventItems = eventsByDate.get(key) ?? [];
            const dimmed = !isSameMonth(date, monthDate);
            const past = startOfDay(date) < startOfDay(new Date());
            return (
              <button
                type="button"
                key={key}
                onClick={() => {
                  if (canManageEvents) openCreateEvent(key);
                }}
                className={`min-h-[132px] border-b border-r border-warm-100 dark:border-navy-700/70 p-2 text-left align-top transition-colors ${
                  dimmed ? "bg-warm-50/50 dark:bg-navy-900/40" : "bg-white dark:bg-navy-900/30"
                } ${past ? "opacity-70" : ""} ${canManageEvents ? "hover:bg-warm-50 dark:hover:bg-navy-800/35" : ""}`}
              >
                <div className="mb-1">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                      isToday(date)
                        ? "ring-2 ring-gold-400 bg-gold-100 text-navy-900 dark:bg-gold-900/35 dark:text-gold-100"
                        : "text-charcoal/80 dark:text-navy-200"
                    }`}
                  >
                    {format(date, "d")}
                  </span>
                </div>
                <div className="space-y-1">
                  {classItems.map((classItem) => (
                    <div
                      key={`${key}-${classItem.id}`}
                      role="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedClass(classItem);
                        setSelectedClassDate(key);
                        setSelectedEvent(null);
                      }}
                      className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate ${classPillClass(classItem.type, classItem.is_mine)}`}
                      title={`${classItem.name} ${convertTimeForDisplay(
                        classItem.schedule_start_time,
                        classItem.timezone,
                        displayTimezone,
                        key
                      )}`}
                    >
                      {classItem.name}{" "}
                      {convertTimeForDisplay(
                        classItem.schedule_start_time,
                        classItem.timezone,
                        displayTimezone,
                        key
                      )}
                    </div>
                  ))}

                  {eventItems.map((eventItem) => (
                    <div
                      key={`${key}-event-${eventItem.id}`}
                      role="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedEvent(eventItem);
                        setSelectedClass(null);
                        setSelectedClassDate(null);
                      }}
                      className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate border ${eventPillClass(eventItem.event_type)}`}
                      style={eventPillStyle(eventItem)}
                      title={`${eventItem.title}${eventItem.start_time || eventItem.end_time ? ` (${eventTimeRange(eventItem, displayTimezone)})` : ""}`}
                    >
                      {eventItem.is_important ? "⚠️ " : null}
                      {eventItem.event_type === "tournament" ? "🏆 " : null}
                      {eventItem.title}
                      {eventItem.start_time || eventItem.end_time
                        ? ` ${eventTimeRange(eventItem, displayTimezone)}`
                        : ""}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="md:hidden space-y-3">
        <div className="inline-flex rounded-lg border border-warm-300 dark:border-navy-600 overflow-hidden">
          <button
            type="button"
            onClick={() => setMobileView("agenda")}
            className={`px-3 py-1.5 text-sm ${mobileView === "agenda" ? "bg-navy-800 text-white" : "bg-white dark:bg-navy-900 text-navy-800 dark:text-navy-100"}`}
          >
            Agenda
          </button>
          <button
            type="button"
            onClick={() => setMobileView("grid")}
            className={`px-3 py-1.5 text-sm ${mobileView === "grid" ? "bg-navy-800 text-white" : "bg-white dark:bg-navy-900 text-navy-800 dark:text-navy-100"}`}
          >
            Calendar
          </button>
        </div>

        {mobileView === "agenda" ? (
          agendaDays.length === 0 ? (
            <p className="text-sm text-charcoal/70 dark:text-navy-300">No classes or events in this range.</p>
          ) : (
            agendaDays.map((day) => (
              <div key={day.key} className="rounded-xl border border-warm-200 dark:border-navy-600 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-navy-900 dark:text-white">{format(day.date, "EEE, MMM d")}</p>
                  {canManageEvents ? (
                    <button
                      type="button"
                      onClick={() => openCreateEvent(day.key)}
                      className="text-xs rounded-md border border-warm-300 dark:border-navy-600 px-2 py-1"
                    >
                      Add Event
                    </button>
                  ) : null}
                </div>
                <div className="space-y-1">
                  {day.classItems.map((classItem) => (
                    <button
                      type="button"
                      key={`m-${day.key}-${classItem.id}`}
                      onClick={() => {
                        setSelectedClass(classItem);
                        setSelectedClassDate(day.key);
                        setSelectedEvent(null);
                      }}
                      className={`w-full text-left text-xs px-2 py-1 rounded ${classPillClass(classItem.type, classItem.is_mine)}`}
                    >
                      {classItem.name} ({classTimeRange(classItem, displayTimezone, day.key)})
                    </button>
                  ))}
                  {day.eventItems.map((eventItem) => (
                    <button
                      type="button"
                      key={`m-${day.key}-e-${eventItem.id}`}
                      onClick={() => {
                        setSelectedEvent(eventItem);
                        setSelectedClass(null);
                        setSelectedClassDate(null);
                      }}
                      className={`w-full text-left text-xs px-2 py-1 rounded border ${eventPillClass(eventItem.event_type)}`}
                      style={eventPillStyle(eventItem)}
                    >
                      {eventItem.is_important ? "⚠️ " : null}
                      {eventItem.title} ({eventTimeRange(eventItem, displayTimezone)})
                    </button>
                  ))}
                </div>
              </div>
            ))
          )
        ) : (
          <div className="rounded-xl border border-warm-200 dark:border-navy-600 overflow-hidden">
            <div className="grid grid-cols-7 bg-warm-100 dark:bg-navy-800 border-b border-warm-200 dark:border-navy-600">
              {weekdayLabels.map((label) => (
                <div key={`m-grid-${label}`} className="px-1 py-1 text-[10px] text-center font-semibold text-charcoal/70 dark:text-navy-200">
                  {label.slice(0, 1)}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {dayCells.map((date) => {
                const key = toKey(date);
                const classItems = classesByDate.get(key) ?? [];
                const eventItems = eventsByDate.get(key) ?? [];
                const dimmed = !isSameMonth(date, monthDate);
                return (
                  <button
                    type="button"
                    key={`m-grid-${key}`}
                    onClick={() => {
                      if (canManageEvents) openCreateEvent(key);
                    }}
                    className={`min-h-[74px] border-b border-r border-warm-100 dark:border-navy-700/70 p-1 text-left ${
                      dimmed ? "bg-warm-50/50 dark:bg-navy-900/40" : "bg-white dark:bg-navy-900/30"
                    }`}
                  >
                    <div className={`text-[10px] ${isToday(date) ? "font-bold text-gold-700 dark:text-gold-300" : "text-charcoal/70 dark:text-navy-200"}`}>
                      {format(date, "d")}
                    </div>
                    {classItems.slice(0, 2).map((classItem) => (
                      <div
                        key={`m-grid-class-${key}-${classItem.id}`}
                        role="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedClass(classItem);
                          setSelectedClassDate(key);
                          setSelectedEvent(null);
                        }}
                        className={`mt-0.5 text-[9px] leading-tight px-1 py-0.5 rounded truncate ${classPillClass(classItem.type, classItem.is_mine)}`}
                      >
                        {classItem.name}
                      </div>
                    ))}
                    {eventItems.slice(0, 1).map((eventItem) => (
                      <div
                        key={`m-grid-event-${key}-${eventItem.id}`}
                        role="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedEvent(eventItem);
                          setSelectedClass(null);
                          setSelectedClassDate(null);
                        }}
                        className={`mt-0.5 text-[9px] leading-tight px-1 py-0.5 rounded truncate border ${eventPillClass(eventItem.event_type)}`}
                        style={eventPillStyle(eventItem)}
                      >
                        {eventItem.is_important ? "⚠️ " : null}
                        {eventItem.title}
                      </div>
                    ))}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <EventFormModal
        open={eventModalOpen}
        initialDate={eventModalDate}
        event={editingEvent}
        onClose={() => setEventModalOpen(false)}
        onSaved={onSavedEvent}
      />

      {selectedClass ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={() => {
              setSelectedClass(null);
              setSelectedClassDate(null);
            }}
            aria-label="Close class details"
          />
          <div className="relative w-full max-w-md rounded-xl border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 p-4">
            <h4 className="text-lg font-semibold text-navy-900 dark:text-white">{selectedClass.name}</h4>
            <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">Type: {selectedClass.type}</p>
            <p className="text-sm text-charcoal/70 dark:text-navy-300">Coach: {selectedClass.coach_name}</p>
            <p className="text-sm text-charcoal/70 dark:text-navy-300">
              Time:{" "}
              {selectedClass.schedule_day.toUpperCase()}{" "}
              {classTimeRange(
                selectedClass,
                displayTimezone,
                selectedClassDate || toKey(new Date())
              )}{" "}
              ({displayTimezone})
            </p>
            {normalizeTimeZone(selectedClass.timezone) !== normalizeTimeZone(displayTimezone) ? (
              <p className="text-xs text-charcoal/60 dark:text-navy-400">
                Source timezone: {selectedClass.timezone}
              </p>
            ) : null}
            <p className="text-xs text-charcoal/60 dark:text-navy-400">
              Class timezone: {selectedClass.timezone}
            </p>
            {selectedClass.zoom_link ? (
              <p className="mt-2 text-sm">
                Zoom:{" "}
                <a
                  href={selectedClass.zoom_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-navy-700 dark:text-gold-300"
                >
                  Open link
                </a>
              </p>
            ) : null}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedClass(null);
                  setSelectedClassDate(null);
                }}
                className="rounded-md border border-warm-300 dark:border-navy-600 px-3 py-1.5 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedEvent ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={() => setSelectedEvent(null)}
            aria-label="Close event details"
          />
          <div className="relative w-full max-w-md rounded-xl border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 p-4">
            <h4 className="text-lg font-semibold text-navy-900 dark:text-white">{selectedEvent.title}</h4>
            {selectedEvent.is_important ? (
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">⚠️ Important event</p>
            ) : null}
            <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
              {selectedEvent.event_date} {eventTimeRange(selectedEvent, displayTimezone)}
            </p>
            <p className="text-sm text-charcoal/70 dark:text-navy-300">
              Type: {selectedEvent.event_type}
            </p>
            <p className="text-xs text-charcoal/60 dark:text-navy-400">
              Display timezone: {displayTimezone}
            </p>
            {normalizeTimeZone(selectedEvent.timezone) !== normalizeTimeZone(displayTimezone) ? (
              <p className="text-xs text-charcoal/60 dark:text-navy-400">
                Event timezone: {selectedEvent.timezone || "America/Vancouver"}
              </p>
            ) : null}
            {selectedEvent.location ? (
              <p className="text-sm text-charcoal/70 dark:text-navy-300">Location: {selectedEvent.location}</p>
            ) : null}
            {selectedEvent.source === "calendar_events" ? (
              <p className="text-xs text-charcoal/60 dark:text-navy-400">
                Visibility: {selectedEvent.visibility}
              </p>
            ) : null}
            {selectedEvent.description ? (
              <p className="text-sm text-charcoal/80 dark:text-navy-200 mt-2 whitespace-pre-wrap">
                {selectedEvent.description}
              </p>
            ) : null}
            <div className="mt-4 flex items-center gap-2">
              {canManageEvents && selectedEvent.source === "calendar_events" ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingEvent(selectedEvent);
                    setEventModalDate(selectedEvent.event_date);
                    setEventModalOpen(true);
                    setSelectedEvent(null);
                  }}
                  className="rounded-md bg-gold-300 text-navy-900 px-3 py-1.5 text-sm font-semibold"
                >
                  Edit Event
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-md border border-warm-300 dark:border-navy-600 px-3 py-1.5 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

