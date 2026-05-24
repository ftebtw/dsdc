export const dynamic = 'force-dynamic';

import { revalidatePath } from 'next/cache';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { normalizeClassReminderValue } from '@/lib/portal/notifications';
import { parentT } from '@/lib/portal/parent-i18n';
import { getSupabaseServerClient } from '@/lib/supabase/server';

async function updatePreferences(formData: FormData) {
  'use server';
  const session = await requireRole(['parent']);
  const supabase = await getSupabaseServerClient();
  const calendarRaw = formData.get('calendar_emails');
  const calendarEmails =
    calendarRaw === 'important_only' || calendarRaw === 'none' ? calendarRaw : 'all';

  const patch = {
    class_reminders: normalizeClassReminderValue(formData.get('class_reminders')) || 'both',
    absence_alerts: formData.get('absence_alerts') === 'on',
    general_updates: formData.get('general_updates') === 'on',
    calendar_emails: calendarEmails,
    class_resource_alerts: formData.get('class_resource_alerts') === 'on',
    class_homework_alerts: formData.get('class_homework_alerts') === 'on',
    homework_graded_alerts: formData.get('homework_graded_alerts') === 'on',
  };

  // Merge with existing prefs so unrelated keys (set elsewhere or in future)
  // aren't silently wiped by a save here. Mirrors the API merge behavior in
  // /api/portal/profile/preferences/route.ts.
  const existing = (session.profile.notification_preferences || {}) as Record<string, unknown>;
  const preferences = { ...existing, ...patch };

  await supabase
    .from('profiles')
    .update({ notification_preferences: preferences })
    .eq('id', session.userId);

  revalidatePath('/portal/parent/preferences');
}

export default async function ParentPreferencesPage() {
  const session = await requireRole(['parent']);
  const locale = session.profile.locale === 'zh' ? 'zh' : 'en';
  const prefs = (session.profile.notification_preferences || {}) as Record<string, unknown>;

  const classReminders = normalizeClassReminderValue(prefs.class_reminders) || 'both';
  const absenceAlerts = Boolean(prefs.absence_alerts ?? true);
  const generalUpdates = Boolean(prefs.general_updates ?? true);
  const classResourceAlerts = Boolean(prefs.class_resource_alerts ?? true);
  const classHomeworkAlerts = Boolean(prefs.class_homework_alerts ?? true);
  const homeworkGradedAlerts = Boolean(prefs.homework_graded_alerts ?? true);
  const calendarEmails =
    prefs.calendar_emails === 'important_only' || prefs.calendar_emails === 'none'
      ? prefs.calendar_emails
      : 'all';

  return (
    <SectionCard
      title={parentT(locale, 'portal.parent.preferences.title', 'Notification Preferences')}
      description={parentT(
        locale,
        'portal.parent.preferences.description',
        'Control your class reminder and notification preferences.'
      )}
    >
      <form action={updatePreferences} className="space-y-4 max-w-xl">
        <label className="block">
          <span className="text-sm text-navy-700 dark:text-navy-200">
            {parentT(locale, 'portal.parent.preferences.classReminders', 'Class reminders')}
          </span>
          <select
            name="class_reminders"
            defaultValue={classReminders}
            className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            <option value="1day">{parentT(locale, 'portal.parent.preferences.dayBefore', '1 day before')}</option>
            <option value="1hour">{parentT(locale, 'portal.parent.preferences.hourBefore', '1 hour before')}</option>
            <option value="both">{parentT(locale, 'portal.parent.preferences.both', 'Both')}</option>
            <option value="none">{parentT(locale, 'portal.parent.preferences.none', 'None')}</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-200">
          <input type="checkbox" name="absence_alerts" defaultChecked={absenceAlerts} />
          {parentT(
            locale,
            'portal.parent.preferences.absenceAlerts',
            'Notify me when my student is marked absent'
          )}
        </label>

        <label className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-200">
          <input type="checkbox" name="general_updates" defaultChecked={generalUpdates} />
          {parentT(locale, 'portal.parent.preferences.generalUpdates', 'General updates')}
        </label>

        <label className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-200">
          <input type="checkbox" name="class_resource_alerts" defaultChecked={classResourceAlerts} />
          {parentT(
            locale,
            'portal.parent.preferences.resourceAlerts',
            'Email me when a new class resource is posted'
          )}
        </label>

        <label className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-200">
          <input type="checkbox" name="class_homework_alerts" defaultChecked={classHomeworkAlerts} />
          {parentT(
            locale,
            'portal.parent.preferences.homeworkAlerts',
            'Email me when new homework is posted'
          )}
        </label>

        <label className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-200">
          <input type="checkbox" name="homework_graded_alerts" defaultChecked={homeworkGradedAlerts} />
          {parentT(
            locale,
            'portal.parent.preferences.homeworkGradedAlerts',
            "Email me when my student's homework is graded"
          )}
        </label>

        <label className="block">
          <span className="text-sm text-navy-700 dark:text-navy-200">
            {parentT(locale, 'portal.parent.preferences.calendarEmails', 'Calendar event emails')}
          </span>
          <select
            name="calendar_emails"
            defaultValue={calendarEmails}
            className="mt-1 w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            <option value="all">
              {parentT(locale, 'portal.parent.preferences.calendarAll', 'All events')}
            </option>
            <option value="important_only">
              {parentT(locale, 'portal.parent.preferences.calendarImportant', 'Important only')}
            </option>
            <option value="none">
              {parentT(locale, 'portal.parent.preferences.calendarNone', 'None')}
            </option>
          </select>
        </label>

        <button className="px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold">
          {parentT(locale, 'portal.parent.preferences.save', 'Save Preferences')}
        </button>
      </form>
    </SectionCard>
  );
}
