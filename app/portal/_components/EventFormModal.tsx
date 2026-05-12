"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { portalT } from "@/lib/portal/parent-i18n";

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
  attachment_path: string | null;
  attachment_name: string | null;
  attachment_mime_type: string | null;
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
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
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
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [existingAttachment, setExistingAttachment] = useState<{
    name: string | null;
    path: string | null;
  } | null>(null);
  const [removeExistingAttachment, setRemoveExistingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEditing = Boolean(event?.id && event.source === "calendar_events");
  const isLegacyEvent = Boolean(event?.id && event.source === "events");
  const heading = isEditing || isLegacyEvent
    ? t("portal.eventForm.editTitle", "Edit Event")
    : t("portal.eventForm.addTitle", "Add Event");

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
    setAttachmentFile(null);
    setAttachmentName("");
    setRemoveExistingAttachment(false);
    if (event?.attachment_path) {
      setExistingAttachment({ name: event.attachment_name, path: event.attachment_path });
    } else {
      setExistingAttachment(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, event, initialDate]);

  useEffect(() => {
    if (visibility === "personal" && isImportant) {
      setIsImportant(false);
    }
  }, [isImportant, visibility]);

  const canSubmit = useMemo(() => {
    if (!title.trim() || !eventDate) return false;
    if (!isAllDay && !isLegacyEvent && endTime <= startTime) return false;
    return true;
  }, [endTime, eventDate, isAllDay, isLegacyEvent, startTime, title]);

  async function submit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    let response: Response;

    if (isLegacyEvent && event) {
      response = await fetch(`/api/portal/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          event_date: eventDate,
          start_time: isAllDay ? null : (startTime || null),
          end_time: isAllDay ? null : (endTime || null),
          timezone,
        }),
      });
    } else {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("description", description.trim());
      form.append("eventDate", eventDate);
      form.append("startTime", isAllDay ? "00:00" : startTime);
      form.append("endTime", isAllDay ? "23:59" : endTime);
      form.append("timezone", timezone);
      form.append("color", color);
      form.append("visibility", visibility);
      form.append("isAllDay", String(isAllDay));
      form.append("isImportant", String(visibility === "personal" ? false : isImportant));
      if (attachmentFile) {
        form.append("file", attachmentFile);
        const trimmedName = attachmentName.trim();
        if (trimmedName) form.append("attachmentName", trimmedName);
      } else if (isEditing && attachmentName.trim() && existingAttachment && !removeExistingAttachment) {
        form.append("attachmentName", attachmentName.trim());
      }
      if (isEditing && removeExistingAttachment && !attachmentFile) {
        form.append("removeAttachment", "true");
      }

      if (isEditing && event) {
        response = await fetch(`/api/portal/calendar-events/${event.id}`, {
          method: "PUT",
          body: form,
        });
      } else {
        response = await fetch("/api/portal/calendar-events", {
          method: "POST",
          body: form,
        });
      }
    }

    const result = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(result.error || t("portal.eventForm.saveError", "Could not save event."));
      setLoading(false);
      return;
    }

    setLoading(false);
    onSaved();
    onClose();
  }

  async function remove() {
    if (!event?.id) return;
    if (!window.confirm(t("portal.eventForm.deleteConfirm", `Delete "${event.title}"?`).replace("{title}", event.title))) {
      return;
    }

    setLoading(true);
    setError(null);

    const endpoint =
      event.source === "events"
        ? `/api/portal/admin/events/${event.id}`
        : `/api/portal/calendar-events/${event.id}`;

    const response = await fetch(endpoint, { method: "DELETE" });
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(result.error || t("portal.eventForm.deleteError", "Could not delete event."));
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
        aria-label={t("portal.eventForm.closeModal", "Close event modal")}
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
            {t("portal.common.close", "Close")}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="sm:col-span-2">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              {t("portal.eventForm.title", "Title")}
            </span>
            <input
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              value={title}
              onChange={(eventValue) => setTitle(eventValue.target.value)}
              maxLength={160}
            />
          </label>

          <label>
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              {t("portal.eventForm.date", "Date")}
            </span>
            <input
              type="date"
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              value={eventDate}
              onChange={(eventValue) => setEventDate(eventValue.target.value)}
            />
          </label>

          <label>
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              {t("portal.displayTimezone", "Timezone")}
            </span>
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

          <label>
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              {t("portal.eventForm.startTime", "Start Time")}
            </span>
            <input
              type="time"
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              value={startTime}
              onChange={(eventValue) => setStartTime(eventValue.target.value)}
              disabled={isAllDay}
            />
          </label>

          <label>
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              {t("portal.eventForm.endTime", "End Time")}
            </span>
            <input
              type="time"
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              value={endTime}
              onChange={(eventValue) => setEndTime(eventValue.target.value)}
              disabled={isAllDay}
            />
          </label>

          <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-navy-800 dark:text-navy-100">
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(eventValue) => setIsAllDay(eventValue.target.checked)}
            />
            {t("portal.eventForm.allDay", "All day event")}
          </label>

          <div className="sm:col-span-2">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              {t("portal.eventForm.color", "Color")}
            </span>
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
                  aria-label={t("portal.eventForm.colorAria", `Color ${value}`).replace("{value}", value)}
                />
              ))}
            </div>
          </div>

          <label className="sm:col-span-2">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              {t("portal.eventForm.visibility", "Visibility")}
            </span>
            <select
              value={visibility}
              onChange={(eventValue) =>
                setVisibility(eventValue.target.value as "personal" | "all_coaches" | "everyone")
              }
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              disabled={isLegacyEvent}
            >
              <option value="personal">{t("portal.eventForm.onlyMe", "Only me")}</option>
              <option value="all_coaches">{t("portal.eventForm.allCoachesTas", "All coaches & TAs")}</option>
              <option value="everyone">{t("portal.eventForm.everyone", "Everyone")}</option>
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
              {t("portal.eventForm.important", "Important event")}
            </label>
          ) : null}

          <label className="sm:col-span-2">
            <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
              {t("portal.eventForm.description", "Description")}
            </span>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              value={description}
              onChange={(eventValue) => setDescription(eventValue.target.value)}
              maxLength={4000}
            />
          </label>

          {!isLegacyEvent ? (
            <div className="sm:col-span-2 space-y-2 rounded-lg border border-dashed border-warm-300 dark:border-navy-600 p-3">
              <span className="block text-xs font-medium text-charcoal/70 dark:text-navy-300">
                {t("portal.eventForm.attachment", "Attachment (optional)")}
              </span>

              {existingAttachment && !removeExistingAttachment && !attachmentFile ? (
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">
                    📎 {existingAttachment.name || t("portal.eventForm.attachmentDefaultName", "Attachment")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRemoveExistingAttachment(true)}
                    className="shrink-0 text-red-600 dark:text-red-400 underline text-xs"
                  >
                    {t("portal.eventForm.removeAttachment", "Remove")}
                  </button>
                </div>
              ) : null}

              {existingAttachment && removeExistingAttachment && !attachmentFile ? (
                <div className="flex items-center justify-between gap-2 text-sm text-charcoal/60 dark:text-navy-400">
                  <span className="truncate line-through">📎 {existingAttachment.name}</span>
                  <button
                    type="button"
                    onClick={() => setRemoveExistingAttachment(false)}
                    className="shrink-0 text-blue-600 dark:text-blue-400 underline text-xs"
                  >
                    {t("portal.eventForm.undoRemove", "Undo")}
                  </button>
                </div>
              ) : null}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt,.csv,.jpg,.jpeg,.png,.webp,.gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,text/plain,text/csv,image/*"
                onChange={(eventValue) => {
                  const next = eventValue.target.files?.[0] ?? null;
                  setAttachmentFile(next);
                  if (next && !attachmentName.trim()) {
                    setAttachmentName(next.name.replace(/\.[^.]+$/, ""));
                  }
                }}
                className="w-full text-sm rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-gold-300 file:px-3 file:py-1"
              />

              {attachmentFile ? (
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-charcoal/70 dark:text-navy-300">
                    {t("portal.eventForm.selectedFile", "Selected")}: {attachmentFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="shrink-0 text-blue-600 dark:text-blue-400 underline text-xs"
                  >
                    {t("portal.eventForm.clearFile", "Clear")}
                  </button>
                </div>
              ) : null}

              {attachmentFile || (existingAttachment && !removeExistingAttachment) ? (
                <label className="block">
                  <span className="block text-xs mb-1 text-charcoal/70 dark:text-navy-300">
                    {t("portal.eventForm.attachmentLabel", "Display name (shown to students/parents)")}
                  </span>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
                    value={attachmentName}
                    onChange={(eventValue) => setAttachmentName(eventValue.target.value)}
                    placeholder={t("portal.eventForm.attachmentNamePlaceholder", "e.g. Tournament invitation")}
                    maxLength={200}
                  />
                </label>
              ) : null}

              <p className="text-xs text-charcoal/60 dark:text-navy-400">
                {t(
                  "portal.eventForm.attachmentHelp",
                  "PDF, Office docs, ZIP, text, or images. Max 25MB."
                )}
              </p>
            </div>
          ) : null}
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            {isEditing || isLegacyEvent ? (
              <button
                type="button"
                onClick={() => {
                  void remove();
                }}
                disabled={loading}
                className="rounded-md border border-red-300 text-red-700 dark:text-red-300 px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
              >
                {t("portal.common.delete", "Delete")}
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
              {t("portal.common.cancel", "Cancel")}
            </button>
            <button
              type="button"
              onClick={() => {
                void submit();
              }}
              disabled={loading || !canSubmit}
              className="rounded-md bg-navy-800 text-white px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
            >
              {loading
                ? t("portal.common.saving", "Saving...")
                : isEditing || isLegacyEvent
                  ? t("portal.eventForm.saveChanges", "Save Changes")
                  : t("portal.eventForm.createEvent", "Create Event")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
