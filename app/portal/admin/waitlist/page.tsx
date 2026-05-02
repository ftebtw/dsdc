export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import AdminWaitlistList from '@/app/portal/_components/AdminWaitlistList';
import type { WaitlistListItem } from '@/app/portal/_components/AdminWaitlistList';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  normalizeWaitlistStatus,
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
    status?: string;
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
  const selectedStatus =
    waitlistStatusOptions.some((option) => option.value === params.status) ? params.status || '' : '';
  const selectedTimezone = normalizeSearchTerm(params.timezone);

  let query = (supabase as any)
    .from('waitlist_entries')
    .select('*')
    .order('timezone', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (selectedStatus) {
    query = query.eq('status', normalizeWaitlistStatus(selectedStatus));
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
          <form
            method="get"
            className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_220px_auto_auto] w-full md:max-w-5xl"
          >
            <input
              type="search"
              name="query"
              defaultValue={queryText}
              placeholder="Search parent, email, phone, location"
              className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            />
            <select
              name="status"
              defaultValue={selectedStatus}
              className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
            >
              <option value="">All statuses</option>
              {waitlistStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
