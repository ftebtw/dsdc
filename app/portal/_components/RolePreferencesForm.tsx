"use client";

import { useMemo, useState } from 'react';

type RolePreferencesFormProps = {
  role: 'coach' | 'ta' | 'student';
  initialPreferences: Record<string, unknown>;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function asBoolean(value: unknown, fallback = true): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

function normalizeClassReminder(value: unknown): 'both' | '1day' | '1hour' | 'none' {
  if (value === '1day' || value === 'day_before') return '1day';
  if (value === '1hour' || value === 'hour_before') return '1hour';
  if (value === 'none') return 'none';
  return 'both';
}

export default function RolePreferencesForm({ role, initialPreferences }: RolePreferencesFormProps) {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [classReminders, setClassReminders] = useState<'both' | '1day' | '1hour' | 'none'>(
    normalizeClassReminder(initialPreferences.class_reminders)
  );
  const [absenceAlerts, setAbsenceAlerts] = useState<boolean>(
    asBoolean(initialPreferences.absence_alerts, true)
  );
  const [generalUpdates, setGeneralUpdates] = useState<boolean>(
    asBoolean(initialPreferences.general_updates, true)
  );

  const [subRequestAlerts, setSubRequestAlerts] = useState<boolean>(
    asBoolean(initialPreferences.sub_request_alerts, true)
  );
  const [taRequestAlerts, setTaRequestAlerts] = useState<boolean>(
    asBoolean(initialPreferences.ta_request_alerts, true)
  );
  const [privateSessionAlerts, setPrivateSessionAlerts] = useState<boolean>(
    asBoolean(initialPreferences.private_session_alerts, true)
  );

  const description = useMemo(() => {
    if (role === 'student') {
      return 'Control class reminders and non-critical updates for your account.';
    }
    return 'Control email alerts for sub requests, TA requests, and private sessions.';
  }, [role]);

  async function savePreferences() {
    setSaveState('saving');
    setErrorMessage(null);

    const payload =
      role === 'student'
        ? {
            class_reminders: classReminders,
            absence_alerts: absenceAlerts,
            general_updates: generalUpdates,
          }
        : {
            sub_request_alerts: subRequestAlerts,
            ta_request_alerts: taRequestAlerts,
            private_session_alerts: privateSessionAlerts,
          };

    try {
      const response = await fetch('/api/portal/profile/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || 'Could not save preferences.');
      }

      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1600);
    } catch (error) {
      setSaveState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Could not save preferences.');
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <p className="text-sm text-charcoal/70 dark:text-navy-300">{description}</p>

      {role === 'student' ? (
        <>
          <label className="block">
            <span className="text-sm text-navy-700 dark:text-navy-200">Class reminders</span>
            <select
              value={classReminders}
              onChange={(event) => setClassReminders(event.target.value as 'both' | '1day' | '1hour' | 'none')}
              className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            >
              <option value="both">Both (1 day and 1 hour)</option>
              <option value="1day">1 day before</option>
              <option value="1hour">1 hour before</option>
              <option value="none">None</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-200">
            <input
              type="checkbox"
              checked={absenceAlerts}
              onChange={(event) => setAbsenceAlerts(event.target.checked)}
            />
            Absence alerts
          </label>

          <label className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-200">
            <input
              type="checkbox"
              checked={generalUpdates}
              onChange={(event) => setGeneralUpdates(event.target.checked)}
            />
            General updates
          </label>
        </>
      ) : (
        <>
          <label className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-200">
            <input
              type="checkbox"
              checked={subRequestAlerts}
              onChange={(event) => setSubRequestAlerts(event.target.checked)}
            />
            Sub request alerts
          </label>

          <label className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-200">
            <input
              type="checkbox"
              checked={taRequestAlerts}
              onChange={(event) => setTaRequestAlerts(event.target.checked)}
            />
            TA request alerts
          </label>

          <label className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-200">
            <input
              type="checkbox"
              checked={privateSessionAlerts}
              onChange={(event) => setPrivateSessionAlerts(event.target.checked)}
            />
            Private session alerts
          </label>
        </>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={savePreferences}
          disabled={saveState === 'saving'}
          className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold disabled:opacity-60"
        >
          {saveState === 'saving' ? 'Saving...' : 'Save Preferences'}
        </button>
        {saveState === 'saved' ? <span className="text-sm text-green-700 dark:text-green-400">Saved.</span> : null}
      </div>

      {saveState === 'error' && errorMessage ? (
        <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
      ) : null}
    </div>
  );
}
