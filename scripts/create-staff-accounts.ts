/**
 * Create admin/coach accounts with temporary passwords and email credentials.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/create-staff-accounts.ts
 *
 * Optional flags:
 *   --dry-run    Preview what would be created without making changes
 *   --no-email   Create accounts but skip sending emails
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

// Config

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.PORTAL_FROM_EMAIL || 'DSDC Portal <portal@dsdc.ca>';
const PORTAL_URL = process.env.PORTAL_APP_URL?.replace(/\/$/, '') || 'https://dsdc.ca';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.');
}

const dryRun = process.argv.includes('--dry-run');
const skipEmail = process.argv.includes('--no-email');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Staff definitions

type CoachTier = 'junior' | 'senior' | 'wsc';

type StaffMember = {
  email: string;
  displayName: string;
  role: 'admin' | 'coach';
  title: string;
  tiers?: CoachTier[];
};

const STAFF: StaffMember[] = [
  // Admins
  {
    email: 'rebecca.ctca@gmail.com',
    displayName: 'Rebecca Amisano',
    role: 'admin',
    title: 'Director',
  },
  {
    email: 'cheyenne_ding@yahoo.ca',
    displayName: 'Cheyenne Ding',
    role: 'admin',
    title: 'Assistant',
  },
  {
    email: 'sylviasu66@gmail.com',
    displayName: 'Ming Su',
    role: 'admin',
    title: 'Manager',
  },
  {
    email: 'brandonw22122@gmail.com',
    displayName: 'Brandon Wong',
    role: 'admin',
    title: 'Administrator',
  },

  // Coaches
  {
    email: 'rebecca.amisano@icloud.com',
    displayName: 'Rebecca Amisano',
    role: 'coach',
    title: 'Junior Debate Coach, Senior Debate Coach, World Scholars Cup Coach',
    tiers: ['junior', 'senior', 'wsc'],
  },
  {
    email: 'emlee.cui@gmail.com',
    displayName: 'Emily Cui',
    role: 'coach',
    title: 'Junior Debate Coach, World Scholars Cup Coach',
    tiers: ['junior', 'wsc'],
  },
  {
    email: 'akash.krishnamurthy24@gmail.com',
    displayName: 'Akash Krishnamurthy',
    role: 'coach',
    title: 'Junior Debate Coach',
    tiers: ['junior'],
  },
  {
    email: 'gabriellewong123@gmail.com',
    displayName: 'Gabrielle Wong',
    role: 'coach',
    title: 'Junior Debate Coach, Senior Debate Coach, Public Speaking Coach',
    tiers: ['junior', 'senior'],
  },
];

// Helpers

function generatePassword(): string {
  // 12-char password: letters + digits + special char
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const special = '!@#$&*';
  let password = '';
  for (let i = 0; i < 11; i++) {
    password += chars[crypto.randomInt(chars.length)];
  }
  password += special[crypto.randomInt(special.length)];

  // Shuffle
  return password
    .split('')
    .sort(() => crypto.randomInt(3) - 1)
    .join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEmail(member: StaffMember, tempPassword: string) {
  const loginUrl = `${PORTAL_URL}/portal/login`;
  const roleLabel = member.role === 'admin' ? 'Administrator' : 'Coach';

  const subject = `DSDC Portal - Your ${roleLabel} Account Is Ready`;

  const html = `<!doctype html>
<html>
<body style="font-family:Arial,sans-serif;color:#111;line-height:1.5;">
<div style="max-width:640px;margin:0 auto;border:1px solid #eee;border-radius:10px;padding:24px;">
  <h2 style="margin:0 0 16px 0;color:#11294a;">Welcome to the DSDC Portal!</h2>

  <p style="margin:0 0 12px 0;">Hi ${escapeHtml(member.displayName)},</p>

  <p style="margin:0 0 12px 0;">Your <strong>${roleLabel}</strong> account has been created for the DSDC Portal. Here are your login credentials:</p>

  <div style="background:#f7f5f0;border:1px solid #e2d9c8;border-radius:8px;padding:16px;margin:16px 0;">
    <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${escapeHtml(member.email)}</p>
    <p style="margin:0 0 8px 0;"><strong>Temporary Password:</strong> <code style="background:#fff;padding:3px 8px;border-radius:4px;font-size:15px;letter-spacing:0.5px;">${escapeHtml(tempPassword)}</code></p>
    <p style="margin:0;"><strong>Role:</strong> ${escapeHtml(member.title)}</p>
  </div>

  <p style="margin:0 0 12px 0;color:#c53030;font-weight:600;">Please change your password after your first login.</p>

  <p style="margin:0 0 12px 0;">You can change your password by clicking "Forgot Password" on the login page, which will send you a password reset link.</p>

  <p style="margin:20px 0 0 0;">
    <a href="${escapeHtml(loginUrl)}" style="background:#11294a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;display:inline-block;font-weight:600;">
      Sign In to the Portal
    </a>
  </p>

  <p style="font-size:12px;color:#888;margin:20px 0 0 0;">
    If this email landed in your spam folder, please mark it as "not spam" so future messages arrive in your inbox.
  </p>
</div>
</body>
</html>`;

  const text = [
    'Welcome to the DSDC Portal!',
    '',
    `Hi ${member.displayName},`,
    '',
    `Your ${roleLabel} account has been created.`,
    '',
    `Email: ${member.email}`,
    `Temporary Password: ${tempPassword}`,
    `Role: ${member.title}`,
    '',
    'Please change your password after your first login.',
    'You can do this by clicking "Forgot Password" on the login page.',
    '',
    `Sign in: ${loginUrl}`,
  ].join('\n');

  return { subject, html, text };
}

// Main

async function createStaffMember(member: StaffMember): Promise<{ password: string; skipped: boolean }> {
  const tempPassword = generatePassword();

  // Check if user already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id,email,role')
    .eq('email', member.email)
    .maybeSingle();

  if (existingProfile) {
    console.log(`  SKIP Already exists (${existingProfile.role}) - skipping creation`);
    return { password: tempPassword, skipped: true };
  }

  if (dryRun) {
    console.log(`  DRY RUN - would create with password: ${tempPassword}`);
    return { password: tempPassword, skipped: false };
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: member.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      role: member.role,
      display_name: member.displayName,
      locale: 'en',
      timezone: 'America/Vancouver',
    },
  });

  if (authError) {
    throw new Error(`Auth creation failed: ${authError.message}`);
  }

  const userId = authData.user?.id;
  if (!userId) throw new Error('No user ID returned.');

  // Create profile
  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email: member.email,
      role: member.role,
      display_name: member.displayName,
      timezone: 'America/Vancouver',
      locale: 'en',
    },
    { onConflict: 'id' }
  );

  if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`);

  // Coach-specific setup
  if (member.role === 'coach' && member.tiers?.length) {
    const { error: coachError } = await supabase.from('coach_profiles').upsert(
      {
        coach_id: userId,
        tier: member.tiers[0],
        is_ta: false,
      },
      { onConflict: 'coach_id' }
    );
    if (coachError) console.warn(`  WARN coach_profiles: ${coachError.message}`);

    // Clear existing tier assignments
    await supabase.from('coach_tier_assignments').delete().eq('coach_id', userId);

    // Insert tier assignments
    const tierRows = member.tiers.map((tier) => ({ coach_id: userId, tier }));
    const { error: tierError } = await supabase.from('coach_tier_assignments').insert(tierRows);
    if (tierError) console.warn(`  WARN coach_tier_assignments: ${tierError.message}`);
  }

  return { password: tempPassword, skipped: false };
}

async function sendCredentialEmail(member: StaffMember, tempPassword: string) {
  if (skipEmail || dryRun) {
    console.log(`  EMAIL ${dryRun ? 'DRY RUN' : 'SKIP'} - would email ${member.email}`);
    return;
  }

  if (!resend) {
    console.warn('  WARN No RESEND_API_KEY - cannot send email');
    return;
  }

  const { subject, html, text } = buildEmail(member, tempPassword);

  await resend.emails.send({
    from: FROM_EMAIL,
    to: member.email,
    subject,
    html,
    text,
  });

  console.log(`  EMAIL sent to ${member.email}`);
}

async function main() {
  console.log('');
  console.log('==============================================');
  console.log('  DSDC Staff Account Provisioning');
  if (dryRun) console.log('  DRY RUN MODE - no changes will be made');
  if (skipEmail) console.log('  Email sending disabled');
  console.log('==============================================');
  console.log('');

  const results: { name: string; email: string; role: string; password: string; skipped: boolean }[] = [];

  for (const member of STAFF) {
    console.log(`USER ${member.displayName} (${member.email}) - ${member.role}`);

    try {
      const { password, skipped } = await createStaffMember(member);
      results.push({
        name: member.displayName,
        email: member.email,
        role: member.role,
        password,
        skipped,
      });

      if (!skipped) {
        await sendCredentialEmail(member, password);
      }

      console.log('  OK Done');
    } catch (error) {
      console.error('  FAIL:', error instanceof Error ? error.message : error);
      results.push({
        name: member.displayName,
        email: member.email,
        role: member.role,
        password: 'FAILED',
        skipped: false,
      });
    }

    console.log('');
  }

  // Summary
  console.log('==============================================');
  console.log('  Summary');
  console.log('==============================================');
  console.log('');

  for (const result of results) {
    const status = result.password === 'FAILED' ? 'FAILED' : result.skipped ? 'SKIPPED' : 'CREATED';
    console.log(`  ${status}  ${result.name} <${result.email}> [${result.role}]`);
    if (!result.skipped && result.password !== 'FAILED') {
      console.log(`           Password: ${result.password}`);
    }
  }

  console.log('');
  console.log('Save these passwords securely. They are NOT stored anywhere else.');
  console.log('');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
