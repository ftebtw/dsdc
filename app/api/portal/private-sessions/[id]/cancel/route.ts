import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { privateCancelledTemplate } from '@/lib/email/templates';
import {
  loadPrivateSessionParticipants,
  sendToCoach,
  sendToStudentAndParents,
  type PrivateSessionWorkflowRow,
} from '@/lib/portal/private-sessions';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const bodySchema = z.object({
  reason: z.string().max(2000).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta', 'student']);
  if (!session) return jsonError('Unauthorized', 401);

  const { id } = await params;
  let bodyRaw: unknown = {};
  try {
    bodyRaw = await request.json();
  } catch (err) {
    console.error("[private-session-cancel] invalid request body", err);
    bodyRaw = {};
  }
  const parsed = bodySchema.safeParse(bodyRaw);
  if (!parsed.success) return jsonError('Invalid payload.');

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const admin = getSupabaseAdminClient();

  const { data: rowData, error: rowError } = await supabase
    .from('private_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (rowError) return mergeCookies(supabaseResponse, jsonError(rowError.message, 400));
  if (!rowData) return mergeCookies(supabaseResponse, jsonError('Private session not found.', 404));

  const row = rowData as PrivateSessionWorkflowRow;
  if (row.status === 'cancelled') {
    return mergeCookies(supabaseResponse, NextResponse.json({ session: row }));
  }
  if (row.status === 'completed') {
    return mergeCookies(supabaseResponse, jsonError('Completed sessions cannot be cancelled.', 400));
  }

  const isAdmin = session.profile.role === 'admin';
  const isCoachOwner = row.coach_id === session.userId;
  const isStudentOwner = row.student_id === session.userId;

  if (!isAdmin && !isCoachOwner && !isStudentOwner) {
    return mergeCookies(supabaseResponse, jsonError('Not allowed to cancel this session.', 403));
  }

  const studentAllowed = ['pending', 'rescheduled_by_coach', 'rescheduled_by_student', 'awaiting_payment'];
  const coachAllowed = ['pending', 'coach_accepted', 'rescheduled_by_coach', 'rescheduled_by_student'];

  if (isStudentOwner && !studentAllowed.includes(row.status)) {
    return mergeCookies(supabaseResponse, jsonError('Students cannot cancel sessions in this status.', 403));
  }
  if (isCoachOwner && !coachAllowed.includes(row.status)) {
    return mergeCookies(supabaseResponse, jsonError('Coaches cannot cancel sessions in this status.', 403));
  }
  if (!isAdmin && !isCoachOwner && !isStudentOwner) {
    return mergeCookies(supabaseResponse, jsonError('Not allowed to cancel this session.', 403));
  }

  const { data: updatedData, error: updateError } = await supabase
    .from('private_sessions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: session.userId,
      coach_notes:
        session.profile.role === 'coach' || session.profile.role === 'ta' || session.profile.role === 'admin'
          ? parsed.data.reason?.trim() || row.coach_notes || null
          : row.coach_notes,
      student_notes:
        session.profile.role === 'student'
          ? parsed.data.reason?.trim() || row.student_notes || null
          : row.student_notes,
    })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 400));
  if (!updatedData) return mergeCookies(supabaseResponse, jsonError('Unable to update session.', 409));

  const updatedRow = updatedData as PrivateSessionWorkflowRow;
  const participants = await loadPrivateSessionParticipants(admin, updatedRow);
  const cancelledBy = session.profile.display_name || session.profile.email || session.userId;
  const reason = parsed.data.reason?.trim() || null;

  await sendToStudentAndParents({
    participants,
    row: updatedRow,
    includePreferenceCheck: true,
    pathByRole: {
      student: '/portal/student/booking',
      parent: '/portal/parent/private-sessions',
    },
    buildTemplate: ({ whenText, portalUrl, preferenceUrl }) =>
      privateCancelledTemplate({
        whenText,
        cancelledBy,
        reason,
        portalUrl,
        preferenceUrl,
      }),
  });

  await sendToCoach({
    participants,
    row: updatedRow,
    includePreferenceCheck: true,
    pathByRole: {
      coach: '/portal/coach/private-sessions',
      ta: '/portal/coach/private-sessions',
    },
    buildTemplate: ({ whenText, portalUrl, preferenceUrl }) =>
      privateCancelledTemplate({
        whenText,
        cancelledBy,
        reason,
        portalUrl,
        preferenceUrl,
      }),
  });

  return mergeCookies(supabaseResponse, NextResponse.json({ session: updatedRow }));
}
