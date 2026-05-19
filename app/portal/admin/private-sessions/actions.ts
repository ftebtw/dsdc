'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/portal/auth';
import { getPortalAppUrl } from '@/lib/email/resend';
import { sendPortalEmail } from '@/lib/email/send';
import { isValidTimezone } from '@/lib/portal/timezone';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const ALLOWED_STATUSES = ['awaiting_payment', 'confirmed'] as const;
type AdminCreatableStatus = (typeof ALLOWED_STATUSES)[number];
const MAX_ADDITIONAL_ATTENDEES = 2;
const NEW_REDIRECT = '/portal/admin/private-sessions/new';

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

function createTemporaryPassword(): string {
  return `Tmp${randomBytes(6).toString('hex')}!1A`;
}

function studentTemporaryPasswordTemplate(input: {
  locale: 'en' | 'zh';
  displayName: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh ? 'DSDC 门户账号已创建（临时密码）' : 'Your DSDC portal account (temporary password)';
  const lines = isZh
    ? [
        `您好 ${input.displayName}，`,
        '管理员已为您创建 DSDC 门户账号（学生）。',
        `登录邮箱：${input.email}`,
        `临时密码：${input.temporaryPassword}`,
        '请先使用临时密码登录，然后立即在门户中修改密码。',
      ]
    : [
        `Hi ${input.displayName},`,
        'An admin created your DSDC portal account (Student).',
        `Login email: ${input.email}`,
        `Temporary password: ${input.temporaryPassword}`,
        'Sign in with this temporary password, then change it immediately in the portal.',
      ];

  const htmlLines = lines.map((line) => `<p style="margin:0 0 10px 0;">${line}</p>`).join('');
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111;line-height:1.45;"><div style="max-width:640px;margin:0 auto;border:1px solid #eee;border-radius:10px;padding:18px;"><h2 style="margin:0 0 14px 0;color:#11294a;">${subject}</h2>${htmlLines}<p style="margin:16px 0 0 0;"><a href="${input.loginUrl}" style="background:#11294a;color:#fff;text-decoration:none;padding:10px 14px;border-radius:6px;display:inline-block;">${isZh ? '打开门户登录' : 'Open Portal Login'}</a></p></div></body></html>`;
  const text = [subject, '', ...lines, '', `Portal login: ${input.loginUrl}`].join('\n');

  return { subject, html, text };
}

function normalizeStatus(value: string): AdminCreatableStatus {
  return (ALLOWED_STATUSES as readonly string[]).includes(value)
    ? (value as AdminCreatableStatus)
    : 'awaiting_payment';
}

function normalizeLocale(value: string): 'en' | 'zh' {
  return value === 'zh' ? 'zh' : 'en';
}

function parsePriceCad(value: string): number | null {
  if (!value) return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num * 100) / 100;
}

function validTimeString(value: string): boolean {
  return /^\d{2}:\d{2}(:\d{2})?$/.test(value);
}

function validDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeTime(value: string): string {
  if (!validTimeString(value)) return '';
  return value.length === 5 ? `${value}:00` : value;
}

type AttendeeSpec =
  | { mode: 'existing'; studentId: string }
  | {
      mode: 'new';
      name: string;
      email: string;
      locale: 'en' | 'zh';
      timezone: string;
      emailPassword: boolean;
    };

type PendingPasswordEmail = {
  email: string;
  password: string;
  locale: 'en' | 'zh';
  displayName: string;
};

type ResolvedStudent = {
  studentId: string;
  pendingEmail: PendingPasswordEmail | null;
};

function parseAttendees(formData: FormData): AttendeeSpec[] {
  const raw = String(formData.get('attendees') || '[]');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const out: AttendeeSpec[] = [];
  for (const entry of parsed) {
    if (!entry || typeof entry !== 'object') continue;
    const e = entry as Record<string, unknown>;
    const mode = e.mode === 'new' ? 'new' : 'existing';
    if (mode === 'existing') {
      const studentId = typeof e.studentId === 'string' ? e.studentId.trim() : '';
      if (!studentId) continue;
      out.push({ mode, studentId });
    } else {
      const name = typeof e.name === 'string' ? e.name.trim() : '';
      const email = (typeof e.email === 'string' ? e.email.trim() : '').toLowerCase();
      const locale = (typeof e.locale === 'string' ? e.locale : 'en') === 'zh' ? 'zh' : 'en';
      const timezone = typeof e.timezone === 'string' && e.timezone.trim() ? e.timezone.trim() : '';
      const emailPassword = Boolean(e.emailPassword);
      if (!name || !email) continue;
      out.push({ mode: 'new', name, email, locale, timezone, emailPassword });
    }
  }
  return out;
}

