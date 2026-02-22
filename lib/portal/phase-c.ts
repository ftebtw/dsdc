import 'server-only';
import { getPortalAppUrl } from '@/lib/email/resend';
import { formatSessionRangeForViewer } from '@/lib/portal/time';

export function isValidEmail(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function uniqueEmails(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter(isValidEmail).map((item) => item.trim().toLowerCase()))];
}

export function profilePreferenceUrl(role: string | null | undefined): string {
  const base = getPortalAppUrl();
  if (role === 'parent') return `${base}/portal/parent/preferences`;
  return `${base}/portal/preferences`;
}

export function portalPathUrl(path: string): string {
  const base = getPortalAppUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function sessionRangeForRecipient(input: {
  sessionDate: string;
  startTime: string;
  endTime: string;
  sourceTimezone: string;
  recipientTimezone: string | null | undefined;
}): string {
  const timezone = input.recipientTimezone || 'America/Vancouver';
  return formatSessionRangeForViewer(
    input.sessionDate,
    input.startTime,
    input.endTime,
    input.sourceTimezone,
    timezone
  );
}
