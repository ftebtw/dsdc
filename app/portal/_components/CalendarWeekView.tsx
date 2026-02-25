"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

type ClassBlock = {
  kind: "class";
  id: string;
  name: string;
  scheduleDay: string;
  startTime: string;
  endTime: string;
  timezone: string;
  coachName: string | null;
};

type EventBlock = {
  kind: "event";
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  color: string;
  isAllDay: boolean;
  isImportant: boolean;
  visibility: string;
  createdBy: string;
};

type PositionedClass = {
  item: ClassBlock;
  dayIndex: number;
  startMin: number;
  endMin: number;
};

type PositionedEvent = {
  item: EventBlock;
  dayIndex: number;
  startMin: number;
  endMin: number;
};

type Props = {
  classes: ClassBlock[];
  viewerTimezone: string;
  userId: string;
  isAdmin: boolean;
};

const HOUR_START = 7;
const HOUR_END = 22;
const MINUTES_TOTAL = (HOUR_END - HOUR_START) * 60;
const CANVAS_HEIGHT = MINUTES_TOTAL;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_MAP: Record<string, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

const TIMEZONES = [
  "America/Vancouver",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Edmonton",
  "America/Halifax",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Seoul",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
  "UTC",
] as const;

function ymd(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toShortDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getMonday(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function minutesOf(time: string): number {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

function clampRange(start: number, end: number): { start: number; end: number } | null {
  const boundedStart = Math.max(start, HOUR_START * 60);
  const boundedEnd = Math.min(end, HOUR_END * 60);
  if (boundedEnd <= boundedStart) return null;
  return { start: boundedStart, end: boundedEnd };
}

function topPercent(minutes: number): number {
  return ((minutes - HOUR_START * 60) / MINUTES_TOTAL) * 100;
}

function heightPercent(start: number, end: number): number {
  return ((end - start) / MINUTES_TOTAL) * 100;
}

function convertToViewer(dateStr: string, timeStr: string, fromTz: string, viewerTz: string) {
  const utc = fromZonedTime(`${dateStr}T${timeStr.slice(0, 5)}`, fromTz);
  const viewerDate = formatInTimeZone(utc, viewerTz, "yyyy-MM-dd");
  const viewerTime = formatInTimeZone(utc, viewerTz, "HH:mm");
  return {
    date: viewerDate,
    minutes: minutesOf(viewerTime),
  };
}

type EventPayload = {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  color: string;
  visibility: "personal" | "all_coaches" | "everyone";
  isAllDay: boolean;
  isImportant: boolean;
};

function EventModal({
  initial,
  weekMonday,
  defaultTimezone,
  onSave,
  onCancel,
  saving,
}: {
  initial?: EventBlock | null;
  weekMonday: Date;
  defaultTimezone: string;
  onSave: (payload: EventPayload) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [eventDate, setEventDate] = useState(initial?.eventDate ?? ymd(weekMonday));
  const [startTime, setStartTime] = useState(initial?.startTime.slice(0, 5) ?? "09:00");
  const [endTime, setEndTime] = useState(initial?.endTime.slice(0, 5) ?? "10:00");
  const [timezone, setTimezone] = useState(initial?.timezone ?? defaultTimezone);
  const [color, setColor] = useState(initial?.color ?? "#3b82f6");
  const [visibility, setVisibility] = useState<EventPayload["visibility"]>(
    (initial?.visibility as EventPayload["visibility"]) ?? "personal"
  );
  const [isAllDay, setIsAllDay] = useState(initial?.isAllDay ?? false);
  const [isImportant, setIsImportant] = useState(initial?.isImportant ?? false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visibility === "personal" && isImportant) {
      setIsImportant(false);
    }
  }, [isImportant, visibility]);

  async function submit() {
    if (!title.trim()) return;
    if (!isAllDay && endTime <= startTime) {
      setError("End time must be after start time.");
      return;
    }
    setError(null);

    await onSave({
      title: title.trim(),
      description: description.trim(),
      eventDate,
      startTime: isAllDay ? "00:00" : startTime,
      endTime: isAllDay ? "23:59" : endTime,
      timezone,
      color,
      visibility,
      isAllDay,
      isImportant: visibility === "personal" ? false : isImportant,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-warm-200 bg-white p-6 dark:border-navy-600 dark:bg-navy-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-navy-900 dark:text-white">
            {initial ? "Edit Event" : "Add Event"}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded p-1 hover:bg-warm-100 dark:hover:bg-navy-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-sm text-charcoal/70 dark:text-navy-300">Title</span>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-lg border border-warm-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-800"
              placeholder="Tournament prep meeting"
            />
          </label>

          <label className="block">
            <span className="text-sm text-charcoal/70 dark:text-navy-300">Description</span>
            <textarea
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 w-full rounded-lg border border-warm-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-800"
            />
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm text-charcoal/70 dark:text-navy-300">Date</span>
              <input
                required
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-warm-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-800"
              />
            </label>
            <label className="block">
              <span className="text-sm text-charcoal/70 dark:text-navy-300">Start</span>
              <input
                required
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                disabled={isAllDay}
                className="mt-1 w-full rounded-lg border border-warm-300 bg-white px-3 py-2 disabled:opacity-60 dark:border-navy-600 dark:bg-navy-800"
              />
            </label>
            <label className="block">
              <span className="text-sm text-charcoal/70 dark:text-navy-300">End</span>
              <input
                required
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                disabled={isAllDay}
                className="mt-1 w-full rounded-lg border border-warm-300 bg-white px-3 py-2 disabled:opacity-60 dark:border-navy-600 dark:bg-navy-800"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-charcoal/70 dark:text-navy-300">Timezone</span>
            <select
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="mt-1 w-full rounded-lg border border-warm-300 bg-white px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-800"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-charcoal/80 dark:text-navy-200">
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(event) => setIsAllDay(event.target.checked)}
            />
            All day event
          </label>

          <div>
            <span className="text-sm text-charcoal/70 dark:text-navy-300">Color</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {COLORS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setColor(value)}
                  className={`h-7 w-7 rounded-full border-2 ${
                    color === value ? "scale-110 border-navy-900 dark:border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: value }}
                />
              ))}
            </div>
          </div>

          {(visibility === "all_coaches" || visibility === "everyone") ? (
            <label className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-200">
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(event) => setIsImportant(event.target.checked)}
                className="rounded border-warm-300 dark:border-navy-600"
              />
              <span className="flex items-center gap-1.5">
                Mark as important
                <span className="text-xs text-charcoal/60 dark:text-navy-400">
                  (sends email even to users with &quot;important only&quot; preference)
                </span>
              </span>
            </label>
          ) : null}

          <label className="block">
            <span className="text-sm text-charcoal/70 dark:text-navy-300">Visibility</span>
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as EventPayload["visibility"])}
              className="mt-1 w-full rounded-lg border border-warm-300 bg-white px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-800"
            >
              <option value="personal">Only me</option>
              <option value="all_coaches">All coaches &amp; TAs</option>
              <option value="everyone">Everyone</option>
            </select>
          </label>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-warm-300 px-3 py-2 text-sm dark:border-navy-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              void submit();
            }}
            disabled={saving || !title.trim()}
            className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
          >
            {saving ? "Saving..." : initial ? "Update" : "Add Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CalendarWeekView({ classes, viewerTimezone, userId, isAdmin }: Props) {
  const [weekMonday, setWeekMonday] = useState(() => getMonday(new Date()));
  const [events, setEvents] = useState<EventBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; event?: EventBlock } | null>(null);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, idx) => addDays(weekMonday, idx)), [weekMonday]);
  const weekSunday = weekDays[6];
  const weekDayIndexByYmd = useMemo(() => {
    const map = new Map<string, number>();
    weekDays.forEach((date, idx) => map.set(ymd(date), idx));
    return map;
  }, [weekDays]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const start = ymd(weekMonday);
      const end = ymd(weekSunday);
      const response = await fetch(`/api/portal/calendar-events?start=${start}&end=${end}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        setEvents([]);
        return;
      }
      const data = (await response.json()) as { events?: Array<Record<string, any>> };
      setEvents(
        (data.events ?? []).map((item) => ({
          kind: "event" as const,
          id: String(item.id),
          title: String(item.title || ""),
          description: item.description ? String(item.description) : null,
          eventDate: String(item.event_date),
          startTime: String(item.start_time),
          endTime: String(item.end_time),
          timezone: String(item.timezone || "America/Vancouver"),
          color: String(item.color || "#3b82f6"),
          isAllDay: Boolean(item.is_all_day),
          isImportant: Boolean(item.is_important),
          visibility: String(item.visibility || "personal"),
          createdBy: String(item.created_by || ""),
        }))
      );
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [weekMonday, weekSunday]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  const classBlocks = useMemo(() => {
    const blocks: PositionedClass[] = [];
    for (const classItem of classes) {
      const scheduleDayIndex = DAY_MAP[classItem.scheduleDay];
      if (scheduleDayIndex === undefined) continue;

      const classDate = ymd(weekDays[scheduleDayIndex]);
      const convertedStart = convertToViewer(
        classDate,
        classItem.startTime,
        classItem.timezone,
        viewerTimezone
      );
      const convertedEnd = convertToViewer(classDate, classItem.endTime, classItem.timezone, viewerTimezone);
      const dayIndex = weekDayIndexByYmd.get(convertedStart.date);

      if (dayIndex === undefined) continue;
      const range = clampRange(convertedStart.minutes, convertedEnd.minutes);
      if (!range) continue;

      blocks.push({
        item: classItem,
        dayIndex,
        startMin: range.start,
        endMin: range.end,
      });
    }
    return blocks;
  }, [classes, viewerTimezone, weekDayIndexByYmd, weekDays]);

  const eventBlocks = useMemo(() => {
    const blocks: PositionedEvent[] = [];
    for (const eventItem of events) {
      const convertedStart = convertToViewer(
        eventItem.eventDate,
        eventItem.startTime,
        eventItem.timezone,
        viewerTimezone
      );
      const convertedEnd = convertToViewer(
        eventItem.eventDate,
        eventItem.endTime,
        eventItem.timezone,
        viewerTimezone
      );
      const dayIndex = weekDayIndexByYmd.get(convertedStart.date);
      if (dayIndex === undefined) continue;

      const range = clampRange(convertedStart.minutes, convertedEnd.minutes);
      if (!range) continue;

      blocks.push({
        item: eventItem,
        dayIndex,
        startMin: range.start,
        endMin: range.end,
      });
    }
    return blocks;
  }, [events, viewerTimezone, weekDayIndexByYmd]);

  const hours = useMemo(
    () => Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, idx) => HOUR_START + idx),
    []
  );

  const canEdit = useCallback(
    (eventItem: EventBlock) => eventItem.createdBy === userId || isAdmin,
    [isAdmin, userId]
  );

  async function saveEvent(payload: EventPayload) {
    setSaving(true);
    const editingEvent = modal?.mode === "edit" ? modal.event : undefined;
    const endpoint = editingEvent
      ? `/api/portal/calendar-events/${editingEvent.id}`
      : "/api/portal/calendar-events";
    const method = editingEvent ? "PUT" : "POST";

    try {
      await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setModal(null);
      await fetchEvents();
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(eventId: string) {
    if (!window.confirm("Delete this event?")) return;
    await fetch(`/api/portal/calendar-events/${eventId}`, { method: "DELETE" });
    await fetchEvents();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekMonday((value) => addDays(value, -7))}
            className="rounded-lg border border-warm-300 p-1.5 hover:bg-warm-100 dark:border-navy-600 dark:hover:bg-navy-700"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setWeekMonday(getMonday(new Date()))}
            className="rounded-lg border border-warm-300 px-3 py-1.5 text-sm hover:bg-warm-100 dark:border-navy-600 dark:hover:bg-navy-700"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setWeekMonday((value) => addDays(value, 7))}
            className="rounded-lg border border-warm-300 p-1.5 hover:bg-warm-100 dark:border-navy-600 dark:hover:bg-navy-700"
          >
            <ChevronRight size={18} />
          </button>
          <span className="ml-1 text-sm font-semibold text-navy-900 dark:text-white">
            {toShortDate(weekMonday)} - {toShortDate(weekSunday)}, {weekSunday.getFullYear()}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "add" })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-navy-800 px-3 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} />
          Add Event
        </button>
      </div>

      {loading ? <p className="text-sm text-charcoal/70 dark:text-navy-300">Loading events...</p> : null}

      <div className="overflow-x-auto rounded-xl border border-warm-200 dark:border-navy-600">
        <div className="min-w-[960px]">
          <div className="grid grid-cols-[64px_repeat(7,minmax(120px,1fr))] border-b border-warm-200 dark:border-navy-600">
            <div />
            {weekDays.map((date, idx) => (
              <div
                key={ymd(date)}
                className="border-l border-warm-200 py-2 text-center text-sm font-semibold text-navy-900 dark:border-navy-600 dark:text-white"
              >
                {DAY_LABELS[idx]}
                <br />
                <span className="text-xs font-normal text-charcoal/60 dark:text-navy-400">
                  {toShortDate(date)}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[64px_repeat(7,minmax(120px,1fr))]">
            <div className="relative border-r border-warm-200 dark:border-navy-600" style={{ height: CANVAS_HEIGHT }}>
              {hours.map((hour) => {
                const top = ((hour - HOUR_START) / (HOUR_END - HOUR_START)) * 100;
                return (
                  <div
                    key={hour}
                    className="absolute right-2 text-[11px] text-charcoal/55 dark:text-navy-400"
                    style={{ top: `${top}%`, transform: "translateY(-50%)" }}
                  >
                    {hour}:00
                  </div>
                );
              })}
            </div>

            {weekDays.map((date, dayIndex) => {
              const key = ymd(date);
              const classItems = classBlocks.filter((item) => item.dayIndex === dayIndex);
              const eventItems = eventBlocks.filter((item) => item.dayIndex === dayIndex);
              return (
                <div
                  key={`column-${key}`}
                  className="relative border-l border-warm-200 dark:border-navy-600"
                  style={{ height: CANVAS_HEIGHT }}
                >
                  {hours.map((hour) => {
                    const top = ((hour - HOUR_START) / (HOUR_END - HOUR_START)) * 100;
                    return (
                      <div
                        key={`line-${dayIndex}-${hour}`}
                        className="absolute left-0 right-0 border-t border-warm-100 dark:border-navy-700"
                        style={{ top: `${top}%` }}
                      />
                    );
                  })}

                  {classItems.map((item) => {
                    const top = topPercent(item.startMin);
                    const height = heightPercent(item.startMin, item.endMin);
                    return (
                      <div
                        key={`class-${item.item.id}-${item.startMin}-${item.endMin}`}
                        className="absolute left-1 right-1 overflow-hidden rounded-md bg-teal-600 px-1.5 py-1 text-[11px] text-white"
                        style={{
                          top: `${top}%`,
                          height: `${height}%`,
                          minHeight: "20px",
                          opacity: 0.9,
                        }}
                        title={`${item.item.name}${item.item.coachName ? ` - ${item.item.coachName}` : ""}`}
                      >
                        <p className="truncate font-semibold">{item.item.name}</p>
                        {item.item.coachName ? <p className="truncate opacity-85">{item.item.coachName}</p> : null}
                      </div>
                    );
                  })}

                  {eventItems.map((item) => {
                    const top = topPercent(item.startMin);
                    const height = heightPercent(item.startMin, item.endMin);
                    const editable = canEdit(item.item);
                    return (
                      <div
                        key={item.item.id}
                        className="group absolute left-1 right-1 overflow-hidden rounded-md px-1.5 py-1 text-[11px] text-white"
                        style={{
                          top: `${top}%`,
                          height: `${height}%`,
                          minHeight: "20px",
                          backgroundColor: item.item.color,
                        }}
                        title={item.item.description || item.item.title}
                      >
                        <p className="truncate font-semibold">
                          {item.item.isImportant ? <span title="Important">⚠️ </span> : null}
                          {item.item.title}
                        </p>
                        {editable ? (
                          <div className="absolute right-1 top-1 hidden gap-1 group-hover:flex">
                            <button
                              type="button"
                              onClick={() => setModal({ mode: "edit", event: item.item })}
                              className="rounded bg-black/30 p-0.5 hover:bg-black/50"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void deleteEvent(item.item.id);
                              }}
                              className="rounded bg-black/30 p-0.5 hover:bg-black/50"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-charcoal/70 dark:text-navy-300">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-teal-600" />
          Classes (read-only)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-blue-500" />
          Events
        </span>
      </div>

      {modal ? (
        <EventModal
          initial={modal.mode === "edit" ? modal.event : null}
          weekMonday={weekMonday}
          defaultTimezone={viewerTimezone}
          saving={saving}
          onCancel={() => setModal(null)}
          onSave={saveEvent}
        />
      ) : null}
    </div>
  );
}
