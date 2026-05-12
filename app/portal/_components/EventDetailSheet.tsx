"use client";

import { useState } from "react";
import type { EventItem } from "./EventFormModal";
import { convertDateKeyForDisplay, eventTimeRange } from "./calendarUtils";

type Props = {
  event: EventItem;
  displayTimezone: string;
  canManageEvents: boolean;
  t: (key: string, fallback: string) => string;
  onClose: () => void;
  onEdit: () => void;
};

export default function EventDetailSheet({
  event,
  displayTimezone,
  canManageEvents,
  t,
  onClose,
  onEdit,
}: Props) {
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const displayDate = event.is_all_day
    ? event.event_date
    : convertDateKeyForDisplay(
        event.event_date,
        event.start_time || event.end_time,
        event.timezone,
        displayTimezone
      );

  async function openAttachment() {
    if (!event.attachment_path) return;
    setAttachmentLoading(true);
    setAttachmentError(null);
    try {
      const response = await fetch(`/api/portal/calendar-events/${event.id}/attachment-url`);
      const result = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!response.ok || !result.url) {
        setAttachmentError(
          result.error || t("portal.eventDetail.attachmentError", "Could not open the attachment.")
        );
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    } finally {
      setAttachmentLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
        aria-label={t("portal.portalCalendar.closeEventDetails", "Close event details")}
      />
      <div className="relative w-full max-w-md rounded-xl border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 p-5 overflow-hidden">
        <h4 className="text-lg font-semibold text-navy-900 dark:text-white pr-8">{event.title}</h4>
        {event.is_important ? (
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
            {t("portal.portalCalendar.importantEvent", "Important")}
          </span>
        ) : null}
        <p className="text-sm text-charcoal/80 dark:text-navy-200 mt-2">
          {displayDate} {eventTimeRange(event, displayTimezone, t)}
        </p>
        {event.location ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
            📍 {event.location}
          </p>
        ) : null}
        {event.description ? (
          <div className="mt-3 text-sm text-charcoal/80 dark:text-navy-200 whitespace-pre-wrap break-words overflow-wrap-anywhere [overflow-wrap:anywhere]">
            {event.description.split(/(https?:\/\/[^\s]+)/g).map((part, index) =>
              /^https?:\/\//.test(part) ? (
                <a
                  key={index}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 underline break-all"
                >
                  {part.length > 60 ? `${part.slice(0, 57)}...` : part}
                </a>
              ) : (
                <span key={index}>{part}</span>
              )
            )}
          </div>
        ) : null}
        {event.attachment_path ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => {
                void openAttachment();
              }}
              disabled={attachmentLoading}
              className="inline-flex items-center gap-2 rounded-md border border-warm-300 dark:border-navy-600 bg-warm-50 dark:bg-navy-800 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-warm-100 dark:hover:bg-navy-700 disabled:opacity-60"
            >
              <span>📎</span>
              <span className="underline truncate max-w-[20rem]">
                {event.attachment_name || t("portal.eventDetail.attachmentDefault", "Attachment")}
              </span>
              {attachmentLoading ? (
                <span className="text-xs text-charcoal/60 dark:text-navy-400">
                  {t("portal.common.loading", "Loading...")}
                </span>
              ) : null}
            </button>
            {attachmentError ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{attachmentError}</p>
            ) : null}
          </div>
        ) : null}
        <div className="mt-4 flex items-center gap-2">
          {canManageEvents ? (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-md bg-gold-300 text-navy-900 px-3 py-1.5 text-sm font-semibold"
            >
              {t("portal.eventForm.editTitle", "Edit Event")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-warm-300 dark:border-navy-600 px-3 py-1.5 text-sm"
          >
            {t("portal.common.close", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
}
