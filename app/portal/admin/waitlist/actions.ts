'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  normalizeWaitlistStatus,
  sanitizeStudents,
  type WaitlistStudent,
} from '@/app/portal/admin/waitlist/config';

function readString(formData: FormData, key: string): string {
  return String(formData.get(key) || '').trim();
}

function readNullableString(formData: FormData, key: string): string | null {
  const value = readString(formData, key);
  return value || null;
}

function readBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === 'on';
}

function readStudents(formData: FormData): WaitlistStudent[] {
  const raw = readString(formData, 'students_json');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return sanitizeStudents(parsed);
  } catch {
    return [];
  }
}

function waitlistPayload(formData: FormData) {
  const hasDebateExperience = readBoolean(formData, 'has_debate_experience');

  return {
    status: normalizeWaitlistStatus(readString(formData, 'status')),
    parent_name: readString(formData, 'parent_name'),
    parent_email: readNullableString(formData, 'parent_email'),
    parent_phone: readNullableString(formData, 'parent_phone'),
    students: readStudents(formData),
    has_debate_experience: hasDebateExperience,
    debate_experience_details: hasDebateExperience
      ? readNullableString(formData, 'debate_experience_details')
      : null,
    timezone: readNullableString(formData, 'timezone'),
    location: readNullableString(formData, 'location'),
    preferred_days_times: readNullableString(formData, 'preferred_days_times'),
    notes: readNullableString(formData, 'notes'),
  };
}

export async function createWaitlistEntry(formData: FormData) {
  const session = await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const payload = waitlistPayload(formData);

  if (!payload.parent_name) {
    redirect('/portal/admin/waitlist/new?error=missing_required');
  }

  const { error } = await (supabase as any).from('waitlist_entries').insert({
    ...payload,
    created_by: session.userId,
  });

  if (error) {
    console.error('[waitlist] create failed', error);
    redirect('/portal/admin/waitlist/new?error=save_failed');
  }

  revalidatePath('/portal/admin/waitlist');
  redirect('/portal/admin/waitlist?created=1');
}

export async function updateWaitlistEntry(formData: FormData) {
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const entryId = readString(formData, 'id');
  const payload = waitlistPayload(formData);

  if (!entryId) {
    redirect('/portal/admin/waitlist?error=missing_record');
  }

  if (!payload.parent_name) {
    redirect(`/portal/admin/waitlist/${entryId}?error=missing_required`);
  }

  const { error } = await (supabase as any)
    .from('waitlist_entries')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', entryId);

  if (error) {
    console.error('[waitlist] update failed', error);
    redirect(`/portal/admin/waitlist/${entryId}?error=save_failed`);
  }

  revalidatePath('/portal/admin/waitlist');
  revalidatePath(`/portal/admin/waitlist/${entryId}`);
  redirect(`/portal/admin/waitlist/${entryId}?updated=1`);
}

export async function deleteWaitlistEntry(formData: FormData) {
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const entryId = readString(formData, 'id');

  if (!entryId) {
    redirect('/portal/admin/waitlist?error=missing_record');
  }

  const { error } = await (supabase as any)
    .from('waitlist_entries')
    .delete()
    .eq('id', entryId);

  if (error) {
    console.error('[waitlist] delete failed', error);
    redirect(`/portal/admin/waitlist/${entryId}?error=delete_failed`);
  }

  revalidatePath('/portal/admin/waitlist');
  redirect('/portal/admin/waitlist?deleted=1');
}

export async function updateWaitlistStatus(id: string, status: string) {
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const entryId = String(id || '').trim();
  const normalizedStatus = normalizeWaitlistStatus(status);

  if (!entryId) {
    return { ok: false, error: 'Missing waitlist record.' };
  }

  const { error } = await (supabase as any)
    .from('waitlist_entries')
    .update({
      status: normalizedStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', entryId);

  if (error) {
    console.error('[waitlist] quick status update failed', error);
    return { ok: false, error: 'Could not update waitlist status.' };
  }

  revalidatePath('/portal/admin/waitlist');
  revalidatePath(`/portal/admin/waitlist/${entryId}`);

  return { ok: true };
}
