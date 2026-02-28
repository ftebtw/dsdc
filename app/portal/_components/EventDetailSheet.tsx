"use client";

import type { EventItem } from "./EventFormModal";
import { eventTimeRange } from "./calendarUtils";

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
          {event.event_date} {eventTimeRange(event, displayTimezone, t)}
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
