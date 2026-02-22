import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { sendPortalEmails } from '@/lib/email/send';
import { manualEnrollmentNotice } from '@/lib/email/templates';
import { shouldSendNotification } from '@/lib/portal/notifications';
import { portalPathUrl, profilePreferenceUrl } from '@/lib/portal/phase-c';
import { isValidTimezone } from '@/lib/portal/timezone';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';

const bodySchema = z
  .object({
    classIds: z.array(z.string().uuid()).min(1).max(20).optional(),
    classId: z.string().uuid().optional(),
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
  })
  .refine((value) => Boolean(value.classIds?.length || value.classId), {
    message: 'Provide classIds or classId.',
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
  const classIds = body.classIds ?? (body.classId ? [body.classId] : []);
  let studentId = body.studentId;
  let createdStudent = false;

  if (!studentId && body.newStudent) {
    if (!isValidTimezone(body.newStudent.timezone)) {
      return jsonError('Invalid timezone.');
    }

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

  const enrollments: Database['public']['Tables']['enrollments']['Row'][] = [];
  const errors: Array<{ classId: string; error: string }> = [];

  for (const classId of classIds) {
    const enrollmentPayload: Database['public']['Tables']['enrollments']['Insert'] = {
      class_id: classId,
      student_id: studentId,
      status: 'active',
    };

    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .upsert(enrollmentPayload, { onConflict: 'student_id,class_id' })
      .select('*')
      .single();

    if (enrollmentError) {
      errors.push({ classId, error: enrollmentError.message });
      continue;
    }

    if (enrollment) {
      enrollments.push(enrollment);
    }
  }

  if (enrollments.length === 0) {
    return jsonError(errors[0]?.error || 'Enrollment failed.', 400);
  }

  try {
    const enrolledClassIds = [...new Set(enrollments.map((row) => row.class_id))];

    const [{ data: classRows }, { data: studentProfile }, { data: parentLinks }] = await Promise.all([
      supabaseAdmin
        .from('classes')
        .select('id,name,term_id')
        .in('id', enrolledClassIds),
      supabaseAdmin
        .from('profiles')
        .select('id,email,display_name,role,notification_preferences')
        .eq('id', studentId)
        .maybeSingle(),
      supabaseAdmin.from('parent_student_links').select('parent_id').eq('student_id', studentId),
    ]);

    const classList =
      (classRows ?? []) as Array<Pick<Database['public']['Tables']['classes']['Row'], 'id' | 'name' | 'term_id'>>;
    const termIds = [...new Set(classList.map((row) => row.term_id).filter(Boolean))] as string[];
    const termRows = termIds.length
      ? (
          (
            await supabaseAdmin
              .from('terms')
              .select('id,name')
              .in('id', termIds)
          ).data ?? []
        )
      : [];
    const termMap = Object.fromEntries(
      (termRows as Array<{ id: string; name: string }>).map((row) => [row.id, row.name])
    ) as Record<string, string>;

    const parentIds = [
      ...new Set(
        ((parentLinks ?? []) as Array<{ parent_id: string | null }>)
          .map((link) => link.parent_id)
          .filter((value): value is string => Boolean(value))
      ),
    ];
    const parentProfiles = parentIds.length
      ? (
          (
            await supabaseAdmin
              .from('profiles')
              .select('id,email,display_name,role,notification_preferences')
              .in('id', parentIds)
              .eq('role', 'parent')
          ).data ?? []
        )
      : [];

    const studentName = studentProfile?.display_name || studentProfile?.email || 'Student';
    const messages: Array<{ to: string; subject: string; html: string; text: string }> = [];

    if (
      studentProfile?.email &&
      shouldSendNotification(
        studentProfile.notification_preferences as Record<string, unknown> | null,
        'general_updates',
        true
      )
    ) {
      for (const classRow of classList) {
        messages.push({
          to: studentProfile.email,
          ...manualEnrollmentNotice({
            studentName,
            className: classRow.name || 'Class',
            termName: termMap[classRow.term_id] || 'Current Term',
            portalUrl: portalPathUrl('/portal/student/classes'),
            preferenceUrl: profilePreferenceUrl(studentProfile.role),
          }),
        });
      }
    }

    for (const parent of parentProfiles) {
      if (!parent?.email) continue;
      if (!shouldSendNotification(parent.notification_preferences as Record<string, unknown> | null, 'general_updates', true)) {
        continue;
      }
      for (const classRow of classList) {
        messages.push({
          to: parent.email,
          ...manualEnrollmentNotice({
            studentName,
            className: classRow.name || 'Class',
            termName: termMap[classRow.term_id] || 'Current Term',
            portalUrl: portalPathUrl('/portal/parent/classes'),
            preferenceUrl: profilePreferenceUrl(parent.role),
          }),
        });
      }
    }

    if (messages.length) {
      await sendPortalEmails(messages);
    }
  } catch (emailError) {
    console.error('[manual-enroll] notification send failed', {
      error: emailError instanceof Error ? emailError.message : String(emailError),
      classIds,
      studentId,
    });
  }

  return NextResponse.json({
    enrollment: enrollments[0] || null,
    enrollments,
    errors,
    createdStudent,
    studentId,
  });
}
