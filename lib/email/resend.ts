import 'server-only';
import { Resend } from 'resend';

let client: Resend | null = null;

export function getResendClient(): Resend | null {
  if (client) return client;

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;

  client = new Resend(apiKey);
  return client;
}

export function getPortalFromEmail(): string | null {
  return process.env.PORTAL_FROM_EMAIL?.trim() || null;
}

export function getPortalAppUrl(): string {
  return process.env.PORTAL_APP_URL?.trim() || 'http://localhost:3000';
}
