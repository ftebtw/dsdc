import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendPortalEmails } from '@/lib/email/send';
import { payrollSubmissionToAdminTemplate } from '@/lib/email/templates';
import { requireApiRole } from '@/lib/portal/auth';
import { parseYearMonthKey } from '@/lib/portal/payroll-submissions';
import { portalPathUrl } from '@/lib/portal/phase-c';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const adjustmentSchema = z.object({
  hoursDelta: z
    .number()
    .refine((value) => Number.isFinite(value), 'Adjustment must be a number.')
    .refine((value) => value !== 0, 'Adjustment cannot be zero.')
    .refine((value) => Math.abs(value) <= 200, 'Adjustment out of range.'),
  reason: z.string().trim().min(3).max(500),
});

const submitSchema = z.object({
  action: z.literal('submit'),
  adjustments: z.array(adjustmentSchema).max(20).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Coach approves or submits their own draft. Approve = submit with no
// adjustments; adjust = submit with the attached lines. Both flip status
// to 'submitted' atomically and email admin(s) the final numbers.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole(request, ['coach', 'ta']);
  if (!session) return jsonError('Unauthorized', 401);

  const { id } = await params;
  const parsed = submitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Invalid payload.');

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const admin = getSupabaseAdminClient();

  const { data: submission, error: fetchError } = await (supabase as any)
    .from('payroll_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (fetchError) return mergeCookies(supabaseResponse, jsonError(fetchError.message, 500));
  if (!submission) return mergeCookies(supabaseResponse, jsonError('Submission not found.', 404));
  if (submission.coach_id !== session.userId) {
    return mergeCookies(supabaseResponse, jsonError('This is not your submission.', 403));
  }
  if (submission.status !== 'draft') {
    return mergeCookies(supabaseResponse, jsonError('This submission is already submitted.', 400));
  }

  // Wipe existing adjustments and re-insert the current set — treating the
  // request payload as the source of truth is simpler than diffing.
  const { error: deleteError } = await (supabase as any)
    .from('payroll_submission_adjustments')
    .delete()
    .eq('submission_id', id);
  if (deleteError) return mergeCookies(supabaseResponse, jsonError(deleteError.message, 500));

  const adjustments = parsed.data.adjustments ?? [];
  let adjustmentHoursTotal = 0;
  if (adjustments.length > 0) {
    const rows = adjustments.map((entry) => {
      adjustmentHoursTotal += entry.hoursDelta;
      return {
        submission_id: id,
        hours_delta: entry.hoursDelta,
        reason: entry.reason,
      };
    });
    const { error: insertError } = await (supabase as any)
      .from('payroll_submission_adjustments')
      .insert(rows);
    if (insertError) return mergeCookies(supabaseResponse, jsonError(insertError.message, 500));
  }

  const finalHours = Number(submission.computed_hours) + adjustmentHoursTotal;

  const { data: updated, error: updateError } = await (supabase as any)
    .from('payroll_submissions')
    .update({
      status: 'submitted',
      adjustment_hours_total: adjustmentHoursTotal,
      final_hours: finalHours,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (updateError) return mergeCookies(supabaseResponse, jsonError(updateError.message, 500));

  // Fire-and-forget admin email.
  try {
    const yearMonth = parseYearMonthKey(submission.year_month);
    const monthLabel = yearMonth ? yearMonth.label : submission.year_month;
    const [{ data: coach }, { data: admins }] = await Promise.all([
      admin.from('profiles').select('display_name,email').eq('id', submission.coach_id).maybeSingle(),
      admin.from('profiles').select('email,display_name').eq('role', 'admin'),
    ]);
    const adminRecipients = ((admins ?? []) as Array<{ email: string | null; display_name: string | null }>)
      .filter((row) => row.email);
    if (adminRecipients.length > 0) {
      const template = payrollSubmissionToAdminTemplate({
        coachName: coach?.display_name || coach?.email || 'Coach',
        monthLabel,
        computedHours: Number(submission.computed_hours),
        adjustmentHours: adjustmentHoursTotal,
        finalHours,
        adjustments: adjustments.map((entry) => ({
          hoursDelta: entry.hoursDelta,
          reason: entry.reason,
        })),
        portalUrl: portalPathUrl('/portal/admin/payroll'),
      });
      await sendPortalEmails(
        adminRecipients.map((row) => ({ to: row.email!, ...template }))
      );
    }
  } catch (error) {
    console.error('[payroll-submissions] admin notify failed', error);
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ submission: updated }));
}
