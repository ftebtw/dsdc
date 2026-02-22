import 'server-only';

import { sendPortalEmails } from '@/lib/email/send';
import { shouldSendNotification } from '@/lib/portal/notifications';
import {
  portalPathUrl,
  profilePreferenceUrl,
  sessionRangeForRecipient,
  uniqueEmails,
} from '@/lib/portal/phase-c';

type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

export type SessionProfile = {
  id: string;
  email: string;
  display_name: string | null;
  role: 'admin' | 'coach' | 'ta' | 'student' | 'parent';
  timezone: string;
  locale: 'en' | 'zh';
  notification_preferences: Record<string, unknown> | null;
};

export type PrivateSessionWorkflowRow = {
  id: string;
  student_id: string;
  coach_id: string;
  cancelled_by?: string | null;
  coach_notes?: string | null;
  student_notes?: string | null;
  proposed_by?: string | null;
  requested_date: string;
  requested_start_time: string;
  requested_end_time: string;
  proposed_date: string | null;
  proposed_start_time: string | null;
  proposed_end_time: string | null;
  timezone: string;
  status: string;
  price_cad: number | null;
  zoom_link: string | null;
  payment_method: string | null;
};

export type PrivateSessionParticipants = {
  student: SessionProfile | null;
  coach: SessionProfile | null;
  parents: SessionProfile[];
};

function mapProfile(row: any): SessionProfile {
  return {
    id: String(row.id),
    email: String(row.email ?? ''),
    display_name: row.display_name ? String(row.display_name) : null,
    role: (row.role ?? 'student') as SessionProfile['role'],
    timezone: String(row.timezone ?? 'America/Vancouver'),
    locale: row.locale === 'zh' ? 'zh' : 'en',
    notification_preferences:
      row.notification_preferences && typeof row.notification_preferences === 'object'
        ? (row.notification_preferences as Record<string, unknown>)
        : null,
  };
}

export function isPrivateSessionAlertEnabled(profile: SessionProfile | null | undefined): boolean {
  if (!profile) return false;
  return shouldSendNotification(profile.notification_preferences, 'private_session_alerts', true);
}

export function nameOrEmail(profile: SessionProfile | null | undefined, fallback: string): string {
  if (!profile) return fallback;
  return profile.display_name || profile.email || fallback;
}

export function resolveLocale(profile: SessionProfile | null | undefined): 'en' | 'zh' {
  return profile?.locale === 'zh' ? 'zh' : 'en';
}

export function whenTextForProfile(
  row: PrivateSessionWorkflowRow,
  recipientTimezone: string | null | undefined,
  useProposedTime = false
): string {
  const sessionDate = useProposedTime && row.proposed_date ? row.proposed_date : row.requested_date;
  const startTime =
    useProposedTime && row.proposed_start_time ? row.proposed_start_time : row.requested_start_time;
  const endTime =
    useProposedTime && row.proposed_end_time ? row.proposed_end_time : row.requested_end_time;

  return sessionRangeForRecipient({
    sessionDate,
    startTime,
    endTime,
    sourceTimezone: row.timezone,
    recipientTimezone: recipientTimezone || 'America/Vancouver',
  });
}

export function portalUrlForRole(role: SessionProfile['role'], pathByRole?: Partial<Record<SessionProfile['role'], string>>): string {
  if (pathByRole?.[role]) {
    return portalPathUrl(pathByRole[role] as string);
  }
  if (role === 'coach' || role === 'ta') return portalPathUrl('/portal/coach/private-sessions');
  if (role === 'parent') return portalPathUrl('/portal/parent/private-sessions');
  if (role === 'admin') return portalPathUrl('/portal/admin/private-sessions');
  return portalPathUrl('/portal/student/booking');
}

