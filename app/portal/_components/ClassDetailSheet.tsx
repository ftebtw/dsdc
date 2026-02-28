"use client";

import type { CalendarClass } from "./calendarUtils";
import { classTimeRange, normalizeTimeZone, toKey } from "./calendarUtils";

type Props = {
  classItem: CalendarClass;
  classDate: string | null;
  displayTimezone: string;
  cancellationReason?: string | null;
  t: (key: string, fallback: string) => string;
  onClose: () => void;
};

export default function ClassDetailSheet({
  classItem,
  classDate,
  displayTimezone,
  cancellationReason,
  t,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
        aria-label={t("portal.portalCalendar.closeClassDetails", "Close class details")}
      />
      <div className="relative w-full max-w-md rounded-xl border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 p-4">
        <h4 className="text-lg font-semibold text-navy-900 dark:text-white">{classItem.name}</h4>
        {cancellationReason ? (
          <div className="mt-2 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 p-2">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">This session is cancelled</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{cancellationReason}</p>
          </div>
        ) : null}
        <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
          {t("portal.portalCalendar.typeLabel", "Type:")} {classItem.type}
        </p>
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {t("portal.portalCalendar.coachLabel", "Coach:")} {classItem.coach_name}
        </p>
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          {t("portal.portalCalendar.timeLabel", "Time:")} {classItem.schedule_day.toUpperCase()}{" "}
          {classTimeRange(classItem, displayTimezone, classDate || toKey(new Date()), t)} (
          {displayTimezone})
        </p>
        {normalizeTimeZone(classItem.timezone) !== normalizeTimeZone(displayTimezone) ? (
          <p className="text-xs text-charcoal/60 dark:text-navy-400">
            {t("portal.portalCalendar.sourceTimezone", "Source timezone:")} {classItem.timezone}
          </p>
        ) : null}
        <p className="text-xs text-charcoal/60 dark:text-navy-400">
          {t("portal.portalCalendar.classTimezone", "Class timezone:")} {classItem.timezone}
        </p>
        {classItem.zoom_link ? (
          <p className="mt-2 text-sm">
            {t("portal.portalCalendar.zoomLabel", "Zoom:")}{" "}
            <a
              href={classItem.zoom_link}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-navy-700 dark:text-gold-300"
            >
              {t("portal.portalCalendar.openLink", "Open link")}
            </a>
          </p>
        ) : null}
        <div className="mt-4">
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
