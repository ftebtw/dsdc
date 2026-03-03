import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
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

function cleanFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
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

  const contentType = request.headers.get('content-type') || '';
  let parsed: z.SafeParseReturnType<
    unknown,
    { description: string; page?: string | undefined; userAgent?: string | undefined }
  >;
  let screenshot: File | null = null;

  if (contentType.includes('application/json')) {
    parsed = bodySchema.safeParse(await request.json());
  } else {
    const formData = await request.formData();
    parsed = bodySchema.safeParse({
      description: formData.get('description'),
      page: formData.get('page') || undefined,
      userAgent: formData.get('userAgent') || undefined,
    });
    const fileValue = formData.get('screenshot');
    screenshot = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  }

  if (!parsed.success) return jsonError('Invalid report.');

  try {
    const admin = getSupabaseAdminClient();
    const report = parsed.data;
    let screenshotUrl: string | null = null;
    let screenshotWarning: string | null = null;

    if (screenshot) {
      if (!screenshot.type.startsWith('image/')) {
        return jsonError('Screenshot must be an image.', 400);
      }
      if (screenshot.size > 4 * 1024 * 1024) {
        return jsonError('Screenshot must be 4MB or smaller.', 400);
      }

      const bucket = process.env.PORTAL_BUCKET_RESOURCES || 'portal-resources';
      const safeName = cleanFilename(screenshot.name || 'screenshot.png');
      const objectPath = `bug-reports/${session.userId}/${Date.now()}-${randomUUID()}/${safeName}`;
      const fileBuffer = await screenshot.arrayBuffer();

      const uploadResult = await admin.storage
        .from(bucket)
        .upload(objectPath, fileBuffer, {
          contentType: screenshot.type || undefined,
          upsert: false,
        });

      if (uploadResult.error) {
        screenshotWarning = `Screenshot upload failed: ${uploadResult.error.message}`;
      } else {
        const signedResult = await admin.storage
          .from(bucket)
          .createSignedUrl(objectPath, 60 * 60 * 24 * 30);
        if (signedResult.error) {
          screenshotWarning = `Screenshot link failed: ${signedResult.error.message}`;
        } else {
          screenshotUrl = signedResult.data?.signedUrl || null;
        }
      }
    }

    const { data: adminProfiles } = await admin
      .from('profiles')
      .select('email')
      .eq('role', 'admin');

    const adminEmails = (adminProfiles ?? [])
      .map((row: { email?: string | null }) => row.email?.trim())
      .filter(Boolean) as string[];

    if (adminEmails.length > 0) {
      const reporterName = session.profile.display_name || session.profile.email || 'Unknown';
      const when = new Date().toISOString();
      const subject = `[DSDC Bug Report] from ${reporterName}`;
      const text = [
        `Bug Report from: ${reporterName} (${session.profile.email})`,
        `Role: ${session.profile.role}`,
        `Page: ${report.page || 'Not specified'}`,
        `Browser: ${report.userAgent || 'Unknown'}`,
        `Screenshot: ${screenshotUrl || 'Not provided'}`,
        `Screenshot warning: ${screenshotWarning || 'None'}`,
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
            <tr><td style="padding:6px 12px;font-weight:bold;color:#555;">Screenshot</td><td style="padding:6px 12px;">${
              screenshotUrl
                ? `<a href="${escapeHtml(screenshotUrl)}" target="_blank" rel="noopener noreferrer">Open screenshot</a>`
                : 'Not provided'
            }</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;color:#555;">Screenshot status</td><td style="padding:6px 12px;">${
              screenshotWarning ? escapeHtml(screenshotWarning) : 'Attached successfully or not provided'
            }</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;color:#555;">Time</td><td style="padding:6px 12px;">${escapeHtml(
              when
            )}</td></tr>
          </table>
          <div style="margin-top:16px;padding:12px;background:#f5f5f5;border-radius:8px;">
            <p style="margin:0;white-space:pre-wrap;">${escapeHtml(report.description)}</p>
          </div>
        </div>
      `;

      const sendResults = await Promise.all(
        adminEmails.map((adminEmail) => sendPortalEmail({ to: adminEmail, subject, html, text }))
      );
      const successCount = sendResults.filter((result) => result.ok).length;
      if (successCount === 0) {
        return jsonError('Could not send bug report email. Please try again.', 502);
      }
    }
    return NextResponse.json({ ok: true, warning: screenshotWarning });
  } catch (error) {
    console.error('[bug-report] failed to send admin notification', error);
    return jsonError('Could not submit bug report. Please try again.', 500);
  }
}
