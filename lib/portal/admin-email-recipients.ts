import "server-only";
import { shouldSendNotification } from "@/lib/portal/notifications";

export type AdminEmailTargetType =
  | "person"
  | "all_students"
  | "all_coaches"
  | "class"
  | "custom";

export type AdminEmailTargetSpec = {
  type: AdminEmailTargetType;
  /** For person / class targets — a single id. */
  id?: string;
  /** For custom target — an array of profile ids. */
  ids?: string[];
};

export type ResolvedRecipient = {
  userId: string;
  email: string;
  displayName: string | null;
  role: string;
  /** If false, this recipient has opted out of general updates. */
  wantsGeneralUpdates: boolean;
};

/**
 * Resolve a target spec into a deduplicated recipient list. Filtering by
 * notification preferences happens later so we can preview counts BEFORE the
 * force-send flag is chosen.
 */
export async function resolveAdminEmailRecipients(
  admin: any,
  spec: AdminEmailTargetSpec
): Promise<ResolvedRecipient[]> {
  const collectedIds = new Set<string>();

  switch (spec.type) {
    case "person": {
      if (!spec.id) return [];
      collectedIds.add(spec.id);
      break;
    }
    case "all_students": {
      const { data } = await admin.from("profiles").select("id").eq("role", "student");
      for (const row of (data ?? []) as Array<{ id: string }>) collectedIds.add(row.id);
      break;
    }
    case "all_coaches": {
      // Coaches + TAs, both roles.
      const { data } = await admin.from("profiles").select("id").in("role", ["coach", "ta"]);
      for (const row of (data ?? []) as Array<{ id: string }>) collectedIds.add(row.id);
      break;
    }
    case "class": {
      if (!spec.id) return [];
      const classId = spec.id;

      // Students enrolled in the class (active + completed).
      const { data: enrollments } = await admin
        .from("enrollments")
        .select("student_id")
        .eq("class_id", classId)
        .in("status", ["active", "completed"]);
      const studentIds = ((enrollments ?? []) as Array<{ student_id: string }>).map(
        (row) => row.student_id
      );
      for (const id of studentIds) collectedIds.add(id);

      // Parents linked to those students.
      if (studentIds.length > 0) {
        const { data: parentLinks } = await admin
          .from("parent_student_links")
          .select("parent_id")
          .in("student_id", studentIds);
        for (const row of (parentLinks ?? []) as Array<{ parent_id: string }>) {
          collectedIds.add(row.parent_id);
        }
      }

      // Primary coach + co-coaches.
      const { data: classRow } = await admin
        .from("classes")
        .select("coach_id")
        .eq("id", classId)
        .maybeSingle();
      if (classRow?.coach_id) collectedIds.add(classRow.coach_id as string);
      const { data: coCoaches } = await admin
        .from("class_coaches")
        .select("coach_id")
        .eq("class_id", classId);
      for (const row of (coCoaches ?? []) as Array<{ coach_id: string }>) {
        collectedIds.add(row.coach_id);
      }
      break;
    }
    case "custom": {
      for (const id of spec.ids ?? []) collectedIds.add(id);
      break;
    }
  }

  if (collectedIds.size === 0) return [];

  const { data: profiles } = await admin
    .from("profiles")
    .select("id,email,display_name,role,notification_preferences")
    .in("id", [...collectedIds]);

  const byEmail = new Map<string, ResolvedRecipient>();
  for (const row of (profiles ?? []) as Array<{
    id: string;
    email: string | null;
    display_name: string | null;
    role: string;
    notification_preferences: unknown;
  }>) {
    if (!row.email) continue;
    const key = row.email.trim().toLowerCase();
    if (!key) continue;
    // Dedup by email — one person might hold both a parent and coach profile
    // linked to the same address.
    if (byEmail.has(key)) continue;
    byEmail.set(key, {
      userId: row.id,
      email: row.email,
      displayName: row.display_name,
      role: row.role,
      wantsGeneralUpdates: shouldSendNotification(
        row.notification_preferences as Record<string, unknown> | null,
        "general_updates",
        true
      ),
    });
  }

  return [...byEmail.values()];
}
