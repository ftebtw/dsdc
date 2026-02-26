import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
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
  const metadata: Record<string, string> = {
    role: body.role,
    display_name: body.display_name,
    locale: body.locale,
    timezone: body.timezone,
  };
  if (body.phone) metadata.phone = body.phone;

  let userId: string | undefined;

  if (body.send_invite) {
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(body.email, {
      data: metadata,
    });
    if (error) return jsonError(error.message, 400);
    userId = data.user?.id;
  } else {
    const defaultPassword = process.env.PORTAL_DEFAULT_STUDENT_PASSWORD || 'ChangeMe123!Temp';
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

  return NextResponse.json({
    message: body.send_invite
      ? 'User invited successfully.'
      : 'User created successfully.',
    userId,
  });
}
