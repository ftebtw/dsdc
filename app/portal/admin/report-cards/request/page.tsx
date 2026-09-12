export const dynamic = 'force-dynamic';

import SectionCard from '@/app/portal/_components/SectionCard';
import AdminReportCardRequestForm from '@/app/portal/_components/AdminReportCardRequestForm';
import { requireRole } from '@/lib/portal/auth';
import { getProfileMap } from '@/lib/portal/data';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminRequestReportCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ term?: string }>;
}) {
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const params = await searchParams;

  const { data: termsData } = await supabase
    .from('terms')
    .select('id,name,is_active,start_date,end_date')
    .order('start_date', { ascending: false });
  const terms = (termsData ?? []) as Array<{
    id: string;
    name: string;
    is_active: boolean;
    start_date: string;
    end_date: string;
  }>;

  const selectedTermId =
    params.term || terms.find((t) => t.is_active)?.id || terms[0]?.id || '';

  const [{ data: classesData }, { data: openRequestRows }] = await Promise.all([
    selectedTermId
      ? supabase
          .from('classes')
          .select('id,name,coach_id,type')
          .eq('term_id', selectedTermId)
          .eq('is_private_session_group', false)
          .order('name', { ascending: true })
      : Promise.resolve({ data: [] as Array<any> }),
    selectedTermId
      ? (supabase as any)
          .from('report_card_requests')
          .select('id,class_id,message,due_date,requested_at,requested_by')
          .eq('term_id', selectedTermId)
          .is('resolved_at', null)
      : Promise.resolve({ data: [] }),
  ]);

  const classes = (classesData ?? []) as Array<{
    id: string;
    name: string;
    coach_id: string | null;
    type: string | null;
  }>;
  const openRequests = (openRequestRows ?? []) as Array<{
    id: string;
    class_id: string;
    message: string | null;
    due_date: string | null;
    requested_at: string;
    requested_by: string | null;
  }>;
  const openRequestByClass = new Map(openRequests.map((row) => [row.class_id, row]));

  const coachIds = [
    ...new Set(
      classes.map((c) => c.coach_id).filter((id): id is string => Boolean(id))
    ),
  ];
  const profileMap = await getProfileMap(supabase, coachIds);
  const coachNameById = Object.fromEntries(
    coachIds.map((id) => [
      id,
      profileMap[id]?.display_name || profileMap[id]?.email || id,
    ])
  );

  const initialClasses = classes.map((c) => {
    const openRequest = openRequestByClass.get(c.id) ?? null;
    return {
      id: c.id,
      name: c.name,
      coachName: c.coach_id ? coachNameById[c.coach_id] ?? null : null,
      openRequest,
    };
  });

  return (
    <SectionCard
      title="Request report cards"
      description="Pick classes to nudge the coach to submit report cards. Submitted cards land in the Review queue."
    >
      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-xs mb-1 text-charcoal/60 dark:text-navy-300">Term</span>
          <select
            name="term"
            defaultValue={selectedTermId}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          >
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name}
                {term.is_active ? ' (Active)' : ''}
              </option>
            ))}
          </select>
        </label>
        <button className="rounded-md border border-warm-300 dark:border-navy-600 px-3 py-1.5 text-sm">
          Load
        </button>
      </form>

      {!selectedTermId ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          Create a term first.
        </p>
      ) : classes.length === 0 ? (
        <p className="text-sm text-charcoal/70 dark:text-navy-300">
          No classes in this term.
        </p>
      ) : (
        <AdminReportCardRequestForm
          termId={selectedTermId}
          classes={initialClasses}
        />
      )}
    </SectionCard>
  );
}
