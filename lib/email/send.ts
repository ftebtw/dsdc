import 'server-only';
import { getPortalFromEmail, getResendClient } from '@/lib/email/resend';

type SendInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

export async function sendPortalEmail(input: SendInput): Promise<{ ok: boolean; error?: string }> {
  const client = getResendClient();
  const from = getPortalFromEmail();
  if (!client || !from) {
    console.warn('[email] skipped - resend not configured', { to: input.to, subject: input.subject });
    return { ok: false, error: 'Email provider not configured' };
  }

  try {
    await client.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return { ok: true };
  } catch (error) {
    console.error('[email] send failed', {
      to: input.to,
      subject: input.subject,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown email error',
    };
  }
}

export async function sendPortalEmails(inputs: SendInput[]): Promise<void> {
  if (inputs.length === 0) return;
  const results = await Promise.allSettled(inputs.map((input) => sendPortalEmail(input)));
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('[email] batch send rejected', result.reason);
    }
  }
}
