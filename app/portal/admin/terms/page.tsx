import { revalidatePath } from 'next/cache';
import SectionCard from '@/app/portal/_components/SectionCard';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

async function createTerm(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();

  const name = String(formData.get('name') || '').trim();
  const startDate = String(formData.get('start_date') || '');
  const endDate = String(formData.get('end_date') || '');
  const weeks = Number(formData.get('weeks') || 13);
  const isActive = formData.get('is_active') === 'on';
  if (!name || !startDate || !endDate || !weeks) return;

  if (isActive) {
    await supabase.from('terms').update({ is_active: false }).eq('is_active', true);
  }

  await supabase.from('terms').insert({
    name,
    start_date: startDate,
    end_date: endDate,
    weeks,
    is_active: isActive,
  });

  revalidatePath('/portal/admin/terms');
}

async function updateTerm(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();

  const id = String(formData.get('id') || '');
  const name = String(formData.get('name') || '').trim();
  const startDate = String(formData.get('start_date') || '');
  const endDate = String(formData.get('end_date') || '');
  const weeks = Number(formData.get('weeks') || 13);
  const isActive = formData.get('is_active') === 'on';
  if (!id || !name || !startDate || !endDate || !weeks) return;

  if (isActive) {
    await supabase.from('terms').update({ is_active: false }).eq('is_active', true);
  }

  await supabase
    .from('terms')
    .update({
      name,
      start_date: startDate,
      end_date: endDate,
      weeks,
      is_active: isActive,
    })
    .eq('id', id);

  revalidatePath('/portal/admin/terms');
}

async function deleteTerm(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const id = String(formData.get('id') || '');
  if (!id) return;
  await supabase.from('terms').delete().eq('id', id);
  revalidatePath('/portal/admin/terms');
}

export default async function AdminTermsPage() {
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const { data: termsData } = await supabase.from('terms').select('*').order('start_date', { ascending: false });
  const terms = (termsData ?? []) as any[];

  return (
    <div className="space-y-6">
      <SectionCard title="Create Term" description="Only one term can be active at a time.">
        <form action={createTerm} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            name="name"
            required
            placeholder="Winter 2026"
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <input
            name="start_date"
            required
            type="date"
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <input
            name="end_date"
            required
            type="date"
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <input
            name="weeks"
            required
            type="number"
            min={1}
            defaultValue={13}
            className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2"
          />
          <div className="flex items-center justify-between gap-3 rounded-lg border border-warm-300 dark:border-navy-600 px-3 py-2">
            <label className="text-sm text-navy-700 dark:text-navy-200">Set active</label>
            <input type="checkbox" name="is_active" />
          </div>
          <button
            type="submit"
            className="lg:col-span-5 justify-self-start px-4 py-2 rounded-lg bg-navy-800 text-white font-semibold"
          >
            Create Term
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Terms" description="Edit or archive existing terms.">
        <div className="space-y-4">
          {terms.map((term: any) => (
            <form
              key={term.id}
              action={updateTerm}
              className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-900 p-4 grid sm:grid-cols-2 lg:grid-cols-6 gap-3"
            >
              <input type="hidden" name="id" value={term.id} />
              <input
                name="name"
                defaultValue={term.name}
                required
                className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              />
              <input
                name="start_date"
                type="date"
                defaultValue={term.start_date}
                required
                className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              />
              <input
                name="end_date"
                type="date"
                defaultValue={term.end_date}
                required
                className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              />
              <input
                name="weeks"
                type="number"
                min={1}
                defaultValue={term.weeks}
                required
                className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2"
              />
              <label className="rounded-lg border border-warm-300 dark:border-navy-600 px-3 py-2 flex items-center justify-between">
                <span className="text-sm text-navy-700 dark:text-navy-200">Active</span>
                <input name="is_active" type="checkbox" defaultChecked={term.is_active} />
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button type="submit" className="px-3 py-1.5 rounded-md bg-gold-300 text-navy-900 text-sm font-semibold">
                  Save
                </button>
                <button
                  formAction={deleteTerm}
                  className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm"
                >
                  Delete
                </button>
              </div>
            </form>
          ))}
          {terms.length === 0 ? (
            <p className="text-sm text-charcoal/70 dark:text-navy-300">No terms created yet.</p>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
