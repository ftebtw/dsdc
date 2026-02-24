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
  event_type: "tournament" | "workshop" | "social" | "deadline" | "other";
  timezone: string | null;
};

type Props = {
  open: boolean;
  initialDate?: string | null;
  event: EventItem | null;
  onClose: () => void;
  onSaved: () => void;
};

const eventTypeOptions: Array<{ value: EventItem["event_type"]; label: string }> = [
  { value: "tournament", label: "Tournament" },
  { value: "workshop", label: "Workshop" },
  { value: "social", label: "Social" },
  { value: "deadline", label: "Deadline" },
  { value: "other", label: "Other" },
];

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

function normalizeTime(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 5);
}

export default function EventFormModal({ open, initialDate, event, onClose, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventItem["event_type"]>("tournament");
  const [timezone, setTimezone] = useState("America/Vancouver");
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(event?.id);
  const heading = isEditing ? "Edit Event" : "Add Event";

  useEffect(() => {
    if (!open) return;
    setTitle(event?.title ?? "");
    setEventDate(event?.event_date ?? initialDate ?? "");
    setStartTime(normalizeTime(event?.start_time));
    setEndTime(normalizeTime(event?.end_time));
    setLocation(event?.location ?? "");
    setTimezone(event?.timezone ?? "America/Vancouver");
    setDescription(event?.description ?? "");
    setEventType(event?.event_type ?? "tournament");
    setIsVisible(true);
    setLoading(false);
    setError(null);
  }, [open, event, initialDate]);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && Boolean(eventDate);
  }, [eventDate, title]);

  async function submit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      event_date: eventDate,
      start_time: startTime || undefined,
      end_time: endTime || undefined,
      location: location.trim() || undefined,
      event_type: eventType,
      timezone,
      is_visible: isVisible,
    };

    const response = await fetch(
      isEditing ? `/api/portal/admin/events/${event!.id}` : "/api/portal/admin/events",
      {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const result = (await response.json()) as { error?: string };
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
    if (!event?.id) return;
    if (!window.confirm(`Delete "${event.title}"?`)) return;

    setLoading(true);
    setError(null);
    const response = await fetch(`/api/portal/admin/events/${event.id}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as { error?: string };
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

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="sm:col-span-2">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Title</span>
            <input
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              value={title}
              onChange={(eventValue) => setTitle(eventValue.target.value)}
              maxLength={160}
            />
          </label>

          <label>
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Date</span>
            <input
              type="date"
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              value={eventDate}
              onChange={(eventValue) => setEventDate(eventValue.target.value)}
            />
          </label>

          <label>
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Type</span>
            <select
              value={eventType}
              onChange={(eventValue) => setEventType(eventValue.target.value as EventItem["event_type"])}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
            >
              {eventTypeOptions.map((option) => (
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
            />
          </label>

          <label>
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">End Time</span>
            <input
              type="time"
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              value={endTime}
              onChange={(eventValue) => setEndTime(eventValue.target.value)}
            />
          </label>

          <label className="sm:col-span-2">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Location</span>
            <input
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              value={location}
              onChange={(eventValue) => setLocation(eventValue.target.value)}
              maxLength={255}
            />
          </label>

          <label className="sm:col-span-2">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Timezone</span>
            <select
              value={timezone}
              onChange={(eventValue) => setTimezone(eventValue.target.value)}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
            >
              {timezoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="sm:col-span-2">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">Description</span>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              value={description}
              onChange={(eventValue) => setDescription(eventValue.target.value)}
              maxLength={4000}
            />
          </label>

          <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-navy-800 dark:text-navy-100">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(eventValue) => setIsVisible(eventValue.target.checked)}
            />
            Visible to portal users
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
          </div>
        </div>
      </div>
    </div>
  );
}
