'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  normalizeConsultationStatus,
  normalizeHowFoundUs,
  normalizePreferredLanguage,
} from '@/app/portal/admin/consultations/config';

function readString(formData: FormData, key: string): string {
  return String(formData.get(key) || '').trim();
}

function readNullableString(formData: FormData, key: string): string | null {
  const value = readString(formData, key);
  return value || null;
}

function readNullableInteger(formData: FormData, key: string): number | null {
  const raw = readString(formData, key);
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.floor(parsed);
}

function readBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === 'on';
}

function readDate(formData: FormData, key: string): string {
  const value = readString(formData, key);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date().toISOString().slice(0, 10);
}

function consultationPayload(formData: FormData) {
  const hasPriorExperience = readBoolean(formData, 'has_prior_experience');

  return {
    status: normalizeConsultationStatus(readString(formData, 'status')),
    parent_name: readString(formData, 'parent_name'),
    parent_email: readNullableString(formData, 'parent_email'),
    parent_phone: readNullableString(formData, 'parent_phone'),
    preferred_language: normalizePreferredLanguage(readString(formData, 'preferred_language')),
    student_name: readString(formData, 'student_name'),
    student_grade: readNullableString(formData, 'student_grade'),
    student_age: readNullableInteger(formData, 'student_age'),
    student_school: readNullableString(formData, 'student_school'),
    location_timezone: readNullableString(formData, 'location_timezone'),
    how_found_us: normalizeHowFoundUs(readString(formData, 'how_found_us')),
    how_found_us_details: readNullableString(formData, 'how_found_us_details'),
    has_prior_experience: hasPriorExperience,
    prior_experience_details: hasPriorExperience
      ? readNullableString(formData, 'prior_experience_details')
      : null,
    goals: readNullableString(formData, 'goals'),
    recommended_class: readNullableString(formData, 'recommended_class'),
    next_steps: readNullableString(formData, 'next_steps'),
    notes: readNullableString(formData, 'notes'),
    consult_date: readDate(formData, 'consult_date'),
  };
}

export async function createConsultation(formData: FormData) {
  const session = await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const payload = consultationPayload(formData);

  if (!payload.parent_name || !payload.student_name) {
    redirect('/portal/admin/consultations/new?error=missing_required');
  }

  const { error } = await (supabase as any).from('consultations').insert({
    ...payload,
    created_by: session.userId,
  });

  if (error) {
    console.error('[consultations] create failed', error);
    redirect('/portal/admin/consultations/new?error=save_failed');
  }

  revalidatePath('/portal/admin/consultations');
  redirect('/portal/admin/consultations?created=1');
}

export async function updateConsultation(formData: FormData) {
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const consultationId = readString(formData, 'id');
  const payload = consultationPayload(formData);

  if (!consultationId) {
    redirect('/portal/admin/consultations?error=missing_record');
  }

  if (!payload.parent_name || !payload.student_name) {
    redirect(`/portal/admin/consultations/${consultationId}?error=missing_required`);
  }

  const { error } = await (supabase as any)
    .from('consultations')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', consultationId);

  if (error) {
    console.error('[consultations] update failed', error);
    redirect(`/portal/admin/consultations/${consultationId}?error=save_failed`);
  }

  revalidatePath('/portal/admin/consultations');
  revalidatePath(`/portal/admin/consultations/${consultationId}`);
  redirect(`/portal/admin/consultations/${consultationId}?updated=1`);
}

export async function deleteConsultation(formData: FormData) {
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const consultationId = readString(formData, 'id');

  if (!consultationId) {
    redirect('/portal/admin/consultations?error=missing_record');
  }

  const { error } = await (supabase as any)
    .from('consultations')
    .delete()
    .eq('id', consultationId);

  if (error) {
    console.error('[consultations] delete failed', error);
    redirect(`/portal/admin/consultations/${consultationId}?error=delete_failed`);
  }

  revalidatePath('/portal/admin/consultations');
  redirect('/portal/admin/consultations?deleted=1');
}

export async function updateConsultationStatus(id: string, status: string) {
  await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const consultationId = String(id || '').trim();
  const normalizedStatus = normalizeConsultationStatus(status);

  if (!consultationId) {
    return { ok: false, error: 'Missing consultation record.' };
  }

  const { error } = await (supabase as any)
    .from('consultations')
    .update({
      status: normalizedStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', consultationId);

  if (error) {
    console.error('[consultations] quick status update failed', error);
    return { ok: false, error: 'Could not update consultation status.' };
  }

  revalidatePath('/portal/admin/consultations');
  revalidatePath(`/portal/admin/consultations/${consultationId}`);

  return { ok: true };
}