async function resolveStudent(
  spec: AttendeeSpec,
  fallbackTimezone: string
): Promise<ResolvedStudent> {
  if (spec.mode === 'existing') {
    return { studentId: spec.studentId, pendingEmail: null };
  }

  if (!spec.email || !/.+@.+\..+/.test(spec.email)) {
    redirect(`${NEW_REDIRECT}?error=invalid_new_student_email`);
  }
  if (!spec.name) {
    redirect(`${NEW_REDIRECT}?error=missing_new_student_name`);
  }
  const tz = spec.timezone || fallbackTimezone;
  if (!isValidTimezone(tz)) {
    redirect(`${NEW_REDIRECT}?error=invalid_new_student_timezone`);
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const temporaryPassword = createTemporaryPassword();
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: spec.email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      role: 'student',
      display_name: spec.name,
      locale: spec.locale,
      timezone: tz,
    },
  });
  if (createErr || !created?.user?.id) {
    console.error('[admin-create-private-session] new student auth user failed', createErr);
    redirect(`${NEW_REDIRECT}?error=new_student_create_failed`);
  }
  const studentId = created.user.id as string;

  const { error: profileErr } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id: studentId,
        email: spec.email,
        role: 'student',
        display_name: spec.name,
        timezone: tz,
        locale: spec.locale,
      },
      { onConflict: 'id' }
    );
  if (profileErr) {
    console.error('[admin-create-private-session] new student profile failed', profileErr);
    redirect(`${NEW_REDIRECT}?error=new_student_profile_failed`);
  }

  return {
    studentId,
    pendingEmail: spec.emailPassword
      ? {
          email: spec.email,
          password: temporaryPassword,
          locale: spec.locale,
          displayName: spec.name,
        }
      : null,
  };
}

