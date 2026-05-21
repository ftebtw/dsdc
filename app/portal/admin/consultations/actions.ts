'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/portal/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import {
  normalizeConsultationStatuses,
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

function readBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === 'on';
}

function readDate(formData: FormData, key: string): string {
  const value = readString(formData, key);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date().toISOString().slice(0, 10);
}

function readStatuses(formData: FormData): string[] {
  const raw = formData.get('statuses');
  if (typeof raw === 'string' && raw.length > 0) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((entry): entry is string => typeof entry === 'string');
      }
    } catch {
      // fall through
    }
  }
  const single = formData.get('status');
  return typeof single === 'string' && single.length > 0 ? [single] : [];
}

function consultationPayload(formData: FormData) {
  const hasPriorExperience = readBoolean(formData, 'has_prior_experience');

  return {
    status: normalizeConsultationStatuses(readStatuses(formData)),
    parent_name: readString(formData, 'parent_name'),
    parent_email: readNullableString(formData, 'parent_email'),
    parent_phone: readNullableString(formData, 'parent_phone'),
    preferred_language: normalizePreferredLanguage(readString(formData, 'preferred_language')),
    location_timezone: readNullableString(formData, 'location_timezone'),
    how_found_us: normalizeHowFoundUs(readString(formData, 'how_found_us')),
    how_found_us_details: readNullableString(formData, 'how_found_us_details'),
    has_prior_experience: hasPriorExperience,
    prior_experience_details: hasPriorExperience
      ? readNullableString(formData, 'prior_experience_details')
      : null,
    goals: readNullableString(formData, 'goals'),
    next_steps: readNullableString(formData, 'next_steps'),
    notes: readNullableString(formData, 'notes'),
    consult_date: readDate(formData, 'consult_date'),
  };
}

type StudentRow = {
  student_name: string;
  student_grade: string | null;
  student_age: number | null;
  student_school: string | null;
  recommended_class: string | null;
};

function readStudents(formData: FormData): StudentRow[] {
  const raw = String(formData.get('students') || '[]');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const cleaned: StudentRow[] = [];
  for (const entry of parsed) {
    if (!entry || typeof entry !== 'object') continue;
    const e = entry as Record<string, unknown>;
    const name = typeof e.studentName === 'string' ? e.studentName.trim() : '';
    if (!name) continue;
    const grade = typeof e.studentGrade === 'string' ? e.studentGrade.trim() : '';
    const ageRaw = typeof e.studentAge === 'string' ? e.studentAge.trim() : '';
    const ageNum = ageRaw ? Number(ageRaw) : Number.NaN;
    const age = Number.isFinite(ageNum) && ageNum >= 0 ? Math.floor(ageNum) : null;
    const school = typeof e.studentSchool === 'string' ? e.studentSchool.trim() : '';
    const recommended = typeof e.recommendedClass === 'string' ? e.recommendedClass.trim() : '';
    cleaned.push({
      student_name: name,
      student_grade: grade || null,
      student_age: age,
      student_school: school || null,
      recommended_class: recommended || null,
    });
  }
  return cleaned;
}

export async function createConsultation(formData: FormData) {
  const session = await requireRole(['admin']);
  const supabase = await getSupabaseServerClient();
  const payload = consultationPayload(formData);
  const students = readStudents(formData);

  if (!payload.parent_name || students.length === 0) {
    redirect('/portal/admin/consultations/new?error=missing_required');
  }

  const { data: created, error } = await (supabase as any)
    .from('consultations')
    .insert({
      ...payload,
      created_by: session.userId,
    })
    .select('id')
    .single();

  if (error || !created?.id) {
    console.error('[consultations] create failed', error);
    redirect('/portal/admin/consultations/new?error=save_failed');
  }

  const consultationId = created.id as string;
  const studentRows = students.map((student, index) => ({
    ...student,
    consultation_id: consultationId,
    sort_order: index,
  }));

  const { error: studentsError } = await (supabase as any)
    .from('consultation_students')
    .insert(studentRows);

  if (studentsError) {
    console.error('[consultations] create students failed', studentsError);
    await (supabase as any).from('consultations').delete().eq('id', consultationId);
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
  const students = readStudents(formData);

  if (!consultationId) {
    redirect('/portal/admin/consultations?error=missing_record');
  }

  if (!payload.parent_name || students.length === 0) {
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

  const { error: deleteError } = await (supabase as any)
    .from('consultation_students')
    .delete()
    .eq('consultation_id', consultationId);

  if (deleteError) {
    console.error('[consultations] update students delete failed', deleteError);
    redirect(`/portal/admin/consultations/${consultationId}?error=save_failed`);
  }

  const studentRows = students.map((student, index) => ({
    ...student,
    consultation_id: consultationId,
    sort_order: index,
  }));

  const { error: insertError } = await (supabase as any)
    .from('consultation_students')
    .insert(studentRows);

  if (insertError) {
    console.error('[consultations] update students insert failed', insertError);
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

