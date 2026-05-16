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

const NEW_REDIRECT = '/portal/admin/private-sessions/new';

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

  let studentId: string;
  let newStudentEmail: string | null = null;
  let newStudentPassword: string | null = null;
  let newStudentLocale: 'en' | 'zh' = 'en';
  let newStudentName = '';
  let sendStudentPasswordEmail = false;

  const supabase = await getSupabaseServerClient();

  if (studentMode === 'existing') {
    studentId = readString(formData, 'student_id');
    if (!studentId) redirect(`${NEW_REDIRECT}?error=missing_student`);
  } else {
    // Create new student via service-role admin client.
    const email = readString(formData, 'new_student_email').toLowerCase();
    const displayName = readString(formData, 'new_student_name');
    const locale = normalizeLocale(readString(formData, 'new_student_locale'));
    const studentTz = readString(formData, 'new_student_timezone') || timezone;
    sendStudentPasswordEmail = readBoolean(formData, 'email_password');

    if (!email || !/.+@.+\..+/.test(email)) redirect(`${NEW_REDIRECT}?error=invalid_new_student_email`);
    if (!displayName) redirect(`${NEW_REDIRECT}?error=missing_new_student_name`);
    if (!isValidTimezone(studentTz)) redirect(`${NEW_REDIRECT}?error=invalid_new_student_timezone`);

    const supabaseAdmin = getSupabaseAdminClient();
    const temporaryPassword = createTemporaryPassword();
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        role: 'student',
        display_name: displayName,
        locale,
        timezone: studentTz,
      },
    });
    if (createErr || !created?.user?.id) {
      console.error('[admin-create-private-session] new student auth user failed', createErr);
      redirect(`${NEW_REDIRECT}?error=new_student_create_failed`);
    }
    studentId = created.user.id as string;

    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: studentId,
          email,
          role: 'student',
          display_name: displayName,
          timezone: studentTz,
          locale,
        },
        { onConflict: 'id' }
      );
    if (profileErr) {
      console.error('[admin-create-private-session] new student profile failed', profileErr);
      redirect(`${NEW_REDIRECT}?error=new_student_profile_failed`);
    }

    newStudentEmail = email;
    newStudentPassword = temporaryPassword;
    newStudentLocale = locale;
    newStudentName = displayName;
  }

  // ---- Insert private_sessions row ---------------------------------------
  const insertPayload: Record<string, unknown> = {
    student_id: studentId,
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

  // ---- Email the temporary password to the newly created student --------
  if (studentMode === 'new' && sendStudentPasswordEmail && newStudentEmail && newStudentPassword) {
    const portalBase = getPortalAppUrl().replace(/\/$/, '');
    const template = studentTemporaryPasswordTemplate({
      locale: newStudentLocale,
      displayName: newStudentName,
      email: newStudentEmail,
      temporaryPassword: newStudentPassword,
      loginUrl: `${portalBase}/portal/login`,
    });
    const sendResult = await sendPortalEmail({ to: newStudentEmail, ...template });
    if (!sendResult.ok) {
      console.error('[admin-create-private-session] failed to email new student password', {
        email: newStudentEmail,
        error: sendResult.error,
      });
    }
  }

  revalidatePath('/portal/admin/private-sessions');
  redirect(`/portal/admin/private-sessions?created=${createdSession.id}`);
}
