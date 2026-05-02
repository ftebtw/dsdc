export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import SectionCard from '@/app/portal/_components/SectionCard';
import AdminWaitlistForm from '@/app/portal/_components/AdminWaitlistForm';
import WaitlistDeleteButton from './WaitlistDeleteButton';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { formatUtcForUser } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { updateWaitlistEntry } from '@/app/portal/admin/waitlist/actions';
import {
  waitlistErrorMessage,
  waitlistStatusClass,
  waitlistStatusLabel,
  waitlistToFormValues,
  type WaitlistEntryRecord,
} from '@/app/portal/admin/waitlist/config';

export default async function AdminWaitlistDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const session = await requireRole(['admin']);
  const { id } = await params;
  const query = await searchParams;
  const supabase = await getSupabaseServerClient();

  const { data } = await (supabase as any).from('waitlist_entries').select('*').eq('id', id).maybeSingle();
  const entry = (data ?? null) as WaitlistEntryRecord | null;

  if (!entry) {
    notFound();
  }

  const profileMap = await getProfileMap(supabase, [entry.created_by]);
  const creator = profileMap[entry.created_by];
  const createdByLabel =
    creator?.display_name || creator?.email || entry.created_by || 'Unknown';
  const errorMessage = waitlistErrorMessage(query.error);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/portal/admin/waitlist"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {'<- Back to Waitlist'}
        </Link>
      </div>

      {query.updated === '1' ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
          Waitlist entry updated successfully.
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <SectionCard
        title={`${entry.parent_name} Family`}
        description={entry.timezone ? `Timezone: ${entry.timezone}` : 'No timezone set'}
      >
        <div className="grid gap-3 md:grid-cols-2 text-sm">
          <p>
            <span className="font-medium text-navy-800 dark:text-white">Created by:</span> {createdByLabel}
          </p>
          <p>
            <span className="font-medium text-navy-800 dark:text-white">Created at:</span>{' '}
            {formatUtcForUser(entry.created_at, session.profile.timezone)}
          </p>
          <p>
            <span className="font-medium text-navy-800 dark:text-white">Last updated:</span>{' '}
            {formatUtcForUser(entry.updated_at, session.profile.timezone)}
          </p>
          <div className="md:col-span-2">
            <span className="font-medium text-navy-800 dark:text-white">Status:</span>{' '}
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${waitlistStatusClass(entry.status)}`}>
              {waitlistStatusLabel(entry.status)}
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Waitlist Details" description="Edit the waitlist entry.">
        <AdminWaitlistForm
          formAction={updateWaitlistEntry}
          entryId={entry.id}
          initialValues={waitlistToFormValues(entry)}
          submitLabel="Save Changes"
          cancelHref="/portal/admin/waitlist"
        />
      </SectionCard>

      <SectionCard
        title="Danger Zone"
        description="Permanently remove this waitlist entry. This cannot be undone."
      >
        <WaitlistDeleteButton entryId={entry.id} parentName={entry.parent_name} />
      </SectionCard>
    </div>
  );
}
