export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import AdminWaitlistList from '@/app/portal/_components/AdminWaitlistList';
import type { WaitlistListItem } from '@/app/portal/_components/AdminWaitlistList';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  sanitizeStudents,
  waitlistErrorMessage,
  waitlistStatusOptions,
  type WaitlistEntryRecord,
} from '@/app/portal/admin/waitlist/config';

function normalizeSearchTerm(value: string | undefined): string {
  return (value || '').trim();
}

function escapeOrFilterValue(value: string): string {
  return value.replace(/[%_,]/g, ' ').replace(/,/g, ' ').trim();
}

export default async function AdminWaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    status?: string | string[];
    timezone?: string;
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const params = await searchParams;

  const queryText = normalizeSearchTerm(params.query);
  const validStatusValues = new Set(waitlistStatusOptions.map((option) => option.value));
  const rawStatuses = Array.isArray(params.status)
    ? params.status
    : params.status
      ? [params.status]
      : [];
  const selectedStatuses = Array.from(
    new Set(rawStatuses.filter((value): value is string => Boolean(value) && validStatusValues.has(value as never)))
  );
  const selectedTimezone = normalizeSearchTerm(params.timezone);

  let query = (supabase as any)
    .from('waitlist_entries')
    .select('*')
    .order('timezone', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (selectedStatuses.length > 0) {
    query = query.in('status', selectedStatuses);
  }

  if (selectedTimezone) {
    query = query.eq('timezone', selectedTimezone);
  }

  if (queryText) {
    const safeQuery = escapeOrFilterValue(queryText);
    query = query.or(
      `parent_name.ilike.%${safeQuery}%,parent_email.ilike.%${safeQuery}%,parent_phone.ilike.%${safeQuery}%,location.ilike.%${safeQuery}%`
    );
  }

  const { data } = await query;
  const records = (data ?? []) as WaitlistEntryRecord[];
  const errorMessage = waitlistErrorMessage(params.error);

  const entries: WaitlistListItem[] = records.map((record) => ({
    id: record.id,
    parentName: record.parent_name || '-',
    parentEmail: record.parent_email || '',
    parentPhone: record.parent_phone || '',
    students: sanitizeStudents(record.students),
    hasDebateExperience: Boolean(record.has_debate_experience),
    debateExperienceDetails: record.debate_experience_details || '',
    timezone: record.timezone || '',
    location: record.location || '',
    preferredDaysTimes: record.preferred_days_times || '',
    notes: record.notes || '',
    status: record.status,
    createdAt: record.created_at,
  }));

  // Build the timezone filter dropdown from values present in the data.
  const timezonesPresent = Array.from(
    new Set(records.map((record) => record.timezone).filter((value): value is string => Boolean(value)))
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      {params.created === '1' ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
          Waitlist entry saved successfully.
        </div>
      ) : null}
      {params.updated === '1' ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
          Waitlist entry updated successfully.
        </div>
      ) : null}
      {params.deleted === '1' ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
          Waitlist entry deleted successfully.
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <SectionCard
        title="Waitlist"
        description="Families waiting on a class — grouped by timezone so you can build cohorts that share the same hours."
      >
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <form method="get" className="w-full md:max-w-5xl space-y-3">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
              <input
                type="search"
                name="query"
                defaultValue={queryText}
                placeholder="Search parent, email, phone, location"
                className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
              />
              <select
                name="timezone"
                defaultValue={selectedTimezone}
                className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
              >
                <option value="">All timezones</option>
                {timezonesPresent.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700"
              >
                Apply
              </button>
              <Link
                href="/portal/admin/waitlist"
                className="rounded-lg border border-warm-300 dark:border-navy-600 px-4 py-2 text-center text-sm font-medium text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700"
              >
                Reset
              </Link>
            </div>

            <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <legend className="mr-1 text-xs font-medium uppercase tracking-wide text-charcoal/55 dark:text-navy-400">
                Status
              </legend>
              {waitlistStatusOptions.map((option) => (
                <label
                  key={option.value}
                  className="inline-flex items-center gap-2 text-sm text-navy-800 dark:text-navy-100"
                >
                  <input
                    type="checkbox"
                    name="status"
                    value={option.value}
                    defaultChecked={selectedStatuses.includes(option.value)}
                    className="rounded border-warm-300 dark:border-navy-600"
                  />
                  {option.label}
                </label>
              ))}
              <span className="text-xs text-charcoal/55 dark:text-navy-400">
                (none ticked = all)
              </span>
            </fieldset>
          </form>

          <Link
            href="/portal/admin/waitlist/new"
            className="inline-flex rounded-lg bg-gold-300 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-gold-200"
          >
            New Waitlist Entry
          </Link>
        </div>

        <AdminWaitlistList entries={entries} />
      </SectionCard>
    </div>
  );
}
