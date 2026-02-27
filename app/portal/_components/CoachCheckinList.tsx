"use client";

import { useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n';
import { portalT } from '@/lib/portal/parent-i18n';

type ClassItem = {
  id: string;
  name: string;
  schedule: string;
  timezone: string;
};

type Props = {
  userId: string;
  timezone: string;
  classes: ClassItem[];
  initialCheckins: Record<string, string>;
};

function ymdInZone(timezone: string, date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function formatInZone(iso: string, timezone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default function CoachCheckinList({ userId, timezone, classes, initialCheckins }: Props) {
  const { locale } = useI18n();
  const t = (key: string, fallback: string) => portalT(locale, key, fallback);
  const [checkins, setCheckins] = useState<Record<string, string>>(initialCheckins);
  const [loadingClassId, setLoadingClassId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasClasses = useMemo(() => classes.length > 0, [classes.length]);

  async function handleCheckin(classId: string, classTimezone: string) {
    setLoadingClassId(classId);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const sessionDate = ymdInZone(classTimezone);

    const { data, error: upsertError } = await supabase
      .from('coach_checkins')
      .upsert(
        {
          coach_id: userId,
          class_id: classId,
          session_date: sessionDate,
        },
        { onConflict: 'coach_id,class_id,session_date' }
      )
      .select('checked_in_at')
      .single();

    setLoadingClassId(null);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setCheckins((prev) => ({ ...prev, [classId]: data.checked_in_at }));
  }

  if (!hasClasses) {
    return (
      <p className="text-sm text-charcoal/70 dark:text-navy-300">
        {t('portal.coachCheckinList.empty', 'No classes scheduled for today.')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {classes.map((classItem) => {
        const checkedInAt = checkins[classItem.id];
        return (
          <div
            key={classItem.id}
            className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-semibold text-navy-800 dark:text-white">{classItem.name}</h3>
                <p className="text-sm text-charcoal/65 dark:text-navy-300">{classItem.schedule}</p>
              </div>
              {checkedInAt ? (
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  {t('portal.coachCheckinList.checkedInAt', 'Checked in at')} {formatInZone(checkedInAt, timezone)}
                </p>
              ) : (
                <button
                  onClick={() => handleCheckin(classItem.id, classItem.timezone)}
                  disabled={loadingClassId === classItem.id}
                  className="px-4 py-2 rounded-lg bg-gold-300 text-navy-900 font-semibold disabled:opacity-70"
                >
                  {loadingClassId === classItem.id
                    ? t('portal.coachCheckinList.checkingIn', 'Checking in...')
                    : t('portal.coachCheckinList.imHere', "I'm Here")}
                </button>
              )}
            </div>
          </div>
        );
      })}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
