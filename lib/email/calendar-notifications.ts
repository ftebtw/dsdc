import "server-only";

import { calendarEventTemplate } from "@/lib/email/templates";
import { sendPortalEmails } from "@/lib/email/send";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type CalendarEvent = Database["public"]["Tables"]["calendar_events"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

type CreatorProfile = {
  display_name?: string | null;
  email?: string | null;
};

type RecipientProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: AppRole;
  notification_preferences: unknown;
};

type CalendarEmailPreference = "all" | "important_only" | "none";

function getCalendarPreference(value: unknown): CalendarEmailPreference {
  if (value === "none") return "none";
  if (value === "important_only") return "important_only";
  return "all";
}

function formatEventDate(dateValue: string): string {
  const parts = dateValue.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return dateValue;

  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatEventTime(event: CalendarEvent): string {
  if (event.is_all_day) return "All day";
  return `${event.start_time.slice(0, 5)} - ${event.end_time.slice(0, 5)} (${event.timezone})`;
}

function toRecipientRoles(visibility: CalendarEvent["visibility"]): AppRole[] {
  if (visibility === "all_coaches") return ["coach", "ta"];
  if (visibility === "everyone") return ["student", "parent", "coach", "ta"];
  return [];
}

function siteBaseUrl(): string {
  return process.env.PORTAL_APP_URL?.trim() || "https://dsdc.ca";
}

export async function sendCalendarEventNotifications(
  event: CalendarEvent,
  creator: CreatorProfile
): Promise<void> {
  if (event.visibility === "personal") return;

  const recipientRoles = toRecipientRoles(event.visibility);
  if (recipientRoles.length === 0) return;

  const admin = getSupabaseAdminClient();
  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id,email,display_name,role,notification_preferences")
    .in("role", recipientRoles);

  if (error || !profiles) {
    console.error("[calendar-notifications] Failed to fetch profiles:", error?.message);
    return;
  }

  const creatorName = creator.display_name || creator.email || "DSDC Team";
  const eventDate = formatEventDate(event.event_date);
  const eventTime = formatEventTime(event);
  const baseUrl = siteBaseUrl();

  const profileRows = profiles as RecipientProfile[];
  const emailPayloads = profileRows
    .filter((profile) => {
      if (!profile.email) return false;
      if (profile.id === event.created_by) return false;

      const prefs =
        profile.notification_preferences &&
        typeof profile.notification_preferences === "object" &&
        !Array.isArray(profile.notification_preferences)
          ? (profile.notification_preferences as Record<string, unknown>)
          : {};

      const pref = getCalendarPreference(prefs.calendar_emails);
      if (pref === "none") return false;
      if (pref === "important_only" && !event.is_important) return false;
      return true;
    })
    .map((profile) => {
      const preferencePath =
        profile.role === "parent" ? "/portal/parent/preferences" : "/portal/preferences";
      const { html, text } = calendarEventTemplate({
        eventTitle: event.title,
        eventDescription: event.description || undefined,
        eventDate,
        eventTime,
        creatorName,
        isImportant: event.is_important,
        recipientName: profile.display_name || profile.email || "there",
        preferenceUrl: `${baseUrl}${preferencePath}`,
      });

      return {
        to: profile.email as string,
        subject: event.is_important
          ? `Important: ${event.title} - DSDC`
          : `New Event: ${event.title} - DSDC`,
        html,
        text,
      };
    });

  if (emailPayloads.length === 0) return;

  const batchSize = 50;
  for (let start = 0; start < emailPayloads.length; start += batchSize) {
    await sendPortalEmails(emailPayloads.slice(start, start + batchSize));
  }

  console.log(
    `[calendar-notifications] Sent ${emailPayloads.length} emails for event "${event.title}" (important: ${event.is_important})`
  );
}
