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
import { useI18n } from "@/lib/i18n";
import { portalT } from "@/lib/portal/parent-i18n";
import ClassDetailSheet from "./ClassDetailSheet";
import EventDetailSheet from "./EventDetailSheet";
import {
  type CalendarClass,
  type CalendarPayload,
  weekdayLabels,
  weekdayKeys,
  timezoneOptions,
  toKey,
  classPillClass,
  eventPillClass,
  eventPillStyle,
  inTerm,
  normalizeTimeZone,
  convertTimeForDisplay,
  eventTimeRange,
  classTimeRange,
} from "./calendarUtils";

export default function PortalCalendar({
  role,
  userTimezone,
}: {
  role: PortalRole;
  userTimezone?: string | null;
}) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
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
        setError(result.error || t("portal.portalCalendar.loadError", "Could not load calendar."));
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
          throw new Error(result.error || t("portal.portalCalendar.refreshError", "Could not refresh calendar."));
        }
        setPayload(result);
      })
      .catch(() => {
        setError(t("portal.portalCalendar.refreshError", "Could not refresh calendar."));
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
            aria-label={t("portal.portalCalendar.previousMonth", "Previous month")}
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
            aria-label={t("portal.portalCalendar.nextMonth", "Next month")}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-md border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-2 py-1">
            <label className="text-xs text-charcoal/60 dark:text-navy-300" htmlFor="calendar-timezone">
              {t("portal.portalCalendar.displayIn", "Display in:")}
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
                {t("portal.portalCalendar.allClasses", "All Classes")}
              </button>
              <button
                type="button"
                onClick={() => updateFilter("mine")}
                className={`px-3 py-1.5 text-sm ${filter === "mine" ? "bg-navy-800 text-white" : "bg-white dark:bg-navy-900 text-navy-800 dark:text-navy-100"}`}
              >
                {t("portal.portalCalendar.myClasses", "My Classes")}
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
              {t("portal.eventForm.addTitle", "Add Event")}
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
          {t("portal.portalCalendar.noActiveTerm", "No active term found. Event-only calendar is displayed.")}
        </p>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {t("portal.portalCalendar.loading", "Loading calendar...")}
        </p>
      ) : null}

      <div className="hidden md:block rounded-xl border border-warm-200 dark:border-navy-600 overflow-hidden">
        <div className="grid grid-cols-7 bg-warm-100 dark:bg-navy-800 border-b border-warm-200 dark:border-navy-600">
          {weekdayLabels.map((label, index) => (
            <div key={label} className="px-2 py-2 text-xs font-semibold text-charcoal/75 dark:text-navy-200">
              {t(`portal.portalCalendar.weekday.${weekdayKeys[index]}`, label)}
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
                      title={`${eventItem.title}${eventItem.start_time || eventItem.end_time ? ` (${eventTimeRange(eventItem, displayTimezone, t)})` : ""}`}
                    >
                      {eventItem.is_important ? "[!] " : null}
                      {eventItem.event_type === "tournament" ? "[T] " : null}
                      {eventItem.title}
                      {eventItem.start_time || eventItem.end_time
                        ? ` ${eventTimeRange(eventItem, displayTimezone, t)}`
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
            {t("portal.portalCalendar.agenda", "Agenda")}
          </button>
          <button
            type="button"
            onClick={() => setMobileView("grid")}
            className={`px-3 py-1.5 text-sm ${mobileView === "grid" ? "bg-navy-800 text-white" : "bg-white dark:bg-navy-900 text-navy-800 dark:text-navy-100"}`}
          >
            {t("portal.portalCalendar.calendar", "Calendar")}
          </button>
        </div>

        {mobileView === "agenda" ? (
          agendaDays.length === 0 ? (
            <p className="text-sm text-charcoal/70 dark:text-navy-300">
              {t("portal.portalCalendar.emptyRange", "No classes or events in this range.")}
            </p>
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
                      {t("portal.eventForm.addTitle", "Add Event")}
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
                      {classItem.name} ({classTimeRange(classItem, displayTimezone, day.key, t)})
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
                      {eventItem.is_important ? "[!] " : null}
                      {eventItem.title} ({eventTimeRange(eventItem, displayTimezone, t)})
                    </button>
                  ))}
                </div>
              </div>
            ))
          )
        ) : (
          <div className="rounded-xl border border-warm-200 dark:border-navy-600 overflow-hidden">
            <div className="grid grid-cols-7 bg-warm-100 dark:bg-navy-800 border-b border-warm-200 dark:border-navy-600">
              {weekdayLabels.map((label, index) => (
                <div key={`m-grid-${label}`} className="px-1 py-1 text-[10px] text-center font-semibold text-charcoal/70 dark:text-navy-200">
                  {t(`portal.portalCalendar.weekdayShort.${weekdayKeys[index]}`, label.slice(0, 1))}
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
                        {eventItem.is_important ? "[!] " : null}
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
        <ClassDetailSheet
          classItem={selectedClass}
          classDate={selectedClassDate}
          displayTimezone={displayTimezone}
          t={t}
          onClose={() => {
            setSelectedClass(null);
            setSelectedClassDate(null);
          }}
        />
      ) : null}

      {selectedEvent ? (
        <EventDetailSheet
          event={selectedEvent}
          displayTimezone={displayTimezone}
          canManageEvents={canManageEvents}
          t={t}
          onClose={() => setSelectedEvent(null)}
          onEdit={() => {
            setEditingEvent(selectedEvent);
            setEventModalDate(selectedEvent.event_date);
            setEventModalOpen(true);
            setSelectedEvent(null);
          }}
        />
      ) : null}
    </div>
  );
}

