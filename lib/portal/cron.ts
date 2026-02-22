import type { NextRequest } from 'next/server';
import { getISOWeek } from 'date-fns';

export function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const authHeader = request.headers.get('authorization') || '';
  return authHeader === `Bearer ${secret}`;
}

export function getNotificationWeekReference(now = new Date()): string {
  const year = now.getUTCFullYear();
  const week = getISOWeek(now);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function parseCsvEmails(value: string | undefined | null): string[] {
  if (!value) return [];
  return [...new Set(value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item)))];
}

export async function notificationAlreadySent(input: {
  admin: any;
  recipientId: string;
  notificationType: string;
  referenceId: string;
}): Promise<boolean> {
  const { data, error } = await input.admin
    .from('notification_log')
    .select('id')
    .eq('recipient_id', input.recipientId)
    .eq('notification_type', input.notificationType)
    .eq('reference_id', input.referenceId)
    .maybeSingle();

  if (error) {
    console.error('[cron] notification log lookup failed', {
      recipientId: input.recipientId,
      notificationType: input.notificationType,
      referenceId: input.referenceId,
      error: error.message,
    });
    return false;
  }

  return Boolean(data?.id);
}

export async function recordNotificationSent(input: {
  admin: any;
  recipientId: string;
  notificationType: string;
  referenceId: string;
}): Promise<void> {
  const { error } = await input.admin.from('notification_log').insert({
    recipient_id: input.recipientId,
    notification_type: input.notificationType,
    reference_id: input.referenceId,
  });

  if (error && error.code !== '23505') {
    console.error('[cron] notification log insert failed', {
      recipientId: input.recipientId,
      notificationType: input.notificationType,
      referenceId: input.referenceId,
      error: error.message,
    });
  }
}
