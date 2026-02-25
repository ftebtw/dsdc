"use client";

import { useMemo, useState } from 'react';

type SubmitPayload = {
  slots: Array<{
    availableDate: string;
    startTime: string;
    endTime: string;
    timezone: string;
    isGroup: boolean;
    isPrivate: boolean;
  }>;
};

type SubmitResult = { ok: boolean; error?: string };

const weekdayOptions = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const COMMON_TIMEZONES = [
  'America/Vancouver',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Toronto',
  'America/Edmonton',
  'America/Halifax',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Seoul',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
  'UTC',
];

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function eachWeekdayInRange(weekday: number, startDate: string, endDate: string): string[] {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const out: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    if (current.getDay() === weekday) out.push(toYmd(current));
    current.setDate(current.getDate() + 1);
  }
  return out;
}

export default function RecurringAvailabilityForm({
  defaultTimezone,
  onSubmit,
}: {
  defaultTimezone: string;
  onSubmit: (payload: SubmitPayload) => Promise<SubmitResult>;
}) {
  const [weekday, setWeekday] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('15:00');
  const [endTime, setEndTime] = useState('16:00');
  const [timezone, setTimezone] = useState(defaultTimezone || 'America/Vancouver');
  const [isGroup, setIsGroup] = useState(true);
  const [isPrivate, setIsPrivate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const count = useMemo(() => {
    if (!startDate || !endDate) return 0;
    if (endDate < startDate) return 0;
    return eachWeekdayInRange(weekday, startDate, endDate).length;
  }, [weekday, startDate, endDate]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!startDate || !endDate) {
      setError('Choose start and end dates.');
      return;
    }
    if (endDate < startDate) {
      setError('End date must be on or after start date.');
      return;
    }
    if (startTime >= endTime) {
      setError('End time must be later than start time.');
      return;
    }
    const dates = eachWeekdayInRange(weekday, startDate, endDate);
    if (!dates.length) {
      setError('No matching dates found in the selected range.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const result = await onSubmit({
      slots: dates.map((availableDate) => ({
        availableDate,
        startTime,
        endTime,
        timezone,
        isGroup,
        isPrivate,
      })),
    });
    setLoading(false);

    if (!result.ok) {
      setError(result.error || 'Could not create recurring slots.');
      return;
    }

    setMessage(`Created ${dates.length} slots.`);
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-warm-200 dark:border-navy-600 p-4 bg-warm-50 dark:bg-navy-900">
      <h3 className="font-semibold text-navy-800 dark:text-white">Recurring Availability</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <label className="block">
          <span className="text-sm">Weekday</span>
          <select
            value={weekday}
            onChange={(event) => setWeekday(Number(event.target.value))}
            className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          >
            {weekdayOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm">Start date</span>
          <input
            required
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm">End date</span>
          <input
            required
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm">Start time</span>
          <input
            required
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm">End time</span>
          <input
            required
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm">Timezone</span>
          <select
            required
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isGroup} onChange={(event) => setIsGroup(event.target.checked)} />
          Group
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPrivate} onChange={(event) => setIsPrivate(event.target.checked)} />
          Private
        </label>
      </div>
      <p className="text-xs text-charcoal/65 dark:text-navy-300">Preview: {count} slot(s) will be created.</p>
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-70"
      >
        {loading ? 'Creating...' : 'Create Recurring Slots'}
      </button>
    </form>
  );
}
