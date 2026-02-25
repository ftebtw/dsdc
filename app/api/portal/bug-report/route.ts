import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/portal/auth';
import { sendPortalEmail } from '@/lib/email/send';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const bodySchema = z.object({
  description: z.string().min(1).max(2000),
  page: z.string().max(500).optional(),
  userAgent: z.string().max(500).optional(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['admin', 'coach', 'ta', 'student', 'parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError('Invalid report.');

  try {
    const admin = getSupabaseAdminClient();
    const { data: adminProfiles } = await admin
      .from('profiles')
      .select('email')
      .eq('role', 'admin');

    const adminEmails = (adminProfiles ?? [])
      .map((row: { email?: string | null }) => row.email?.trim())
      .filter(Boolean) as string[];

    if (adminEmails.length > 0) {
      const report = parsed.data;
      const reporterName = session.profile.display_name || session.profile.email || 'Unknown';
      const when = new Date().toISOString();
      const subject = `[DSDC Bug Report] from ${reporterName}`;
      const text = [
        `Bug Report from: ${reporterName} (${session.profile.email})`,
        `Role: ${session.profile.role}`,
        `Page: ${report.page || 'Not specified'}`,
        `Browser: ${report.userAgent || 'Unknown'}`,
        `Time: ${when}`,
        '',
        'Description:',
        report.description,
      ].join('\n');

      const html = `
        <div style="font-family:sans-serif;max-width:600px;">
          <h2 style="color:#11294A;">Bug Report</h2>
          <table style="border-collapse:collapse;width:100%;font-size:14px;">
            <tr><td style="padding:6px 12px;font-weight:bold;color:#555;">From</td><td style="padding:6px 12px;">${escapeHtml(
              reporterName
            )} (${escapeHtml(session.profile.email)})</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;color:#555;">Role</td><td style="padding:6px 12px;">${escapeHtml(
              session.profile.role
            )}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;color:#555;">Page</td><td style="padding:6px 12px;">${escapeHtml(
              report.page || 'Not specified'
            )}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;color:#555;">Time</td><td style="padding:6px 12px;">${escapeHtml(
              when
            )}</td></tr>
          </table>
          <div style="margin-top:16px;padding:12px;background:#f5f5f5;border-radius:8px;">
            <p style="margin:0;white-space:pre-wrap;">${escapeHtml(report.description)}</p>
          </div>
        </div>
      `;

      await Promise.all(
        adminEmails.map((adminEmail) => sendPortalEmail({ to: adminEmail, subject, html, text }))
      );
    }
  } catch (error) {
    console.error('[bug-report] failed to send admin notification', error);
  }

  return NextResponse.json({ ok: true });
}
