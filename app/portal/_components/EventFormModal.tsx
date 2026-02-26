"use client";

import { useEffect, useMemo, useState } from "react";

export type EventItem = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  event_type: "tournament" | "workshop" | "social" | "deadline" | "other" | "event" | "important";
  timezone: string | null;
  source: "events" | "calendar_events";
  color: string | null;
  visibility: "personal" | "all_coaches" | "everyone";
  is_all_day: boolean;
  is_important: boolean;
  created_by: string | null;
};

type Props = {
  open: boolean;
  initialDate?: string | null;
  event: EventItem | null;
  onClose: () => void;
  onSaved: () => void;
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

const colorOptions = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"] as const;

function normalizeTime(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 5);
}

export default function EventFormModal({ open, initialDate, event, onClose, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [description, setDescription] = useState("");
  const [timezone, setTimezone] = useState("America/Vancouver");
  const [visibility, setVisibility] = useState<"personal" | "all_coaches" | "everyone">("personal");
  const [color, setColor] = useState("#3b82f6");
  const [isAllDay, setIsAllDay] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(event?.id && event.source === "calendar_events");
  const isLegacyEvent = Boolean(event?.id && event.source === "events");
  const heading = isEditing ? "Edit Event" : "Add Event";

  useEffect(() => {
    if (!open) return;
    setTitle(event?.title ?? "");
    setEventDate(event?.event_date ?? initialDate ?? "");
    setStartTime(normalizeTime(event?.start_time) || "09:00");
    setEndTime(normalizeTime(event?.end_time) || "10:00");
    setDescription(event?.description ?? "");
    setTimezone(event?.timezone || "America/Vancouver");
    setVisibility(event?.visibility ?? "personal");
    setColor(event?.color || "#3b82f6");
    setIsAllDay(Boolean(event?.is_all_day));
    setIsImportant(Boolean(event?.is_important));
    setLoading(false);
    setError(null);
  }, [open, event, initialDate]);

  useEffect(() => {
    if (visibility === "personal" && isImportant) {
      setIsImportant(false);
    }
  }, [isImportant, visibility]);

  const canSubmit = useMemo(() => {
    if (!title.trim() || !eventDate) return false;
    if (isLegacyEvent) return false;
    if (!isAllDay && endTime <= startTime) return false;
    return true;
  }, [endTime, eventDate, isAllDay, isLegacyEvent, startTime, title]);

  async function submit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim() || "",
      eventDate,
      startTime: isAllDay ? "00:00" : startTime,
      endTime: isAllDay ? "23:59" : endTime,
      timezone,
      color,
      visibility,
      isAllDay,
      isImportant: visibility === "personal" ? false : isImportant,
    };

    const endpoint = isEditing ? `/api/portal/calendar-events/${event!.id}` : "/api/portal/calendar-events";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(result.error || "Could not save event.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onSaved();
    onClose();
  }

  async function remove() {
    if (!event?.id || event.source !== "calendar_events") return;
    if (!window.confirm(`Delete "${event.title}"?`)) return;

    setLoading(true);
    setError(null);
    const response = await fetch(`/api/portal/calendar-events/${event.id}`, {
      method: "DELETE",
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(result.error || "Could not delete event.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onSaved();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Close event modal"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-xl border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-navy-900 dark:text-white">{heading}</h3>
          <button
            type="button"
            className="px-2 py-1 text-sm rounded border border-warm-300 dark:border-navy-600"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </button>
        </div>

        {isLegacyEvent ? (
          <p className="mb-3 text-sm text-charcoal/70 dark:text-navy-300">
            Legacy events are read-only in this modal.
          </p>
        ) : null}

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="sm:col-span-2">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Title</span>
            <input
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              value={title}
              onChange={(eventValue) => setTitle(eventValue.target.value)}
              maxLength={160}
              disabled={isLegacyEvent}
            />
          </label>

          <label>
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Date</span>
            <input
              type="date"
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              value={eventDate}
              onChange={(eventValue) => setEventDate(eventValue.target.value)}
              disabled={isLegacyEvent}
            />
          </label>

          <label>
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Timezone</span>
            <select
              value={timezone}
              onChange={(eventValue) => setTimezone(eventValue.target.value)}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              disabled={isLegacyEvent}
            >
              {timezoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Start Time</span>
            <input
              type="time"
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              value={startTime}
              onChange={(eventValue) => setStartTime(eventValue.target.value)}
              disabled={isAllDay || isLegacyEvent}
            />
          </label>

          <label>
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">End Time</span>
            <input
              type="time"
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              value={endTime}
              onChange={(eventValue) => setEndTime(eventValue.target.value)}
              disabled={isAllDay || isLegacyEvent}
            />
          </label>

          <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-navy-800 dark:text-navy-100">
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(eventValue) => setIsAllDay(eventValue.target.checked)}
              disabled={isLegacyEvent}
            />
            All day event
          </label>

          <div className="sm:col-span-2">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Color</span>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setColor(value)}
                  disabled={isLegacyEvent}
                  className={`h-7 w-7 rounded-full border-2 ${
                    color === value ? "scale-110 border-navy-900 dark:border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: value }}
                  aria-label={`Color ${value}`}
                />
              ))}
            </div>
          </div>

          <label className="sm:col-span-2">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Visibility</span>
            <select
              value={visibility}
              onChange={(eventValue) =>
                setVisibility(eventValue.target.value as "personal" | "all_coaches" | "everyone")
              }
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              disabled={isLegacyEvent}
            >
              <option value="personal">Only me</option>
              <option value="all_coaches">All coaches &amp; TAs</option>
              <option value="everyone">Everyone</option>
            </select>
          </label>

          {(visibility === "all_coaches" || visibility === "everyone") ? (
            <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-navy-800 dark:text-navy-100">
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(eventValue) => setIsImportant(eventValue.target.checked)}
                disabled={isLegacyEvent}
              />
              Important event
            </label>
          ) : null}

          <label className="sm:col-span-2">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Description</span>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              value={description}
              onChange={(eventValue) => setDescription(eventValue.target.value)}
              maxLength={4000}
              disabled={isLegacyEvent}
            />
          </label>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  void remove();
                }}
                disabled={loading}
                className="rounded-md border border-red-300 text-red-700 dark:text-red-300 px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
              >
                Delete
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-warm-300 dark:border-navy-600 px-3 py-1.5 text-sm"
            >
              Cancel
            </button>
            {!isLegacyEvent ? (
              <button
                type="button"
                onClick={() => {
                  void submit();
                }}
                disabled={loading || !canSubmit}
                className="rounded-md bg-navy-800 text-white px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
              >
                {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Event"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
