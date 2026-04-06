import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getPortalAppUrl } from '@/lib/email/resend';
import { sendPortalEmail } from '@/lib/email/send';
import { isValidTimezone } from '@/lib/portal/timezone';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';

const bodySchema = z.object({
  email: z.string().email(),
  display_name: z.string().min(1).max(120),
  role: z.enum(['admin', 'coach', 'ta', 'student', 'parent']),
  locale: z.enum(['en', 'zh']).default('en'),
  phone: z.string().max(40).optional().or(z.literal('')),
  timezone: z.string().min(1).max(80).default('America/Vancouver'),
  tiers: z.array(z.enum(['junior', 'senior', 'wsc'])).optional(),
  send_invite: z.boolean().default(true),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isMissingTierAssignmentsTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  return (error as { code?: string }).code === '42P01';
}

function createTemporaryPassword(): string {
  // 12 hex chars + required complexity suffix to satisfy auth password rules.
  return `Tmp${randomBytes(6).toString('hex')}!1A`;
}

function staffTemporaryPasswordTemplate(input: {
  locale: 'en' | 'zh';
  displayName: string;
  role: 'coach' | 'ta';
  email: string;
  temporaryPassword: string;
  loginUrl: string;
}) {
  const isZh = input.locale === 'zh';
  const subject = isZh ? 'DSDC 门户账号已创建（临时密码）' : 'Your DSDC portal account (temporary password)';
  const roleLabel = input.role === 'ta' ? 'TA' : 'Coach';

  const lines = isZh
    ? [
        `您好 ${input.displayName}，`,
        `管理员已为您创建 DSDC 门户账号（角色：${roleLabel}）。`,
        `登录邮箱：${input.email}`,
        `临时密码：${input.temporaryPassword}`,
        '请先使用临时密码登录，然后立即在门户中修改密码。',
      ]
    : [
        `Hi ${input.displayName},`,
        `An admin created your DSDC portal account (${roleLabel}).`,
        `Login email: ${input.email}`,
        `Temporary password: ${input.temporaryPassword}`,
        'Sign in with this temporary password, then change it immediately in the portal.',
      ];

  const htmlLines = lines.map((line) => `<p style="margin:0 0 10px 0;">${line}</p>`).join('');
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111;line-height:1.45;"><div style="max-width:640px;margin:0 auto;border:1px solid #eee;border-radius:10px;padding:18px;"><h2 style="margin:0 0 14px 0;color:#11294a;">${subject}</h2>${htmlLines}<p style="margin:16px 0 0 0;"><a href="${input.loginUrl}" style="background:#11294a;color:#fff;text-decoration:none;padding:10px 14px;border-radius:6px;display:inline-block;">${isZh ? '打开门户登录' : 'Open Portal Login'}</a></p></div></body></html>`;
  const text = [subject, '', ...lines, '', `Portal login: ${input.loginUrl}`].join('\n');

  return { subject, html, text };
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['admin']);
  if (!session) return jsonError('Unauthorized', 401);

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (err) {
    console.error("[admin-create-user] invalid request body", err);
    return jsonError('Invalid request body.');
  }

  if (!isValidTimezone(body.timezone)) {
    return jsonError('Invalid timezone.');
  }

  const normalizedTiers =
    body.role === 'coach'
      ? [...new Set((body.tiers ?? []).filter((tier): tier is NonNullable<typeof body.tiers>[number] => Boolean(tier)))]
      : [];

  if (body.role === 'coach' && normalizedTiers.length === 0) {
    return jsonError('At least one tier is required for coaches.');
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const staffRole = body.role === 'coach' || body.role === 'ta' ? body.role : null;
  const isStaffAccount = Boolean(staffRole);
  const portalBase = getPortalAppUrl().replace(/\/$/, '');
  const loginUrl = `${portalBase}/portal/login`;
  const metadata: Record<string, string> = {
    role: body.role,
    display_name: body.display_name,
    locale: body.locale,
    timezone: body.timezone,
  };
  if (body.phone) metadata.phone = body.phone;

  let userId: string | undefined;
  let temporaryPassword: string | null = null;
  let credentialsEmailSent = false;

  if (isStaffAccount) {
    temporaryPassword = createTemporaryPassword();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (error) return jsonError(error.message, 400);
    userId = data.user?.id;
  } else if (body.send_invite) {
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(body.email, {
      data: metadata,
      redirectTo: `${portalBase}/auth/callback/complete?next=${encodeURIComponent('/portal')}`,
    });
    if (error) return jsonError(error.message, 400);
    userId = data.user?.id;
  } else {
    const defaultPassword = process.env.PORTAL_DEFAULT_STUDENT_PASSWORD;
    if (!defaultPassword) return jsonError('Server misconfiguration: default student password is not set.', 500);
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (error) return jsonError(error.message, 400);
    userId = data.user?.id;
  }

  if (!userId) return jsonError('User creation failed unexpectedly.', 500);

  const profilePayload: Database['public']['Tables']['profiles']['Insert'] = {
    id: userId,
    email: body.email,
    role: body.role,
    display_name: body.display_name,
    phone: body.phone || null,
    timezone: body.timezone,
    locale: body.locale,
  };

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' });
  if (profileError) return jsonError(profileError.message, 500);

  if (body.role === 'coach' || body.role === 'ta') {
    const { error: coachError } = await supabaseAdmin.from('coach_profiles').upsert(
      {
        coach_id: userId,
        tier: body.role === 'coach' ? normalizedTiers[0] : null,
        is_ta: body.role === 'ta',
      },
      { onConflict: 'coach_id' }
    );
    if (coachError) return jsonError(coachError.message, 500);

    if (body.role === 'coach') {
      const { error: clearError } = await supabaseAdmin
        .from('coach_tier_assignments')
        .delete()
      .eq('coach_id', userId);
      if (clearError && !isMissingTierAssignmentsTableError(clearError)) {
        return jsonError(clearError.message, 500);
      }

      const tierRows = normalizedTiers.map((tier) => ({ coach_id: userId, tier }));
      const { error: tierError } = await supabaseAdmin
        .from('coach_tier_assignments')
        .insert(tierRows);
      if (tierError && !isMissingTierAssignmentsTableError(tierError)) {
        return jsonError(tierError.message, 500);
      }
    }

    if (body.role === 'ta') {
      const { error: clearTierError } = await supabaseAdmin
        .from('coach_tier_assignments')
        .delete()
        .eq('coach_id', userId);
      if (clearTierError && !isMissingTierAssignmentsTableError(clearTierError)) {
        return jsonError(clearTierError.message, 500);
      }
    }
  }

  if (isStaffAccount && temporaryPassword) {
    const template = staffTemporaryPasswordTemplate({
      locale: body.locale,
      displayName: body.display_name,
      role: staffRole!,
      email: body.email,
      temporaryPassword,
      loginUrl,
    });
    const sendResult = await sendPortalEmail({
      to: body.email,
      ...template,
    });
    credentialsEmailSent = sendResult.ok;
    if (!sendResult.ok) {
      console.error('[admin-create-user] failed to send temporary password email', {
        email: body.email,
        error: sendResult.error,
      });
    }
  }

  return NextResponse.json({
    message:
      isStaffAccount && !credentialsEmailSent
        ? 'User created, but temporary password email failed to send.'
        : isStaffAccount
          ? 'User created and temporary password email sent.'
          : body.send_invite
            ? 'User invited successfully.'
            : 'User created successfully.',
    userId,
  });
}