export async function createPrivateSessionAsAdmin(formData: FormData): Promise<void> {
  const session = await requireRole(['admin']);

  // ---- Parse + validate form input ---------------------------------------
  const studentMode = readString(formData, 'student_mode') === 'new' ? 'new' : 'existing';
  const coachId = readString(formData, 'coach_id');
  const requestedDate = readString(formData, 'requested_date');
  const startTime = normalizeTime(readString(formData, 'requested_start_time'));
  const endTime = normalizeTime(readString(formData, 'requested_end_time'));
  const timezone = readString(formData, 'timezone') || session.profile.timezone || 'America/Vancouver';
  const status = normalizeStatus(readString(formData, 'status'));
  const priceCad = parsePriceCad(readString(formData, 'price_cad'));
  const zoomLink = readNullableString(formData, 'zoom_link');
  const adminNotes = readNullableString(formData, 'admin_notes');
  const availabilityId = readNullableString(formData, 'availability_id');

  if (!coachId) redirect(`${NEW_REDIRECT}?error=missing_coach`);
  if (!validDateString(requestedDate)) redirect(`${NEW_REDIRECT}?error=invalid_date`);
  if (!startTime || !endTime) redirect(`${NEW_REDIRECT}?error=invalid_time`);
  if (startTime >= endTime) redirect(`${NEW_REDIRECT}?error=invalid_time_range`);
  if (!isValidTimezone(timezone)) redirect(`${NEW_REDIRECT}?error=invalid_timezone`);
  if (priceCad === null) redirect(`${NEW_REDIRECT}?error=invalid_price`);

  const supabase = await getSupabaseServerClient();

  // ---- Build the primary student spec ------------------------------------
  let primarySpec: AttendeeSpec;
  if (studentMode === 'existing') {
    const studentId = readString(formData, 'student_id');
    if (!studentId) redirect(`${NEW_REDIRECT}?error=missing_student`);
    primarySpec = { mode: 'existing', studentId };
  } else {
    primarySpec = {
      mode: 'new',
      name: readString(formData, 'new_student_name'),
      email: readString(formData, 'new_student_email').toLowerCase(),
      locale: normalizeLocale(readString(formData, 'new_student_locale')),
      timezone: readString(formData, 'new_student_timezone') || timezone,
      emailPassword: readBoolean(formData, 'email_password'),
    };
  }

  const attendeeSpecs = parseAttendees(formData);
  if (attendeeSpecs.length > MAX_ADDITIONAL_ATTENDEES) {
    redirect(`${NEW_REDIRECT}?error=too_many_attendees`);
  }

  // Resolve primary first so we can dedupe against it.
  const primary = await resolveStudent(primarySpec, timezone);

  // Resolve each attendee, deduping against primary + earlier attendees.
  const attendeeResolved: ResolvedStudent[] = [];
  const seenIds = new Set<string>([primary.studentId]);
  for (const spec of attendeeSpecs) {
    const resolved = await resolveStudent(spec, timezone);
    if (seenIds.has(resolved.studentId)) {
      redirect(`${NEW_REDIRECT}?error=duplicate_attendee`);
    }
    seenIds.add(resolved.studentId);
    attendeeResolved.push(resolved);
  }

  // ---- Insert private_sessions row ---------------------------------------
  const insertPayload: Record<string, unknown> = {
    student_id: primary.studentId,
    coach_id: coachId,
    availability_id: availabilityId || null,
    requested_date: requestedDate,
    requested_start_time: startTime,
    requested_end_time: endTime,
    timezone,
    status,
    price_cad: priceCad,
    zoom_link: zoomLink,
    coach_notes: adminNotes,
    admin_approved_at: new Date().toISOString(),
    admin_approved_by: session.userId,
    confirmed_at: status === 'confirmed' ? new Date().toISOString() : null,
  };

  const { data: createdSession, error: insertError } = await (supabase as any)
    .from('private_sessions')
    .insert(insertPayload)
    .select('id')
    .single();

  if (insertError || !createdSession?.id) {
    console.error('[admin-create-private-session] insert failed', insertError);
    redirect(`${NEW_REDIRECT}?error=session_create_failed`);
  }

  const newSessionId = createdSession.id as string;

  // ---- Insert attendees --------------------------------------------------
  if (attendeeResolved.length > 0) {
    const attendeeRows = attendeeResolved.map((a) => ({
      session_id: newSessionId,
      student_id: a.studentId,
    }));
    const { error: attendeeErr } = await (supabase as any)
      .from('private_session_attendees')
      .insert(attendeeRows);
    if (attendeeErr) {
      console.error('[admin-create-private-session] attendee insert failed', attendeeErr);
      // Roll back the session row to avoid a half-created state.
      await (supabase as any).from('private_sessions').delete().eq('id', newSessionId);
      redirect(`${NEW_REDIRECT}?error=attendees_insert_failed`);
    }
  }

  // ---- Email temp passwords to any newly created students ---------------
  const pendingEmails: PendingPasswordEmail[] = [];
  if (primary.pendingEmail) pendingEmails.push(primary.pendingEmail);
  for (const a of attendeeResolved) {
    if (a.pendingEmail) pendingEmails.push(a.pendingEmail);
  }

  if (pendingEmails.length > 0) {
    const portalBase = getPortalAppUrl().replace(/\/$/, '');
    const loginUrl = `${portalBase}/portal/login`;
    for (const pending of pendingEmails) {
      const template = studentTemporaryPasswordTemplate({
        locale: pending.locale,
        displayName: pending.displayName,
        email: pending.email,
        temporaryPassword: pending.password,
        loginUrl,
      });
      const sendResult = await sendPortalEmail({ to: pending.email, ...template });
      if (!sendResult.ok) {
        console.error('[admin-create-private-session] failed to email new student password', {
          email: pending.email,
          error: sendResult.error,
        });
      }
    }
  }

  revalidatePath('/portal/admin/private-sessions');
  redirect(`/portal/admin/private-sessions?created=${newSessionId}`);
}
