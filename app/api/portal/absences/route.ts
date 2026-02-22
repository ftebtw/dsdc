import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient } from '@/lib/supabase/route';

const bodySchema = z.object({
  classId: z.string().uuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(1000).optional(),
  studentId: z.string().uuid().optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid payload.');

  const today = new Date().toISOString().slice(0, 10);
  if (parsed.data.sessionDate < today) {
    return jsonError('Absence date must be upcoming.');
  }

  const response = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, response);
  const targetStudentId =
    session.profile.role === 'student' ? session.userId : parsed.data.studentId || null;

  if (!targetStudentId) return jsonError('Student is required.', 400);

  const { data, error } = await supabase
    .from('student_absences')
    .insert({
      class_id: parsed.data.classId,
      student_id: targetStudentId,
      session_date: parsed.data.sessionDate,
      reason: parsed.data.reason || null,
      reported_by: session.userId,
    })
    .select('*')
    .single();

  if (error) return jsonError(error.message, 400);
  return NextResponse.json({ absence: data });
}
