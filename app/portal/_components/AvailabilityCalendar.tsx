"use client";

import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

type AvailabilitySlot = {
  id: string;
  available_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  is_group: boolean;
  is_private: boolean;
  coachName?: string | null;
};

type Props = {
  slots: AvailabilitySlot[];
  displayTimezone: string;
  editable?: boolean;
  onEdit?: (slot: AvailabilitySlot) => void;
  onDelete?: (slotId: string) => void;
  deletingId?: string | null;
};

function rangeLabel(slot: AvailabilitySlot, displayTimezone: string) {
  if (!slot.available_date || !slot.start_time || !slot.end_time || !slot.timezone || !displayTimezone) {
    return `${slot.available_date ?? '?'} ${(slot.start_time ?? '').slice(0, 5)} - ${(slot.end_time ?? '').slice(0, 5)}`;
  }

  try {
    const start = fromZonedTime(`${slot.available_date}T${slot.start_time}`, slot.timezone);
    const end = fromZonedTime(`${slot.available_date}T${slot.end_time}`, slot.timezone);
    return `${formatInTimeZone(start, displayTimezone, 'yyyy-MM-dd HH:mm')} - ${formatInTimeZone(end, displayTimezone, 'HH:mm zzz')}`;
  } catch (error) {
    console.error('[AvailabilityCalendar rangeLabel] Failed:', { slot, displayTimezone }, error);
    return `${slot.available_date} ${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`;
  }
}

function convertedKey(slot: AvailabilitySlot, displayTimezone: string) {
  if (!slot.available_date || !slot.start_time || !slot.timezone || !displayTimezone) {
    return `${slot.available_date ?? ''}T${(slot.start_time ?? '').slice(0, 5)}`;
  }

  try {
    const utc = fromZonedTime(`${slot.available_date}T${slot.start_time}`, slot.timezone);
    return formatInTimeZone(utc, displayTimezone, "yyyy-MM-dd'T'HH:mm");
  } catch {
    return `${slot.available_date}T${slot.start_time.slice(0, 5)}`;
  }
}

export default function AvailabilityCalendar({
  slots,
  displayTimezone,
  editable = false,
  onEdit,
  onDelete,
  deletingId,
}: Props) {
  const ordered = [...slots].sort((a, b) =>
    convertedKey(a, displayTimezone).localeCompare(convertedKey(b, displayTimezone))
  );

  if (!ordered.length) {
    return <p className="text-sm text-charcoal/70 dark:text-navy-300">No availability slots found.</p>;
  }

  return (
    <div className="space-y-3">
      {ordered.map((slot) => (
        <article
          key={slot.id}
          className="rounded-xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              {slot.coachName ? (
                <p className="text-xs uppercase tracking-wide text-charcoal/60 dark:text-navy-300 mb-1">
                  {slot.coachName}
                </p>
              ) : null}
              <p className="font-semibold text-navy-800 dark:text-white">{rangeLabel(slot, displayTimezone)}</p>
              <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">
                {slot.is_group ? 'Group' : ''}{slot.is_group && slot.is_private ? ' / ' : ''}{slot.is_private ? 'Private' : ''}
                {' '}| Source TZ: {slot.timezone}
              </p>
            </div>
            {editable ? (
              <div className="flex items-center gap-2">
                {onEdit ? (
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm"
                    onClick={() => onEdit(slot)}
                  >
                    Edit
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm disabled:opacity-70"
                    onClick={() => onDelete(slot.id)}
                    disabled={deletingId === slot.id}
                  >
                    {deletingId === slot.id ? 'Deleting...' : 'Delete'}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
