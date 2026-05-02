export const dynamic = 'force-dynamic';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import ConfirmDeleteButton from '@/app/portal/_components/ConfirmDeleteButton';
import FlashBanners from '@/app/portal/_components/FlashBanners';
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
  if (!name || !startDate || !endDate || !weeks) {
    redirect('/portal/admin/terms?error=missing_fields');
  }

  if (isActive) {
    const { error: deactivateError } = await supabase
      .from('terms')
      .update({ is_active: false })
      .eq('is_active', true);
    if (deactivateError) {
      console.error('[admin-terms] deactivate failed', deactivateError);
      redirect('/portal/admin/terms?error=save_failed');
    }
  }

  const { error } = await supabase.from('terms').insert({
    name,
    start_date: startDate,
    end_date: endDate,
    weeks,
    is_active: isActive,
  });
  if (error) {
    console.error('[admin-terms] create failed', error);
    redirect('/portal/admin/terms?error=save_failed');
  }

  revalidatePath('/portal/admin/terms');
  redirect('/portal/admin/terms?created=1');
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
  if (!id || !name || !startDate || !endDate || !weeks) {
    redirect('/portal/admin/terms?error=missing_fields');
  }

  if (isActive) {
    const { error: deactivateError } = await supabase
      .from('terms')
      .update({ is_active: false })
      .eq('is_active', true);
    if (deactivateError) {
      console.error('[admin-terms] deactivate failed', deactivateError);
      redirect('/portal/admin/terms?error=save_failed');
    }
  }

  const { error } = await supabase
    .from('terms')
    .update({
      name,
      start_date: startDate,
      end_date: endDate,
      weeks,
      is_active: isActive,
    })
    .eq('id', id);
  if (error) {
    console.error('[admin-terms] update failed', error);
    redirect('/portal/admin/terms?error=save_failed');
  }

  revalidatePath('/portal/admin/terms');
  redirect('/portal/admin/terms?saved=1');
}

async function deleteTerm(formData: FormData) {
  'use server';
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const id = String(formData.get('id') || '');
  if (!id) {
    redirect('/portal/admin/terms?error=missing_record');
  }

  const { error } = await supabase.from('terms').delete().eq('id', id);
  if (error) {
    console.error('[admin-terms] delete failed', error);
    redirect('/portal/admin/terms?error=delete_failed');
  }

  revalidatePath('/portal/admin/terms');
  redirect('/portal/admin/terms?deleted=1');
}

export default async function AdminTermsPage({
  searchParams,
}: {
  searchParams: Promise<{
    created?: string;
    saved?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const params = await searchParams;
  const { data: termsData } = await supabase.from('terms').select('*').order('start_date', { ascending: false });
  const terms = (termsData ?? []) as Array<Record<string, any>>;

  return (
    <div className="space-y-6">
      <FlashBanners
        searchParams={params}
        successMessages={{
          created: 'Term created successfully.',
          saved: 'Term saved.',
          deleted: 'Term deleted.',
        }}
        errorMessages={{
          missing_fields: 'Please fill in all required fields.',
          missing_record: 'Term not found.',
          save_failed: 'Could not save the term. Please try again.',
          delete_failed: 'Could not delete the term. It may still have related classes or other linked data.',
        }}
      />

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
                <ConfirmDeleteButton
                  action={deleteTerm}
                  confirmMessage="Deleting a term cascades to its classes, enrollments, attendance, and resources. This cannot be undone."
                >
                  Delete
                </ConfirmDeleteButton>
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
