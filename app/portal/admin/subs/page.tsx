export const dynamic = 'force-dynamic';

import { revalidatePath } from 'next/cache';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { formatSessionRangeForViewer } from '@/lib/portal/time';
import { getSupabaseServerClient } from '@/lib/supabase/server';

async function cancelSubRequest(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const id = String(formData.get('id') || '');
  if (!id) return;
  await supabase.from('sub_requests').update({ status: 'cancelled' }).eq('id', id).eq('status', 'open');
  revalidatePath('/portal/admin/subs');
}

async function cancelTaRequest(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const id = String(formData.get('id') || '');
  if (!id) return;
  await supabase.from('ta_requests').update({ status: 'cancelled' }).eq('id', id).eq('status', 'open');
  revalidatePath('/portal/admin/subs');
}

export default async function AdminSubsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole(['admin']);
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();

  let subQuery = supabase.from('sub_requests').select('*').order('session_date', { ascending: true });
  let taQuery = supabase.from('ta_requests').select('*').order('session_date', { ascending: true });
  if (params.status) {
    subQuery = subQuery.eq('status', params.status);
    taQuery = taQuery.eq('status', params.status);
  }

  const [subRaw, taRaw, classesRaw] = await Promise.all([
    subQuery,
    taQuery,
    supabase.from('classes').select('*'),
  ]);
  const subRequests = (subRaw.data ?? []) as Array<Record<string, any>>;
  const taRequests = (taRaw.data ?? []) as Array<Record<string, any>>;
  const classes = (classesRaw.data ?? []) as Array<Record<string, any>>;
  const classMap = Object.fromEntries(classes.map((classRow: any) => [classRow.id, classRow]));

  const ids = [
    ...new Set([
      ...subRequests.map((row: any) => row.requesting_coach_id),
      ...subRequests.map((row: any) => row.accepting_coach_id).filter(Boolean),
      ...taRequests.map((row: any) => row.requesting_coach_id),
      ...taRequests.map((row: any) => row.accepting_ta_id).filter(Boolean),
    ]),
  ];
  const people = await getProfileMap(supabase, ids);

  return (
    <SectionCard title="Sub & TA Requests" description="Admin view of all substitute and TA requests.">
      <form method="get" className="flex items-center gap-3 mb-4">
        <select
          name="status"
          defaultValue={params.status || ''}
          className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="accepted">Accepted</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="px-3 py-1.5 rounded-md border border-warm-300 dark:border-navy-600 text-sm">Apply</button>
      </form>

      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-navy-800 dark:text-white">Sub Requests</h3>
          {subRequests.length === 0 ? <p className="text-sm text-charcoal/70 dark:text-navy-300">No requests.</p> : null}
          {subRequests.map((row: any) => {
            const classRow = classMap[row.class_id];
            const whenText = classRow
              ? formatSessionRangeForViewer(
                  row.session_date,
                  classRow.schedule_start_time,
                  classRow.schedule_end_time,
                  classRow.timezone,
                  'America/Vancouver'
                )
              : row.session_date;
            return (
              <article key={row.id} className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4">
                <p className="font-semibold text-navy-800 dark:text-white">{classRow?.name || row.class_id}</p>
                <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">{whenText}</p>
                <p className="text-sm mt-1">
                  Requesting: {people[row.requesting_coach_id]?.display_name || people[row.requesting_coach_id]?.email || row.requesting_coach_id}
                </p>
                <p className="text-sm mt-1">
                  Accepted by: {row.accepting_coach_id ? (people[row.accepting_coach_id]?.display_name || people[row.accepting_coach_id]?.email || row.accepting_coach_id) : '—'}
                </p>
                <p className="text-sm mt-1 uppercase">Status: {row.status}</p>
                {row.status === 'open' ? (
                  <form action={cancelSubRequest} className="mt-2">
                    <input type="hidden" name="id" value={row.id} />
                    <button className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm">Cancel</button>
                  </form>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-navy-800 dark:text-white">TA Requests</h3>
          {taRequests.length === 0 ? <p className="text-sm text-charcoal/70 dark:text-navy-300">No requests.</p> : null}
          {taRequests.map((row: any) => {
            const classRow = classMap[row.class_id];
            const whenText = classRow
              ? formatSessionRangeForViewer(
                  row.session_date,
                  classRow.schedule_start_time,
                  classRow.schedule_end_time,
                  classRow.timezone,
                  'America/Vancouver'
                )
              : row.session_date;
            return (
              <article key={row.id} className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4">
                <p className="font-semibold text-navy-800 dark:text-white">{classRow?.name || row.class_id}</p>
                <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">{whenText}</p>
                <p className="text-sm mt-1">
                  Requesting: {people[row.requesting_coach_id]?.display_name || people[row.requesting_coach_id]?.email || row.requesting_coach_id}
                </p>
                <p className="text-sm mt-1">
                  Accepted by: {row.accepting_ta_id ? (people[row.accepting_ta_id]?.display_name || people[row.accepting_ta_id]?.email || row.accepting_ta_id) : '—'}
                </p>
                <p className="text-sm mt-1 uppercase">Status: {row.status}</p>
                {row.status === 'open' ? (
                  <form action={cancelTaRequest} className="mt-2">
                    <input type="hidden" name="id" value={row.id} />
                    <button className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm">Cancel</button>
                  </form>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}
