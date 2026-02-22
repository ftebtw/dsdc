"use client";

import { useMemo, useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import type { Database } from '@/lib/supabase/database.types';

type ScheduleDay = Database['public']['Enums']['schedule_day'];

type ClassOption = {
  id: string;
  name: string;
  schedule_day: ScheduleDay;
  timezone: string;
};

type SubmitPayload = {
  classId: string;
  sessionDate: string;
  reason: string;
};

type SubmitResult = {
  ok: boolean;
  message?: string;
  error?: string;
};

const dayMap: Record<ScheduleDay, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

function upcomingDatesForClass(classRow: ClassOption): string[] {
  const result: string[] = [];
  const now = new Date();

  for (let index = 0; index < 120 && result.length < 12; index += 1) {
    const candidate = new Date(now.getTime() + index * 24 * 60 * 60 * 1000);
    const weekday = formatInTimeZone(candidate, classRow.timezone, 'EEE');
    if (weekday !== dayMap[classRow.schedule_day]) continue;
    result.push(formatInTimeZone(candidate, classRow.timezone, 'yyyy-MM-dd'));
  }

  return result;
}

export default function AbsenceForm({
  classes,
  onSubmit,
}: {
  classes: ClassOption[];
  onSubmit: (payload: SubmitPayload) => Promise<SubmitResult>;
}) {
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [sessionDate, setSessionDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedClass = classes.find((classRow) => classRow.id === classId) ?? classes[0];
  const dateOptions = useMemo(
    () => (selectedClass ? upcomingDatesForClass(selectedClass) : []),
    [selectedClass]
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!classId || !sessionDate) {
      setError('Select class and date.');
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    const result = await onSubmit({
      classId,
      sessionDate,
      reason: reason.trim(),
    });

    setLoading(false);
    if (!result.ok) {
      setError(result.error || 'Could not save absence.');
      return;
    }

    setMessage(result.message || 'Absence reported.');
    setReason('');
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-warm-200 dark:border-navy-600 p-4 bg-warm-50 dark:bg-navy-900">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-navy-700 dark:text-navy-200">Class</span>
          <select
            required
            value={classId}
            onChange={(event) => {
              setClassId(event.target.value);
              setSessionDate('');
            }}
            className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          >
            {classes.map((classRow) => (
              <option key={classRow.id} value={classRow.id}>
                {classRow.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-navy-700 dark:text-navy-200">Session date</span>
          <select
            required
            value={sessionDate}
            onChange={(event) => setSessionDate(event.target.value)}
            className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
          >
            <option value="">Select date</option>
            {dateOptions.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-sm text-navy-700 dark:text-navy-200">Reason</span>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          placeholder="Optional reason"
          className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
        />
      </label>
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        disabled={loading}
        type="submit"
        className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-70"
      >
        {loading ? 'Saving...' : 'Report Absence'}
      </button>
    </form>
  );
}
