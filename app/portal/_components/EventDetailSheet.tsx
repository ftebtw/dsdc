"use client";

import type { EventItem } from "./EventFormModal";
import { eventTimeRange, normalizeTimeZone } from "./calendarUtils";

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
      <div className="relative w-full max-w-md rounded-xl border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 p-4">
        <h4 className="text-lg font-semibold text-navy-900 dark:text-white">{event.title}</h4>
        {event.is_important ? (
          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
            [!] {t("portal.portalCalendar.importantEvent", "Important event")}
          </p>
        ) : null}
        <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
          {event.event_date} {eventTimeRange(event, displayTimezone, t)}
        </p>
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {t("portal.portalCalendar.typeLabel", "Type:")} {event.event_type}
        </p>
        <p className="text-xs text-charcoal/60 dark:text-navy-400">
          {t("portal.portalCalendar.displayTimezoneLabel", "Display timezone:")} {displayTimezone}
        </p>
        {normalizeTimeZone(event.timezone) !== normalizeTimeZone(displayTimezone) ? (
          <p className="text-xs text-charcoal/60 dark:text-navy-400">
            {t("portal.portalCalendar.eventTimezone", "Event timezone:")}{" "}
            {event.timezone || "America/Vancouver"}
          </p>
        ) : null}
        {event.location ? (
          <p className="text-sm text-charcoal/70 dark:text-navy-300">
            {t("portal.portalCalendar.locationLabel", "Location:")} {event.location}
          </p>
        ) : null}
        {event.source === "calendar_events" ? (
          <p className="text-xs text-charcoal/60 dark:text-navy-400">
            {t("portal.portalCalendar.visibilityLabel", "Visibility:")} {event.visibility}
          </p>
        ) : null}
        {event.description ? (
          <p className="text-sm text-charcoal/80 dark:text-navy-200 mt-2 whitespace-pre-wrap">
            {event.description}
          </p>
        ) : null}
        <div className="mt-4 flex items-center gap-2">
          {canManageEvents && event.source === "calendar_events" ? (
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
