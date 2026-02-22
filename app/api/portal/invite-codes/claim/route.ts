import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { sendPortalEmails } from '@/lib/email/send';
import { parentLinkedNotice } from '@/lib/email/templates';
import { shouldSendNotification } from '@/lib/portal/notifications';
import { portalPathUrl } from '@/lib/portal/phase-c';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const bodySchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z2-9]{6}$/, 'Invalid code format.'),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['student']);
  if (!session) return jsonError('Unauthorized', 401);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid code.', 400);
  }

  const admin = getSupabaseAdminClient();
  const code = parsed.data.code;
  const nowIso = new Date().toISOString();

  const { data: claimedInvite, error: claimError } = await admin
    .from('invite_codes')
    .update({
      claimed_by: session.userId,
      claimed_at: nowIso,
    })
    .eq('code', code)
    .is('claimed_by', null)
    .gt('expires_at', nowIso)
    .select('id,parent_id,code,expires_at')
    .maybeSingle();

  if (claimError) return jsonError(claimError.message, 400);
  if (!claimedInvite) {
    const { data: existingInvite, error: lookupError } = await admin
      .from('invite_codes')
      .select('id,claimed_by,expires_at')
      .eq('code', code)
      .maybeSingle();

    if (lookupError) return jsonError(lookupError.message, 400);
    if (!existingInvite) return jsonError('Invite code not found.', 404);
    if (existingInvite.claimed_by) return jsonError('This invite code was already claimed.', 409);
    if (existingInvite.expires_at <= nowIso) return jsonError('This invite code has expired.', 410);
    return jsonError('This invite code could not be claimed.', 409);
  }

  const { error: linkError } = await admin
    .from('parent_student_links')
    .upsert(
      {
        parent_id: claimedInvite.parent_id,
        student_id: session.userId,
      },
      { onConflict: 'parent_id,student_id' }
    );

  if (linkError) return jsonError(linkError.message, 400);

  const [parentProfileResult, studentProfileResult] = await Promise.all([
    admin
      .from('profiles')
      .select('id,email,display_name,notification_preferences')
      .eq('id', claimedInvite.parent_id)
      .maybeSingle(),
    admin
      .from('profiles')
      .select('id,email,display_name')
      .eq('id', session.userId)
      .maybeSingle(),
  ]);

  const parentProfile = parentProfileResult.data;
  const studentProfile = studentProfileResult.data;

  if (
    parentProfile?.email &&
    shouldSendNotification(parentProfile.notification_preferences as Record<string, unknown> | null, 'general_updates', true)
  ) {
    await sendPortalEmails([
      {
        to: parentProfile.email,
        ...parentLinkedNotice({
          studentName: studentProfile?.display_name || studentProfile?.email || 'Student',
          portalUrl: portalPathUrl('/portal/parent/dashboard'),
        }),
      },
    ]);
  }

  return NextResponse.json({
    success: true,
    parentName: parentProfile?.display_name || parentProfile?.email || 'Parent',
  });
}