export async function loadPrivateSessionParticipants(
  supabaseAdmin: any,
  row: Pick<PrivateSessionWorkflowRow, 'student_id' | 'coach_id'>
): Promise<PrivateSessionParticipants> {
  const { data: parentLinks } = await supabaseAdmin
    .from('parent_student_links')
    .select('parent_id')
    .eq('student_id', row.student_id);

  const parentIds: string[] = Array.from(
    new Set<string>(
      (parentLinks ?? [])
        .map((link: any) => (link?.parent_id ? String(link.parent_id) : ''))
        .filter((parentId: unknown): parentId is string => Boolean(parentId))
    )
  );
  const ids = [...new Set([row.student_id, row.coach_id, ...parentIds])];
  if (ids.length === 0) {
    return { student: null, coach: null, parents: [] };
  }

  const { data: profilesData } = await supabaseAdmin
    .from('profiles')
    .select('id,email,display_name,role,timezone,locale,notification_preferences')
    .in('id', ids);

  const profiles = (profilesData ?? []).map(mapProfile);
  const profileMap = new Map<string, SessionProfile>(
    profiles.map((profile: SessionProfile) => [profile.id, profile])
  );

  return {
    student: profileMap.get(row.student_id) ?? null,
    coach: profileMap.get(row.coach_id) ?? null,
    parents: parentIds
      .map((parentId: string) => profileMap.get(parentId) ?? null)
      .filter((profile): profile is SessionProfile => Boolean(profile && profile.role === 'parent')),
  };
}

export async function sendToStudentAndParents(params: {
  participants: PrivateSessionParticipants;
  row: PrivateSessionWorkflowRow;
  useProposedTime?: boolean;
  includePreferenceCheck?: boolean;
  pathByRole?: Partial<Record<SessionProfile['role'], string>>;
  buildTemplate: (input: {
    recipient: SessionProfile;
    whenText: string;
    isParent: boolean;
    portalUrl: string;
    preferenceUrl: string;
    locale: 'en' | 'zh';
  }) => EmailTemplate | null;
}): Promise<void> {
  const recipients = [params.participants.student, ...params.participants.parents].filter(
    (profile): profile is SessionProfile => Boolean(profile && profile.email)
  );

  const filtered = recipients.filter((profile) => {
    if (!params.includePreferenceCheck) return true;
    return isPrivateSessionAlertEnabled(profile);
  });

  const dedupEmails = uniqueEmails(filtered.map((profile) => profile.email));
  const payloads: Array<{ to: string; subject: string; html: string; text: string }> = [];

  for (const email of dedupEmails) {
    const recipient = filtered.find((profile) => profile.email.toLowerCase() === email);
    if (!recipient) continue;

    const template = params.buildTemplate({
      recipient,
      whenText: whenTextForProfile(params.row, recipient.timezone, Boolean(params.useProposedTime)),
      isParent: recipient.role === 'parent',
      portalUrl: portalUrlForRole(recipient.role, params.pathByRole),
      preferenceUrl: profilePreferenceUrl(recipient.role),
      locale: resolveLocale(recipient),
    });

    if (!template) continue;
    payloads.push({ to: email, ...template });
  }

  await sendPortalEmails(payloads);
}

export async function sendToCoach(params: {
  participants: PrivateSessionParticipants;
  row: PrivateSessionWorkflowRow;
  useProposedTime?: boolean;
  includePreferenceCheck?: boolean;
  pathByRole?: Partial<Record<SessionProfile['role'], string>>;
  buildTemplate: (input: {
    recipient: SessionProfile;
    whenText: string;
    portalUrl: string;
    preferenceUrl: string;
    locale: 'en' | 'zh';
  }) => EmailTemplate | null;
}): Promise<void> {
  const coach = params.participants.coach;
  if (!coach?.email) return;
  if (params.includePreferenceCheck && !isPrivateSessionAlertEnabled(coach)) return;

  const template = params.buildTemplate({
    recipient: coach,
    whenText: whenTextForProfile(params.row, coach.timezone, Boolean(params.useProposedTime)),
    portalUrl: portalUrlForRole(coach.role, params.pathByRole),
    preferenceUrl: profilePreferenceUrl(coach.role),
    locale: resolveLocale(coach),
  });
  if (!template) return;

  await sendPortalEmails([{ to: coach.email.trim().toLowerCase(), ...template }]);
}

export function managementEmails(): string[] {
  const raw = process.env.PORTAL_MANAGEMENT_EMAILS || '';
  return uniqueEmails(raw.split(','));
}
