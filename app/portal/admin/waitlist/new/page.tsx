export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SectionCard from '@/app/portal/_components/SectionCard';
import AdminWaitlistForm from '@/app/portal/_components/AdminWaitlistForm';
import { requireRole } from '@/lib/portal/auth';
import { createWaitlistEntry } from '@/app/portal/admin/waitlist/actions';
import {
  emptyWaitlistValues,
  waitlistErrorMessage,
} from '@/app/portal/admin/waitlist/config';

export default async function AdminWaitlistNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(['admin']);
  const params = await searchParams;
  const errorMessage = waitlistErrorMessage(params.error);

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

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <SectionCard title="New Waitlist Entry" description="Add a family to the waitlist.">
        <AdminWaitlistForm
          formAction={createWaitlistEntry}
          initialValues={emptyWaitlistValues()}
          submitLabel="Save Entry"
          cancelHref="/portal/admin/waitlist"
        />
      </SectionCard>
    </div>
  );
}
