export type NotificationPreferences = Record<string, unknown> | null | undefined;

export type ClassReminderPreference = 'both' | '1day' | '1hour' | 'none';

function asRecord(value: NotificationPreferences): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value;
}

export function shouldSendNotification(
  preferences: NotificationPreferences,
  key: string,
  defaultValue = true
): boolean {
  const record = asRecord(preferences);
  if (!record) return defaultValue;
  const value = record[key];
  if (typeof value !== 'boolean') return defaultValue;
  return value;
}

export function getClassReminderPreference(
  preferences: NotificationPreferences
): ClassReminderPreference {
  const record = asRecord(preferences);
  const value = record?.class_reminders;

  if (value === '1day' || value === 'day_before') return '1day';
  if (value === '1hour' || value === 'hour_before') return '1hour';
  if (value === 'none') return 'none';
  return 'both';
}

export function allowsClassReminder(
  preferences: NotificationPreferences,
  reminderType: '1day' | '1hour'
): boolean {
  const preference = getClassReminderPreference(preferences);
  if (preference === 'none') return false;
  if (preference === 'both') return true;
  return preference === reminderType;
}

export function normalizeClassReminderValue(
  value: unknown
): ClassReminderPreference | null {
  if (value === 'both') return 'both';
  if (value === 'none') return 'none';
  if (value === '1day' || value === 'day_before') return '1day';
  if (value === '1hour' || value === 'hour_before') return '1hour';
  return null;
}
