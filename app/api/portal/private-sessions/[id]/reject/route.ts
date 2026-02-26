import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { privateCoachRejectedTemplate } from '@/lib/email/templates';
import {
  loadPrivateSessionParticipants,
  nameOrEmail,
  sendToStudentAndParents,
  type PrivateSessionWorkflowRow,
} from '@/lib/portal/private-sessions';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const bodySchema = z.object({
  coachNotes: z.string().max(2000).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);
  const { id } = await params;

  let bodyRaw: unknown = {};
  try {
    bodyRaw = await request.json();
  } catch {
    bodyRaw = {};
  }

  const parsed = bodySchema.safeParse(bodyRaw);
  if (!parsed.success) return jsonError('Invalid payload.');

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const admin = getSupabaseAdminClient();

  const { data: currentRow, error: currentRowError } = await supabase
    .from('private_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (currentRowError) return mergeCookies(supabaseResponse, jsonError(currentRowError.message, 400));
  if (!currentRow) return mergeCookies(supabaseResponse, jsonError('Private session not found.', 404));

  const row = currentRow as PrivateSessionWorkflowRow;
  const isAdmin = session.profile.role === 'admin';
  const isCoachOwner = row.coach_id === session.userId;
  if (!isAdmin && !isCoachOwner) {
    return mergeCookies(supabaseResponse, jsonError('Not allowed to reject this session.', 403));
  }

  if (!['pending', 'coach_accepted', 'rescheduled_by_student', 'rescheduled_by_coach'].includes(row.status)) {
    return mergeCookies(supabaseResponse, jsonError('Session cannot be rejected in current status.', 400));
  }

  const { data: updatedData, error: updateError } = await supabase
    .from('private_sessions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: session.userId,
      coach_notes: parsed.data.coachNotes?.trim() || null,
    })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));
  if (!updatedData) return mergeCookies(supabaseResponse, jsonError('Unable to update session.', 409));

  const updatedRow = updatedData as PrivateSessionWorkflowRow;
  const participants = await loadPrivateSessionParticipants(admin, updatedRow);
  const coachName = nameOrEmail(participants.coach, 'Coach');
  const studentName = nameOrEmail(participants.student, 'Student');

  await sendToStudentAndParents({
    participants,
    row: updatedRow,
    includePreferenceCheck: true,
    pathByRole: {
      student: '/portal/student/booking',
      parent: '/portal/parent/private-sessions',
    },
    buildTemplate: ({ locale, portalUrl, preferenceUrl }) =>
      privateCoachRejectedTemplate({
        coachName,
        studentName,
        reason: parsed.data.coachNotes || null,
        portalUrl,
        preferenceUrl,
        locale,
      }),
  });

  return mergeCookies(supabaseResponse, NextResponse.json({ session: updatedRow }));
}
