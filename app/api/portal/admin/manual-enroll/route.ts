import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';

const bodySchema = z
  .object({
    classId: z.string().uuid(),
    studentId: z.string().uuid().optional(),
    newStudent: z
      .object({
        email: z.string().email(),
        display_name: z.string().min(1).max(120),
        locale: z.enum(['en', 'zh']).default('en'),
        phone: z.string().max(40).optional().or(z.literal('')),
        timezone: z.string().min(1).max(80).default('America/Vancouver'),
      })
      .optional(),
  })
  .refine((value) => Boolean(value.studentId || value.newStudent), {
    message: 'Provide either studentId or newStudent.',
  });

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['admin']);
  if (!session) return jsonError('Unauthorized', 401);

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return jsonError('Invalid request body.');
  }

  const supabaseAdmin = getSupabaseAdminClient();
  let studentId = body.studentId;
  let createdStudent = false;

  if (!studentId && body.newStudent) {
    const defaultPassword = process.env.PORTAL_DEFAULT_STUDENT_PASSWORD || 'ChangeMe123!Temp';
    const meta = {
      role: 'student',
      display_name: body.newStudent.display_name,
      locale: body.newStudent.locale,
      timezone: body.newStudent.timezone,
      phone: body.newStudent.phone || undefined,
    };

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.newStudent.email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: meta,
    });

    if (authError) return jsonError(authError.message, 400);
    studentId = authData.user?.id;
    if (!studentId) return jsonError('Failed to create student account.', 500);

    const profilePayload: Database['public']['Tables']['profiles']['Insert'] = {
      id: studentId,
      email: body.newStudent.email,
      role: 'student',
      display_name: body.newStudent.display_name,
      phone: body.newStudent.phone || null,
      timezone: body.newStudent.timezone,
      locale: body.newStudent.locale,
    };
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });
    if (profileError) return jsonError(profileError.message, 500);
    createdStudent = true;
  }

  if (!studentId) return jsonError('Missing student.');

  const enrollmentPayload: Database['public']['Tables']['enrollments']['Insert'] = {
    class_id: body.classId,
    student_id: studentId,
    status: 'active',
  };

  const { data: enrollment, error: enrollmentError } = await supabaseAdmin
    .from('enrollments')
    .upsert(enrollmentPayload, { onConflict: 'student_id,class_id' })
    .select('*')
    .single();

  if (enrollmentError) return jsonError(enrollmentError.message, 400);

  return NextResponse.json({
    enrollment,
    createdStudent,
    studentId,
  });
}
