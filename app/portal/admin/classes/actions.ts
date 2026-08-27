"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/portal/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

function parseCustomPriceCad(formData: FormData): number | null {
  const raw = String(formData.get("custom_price_cad") ?? "").trim();
  if (raw === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value);
}

const DAY_CODES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
type DayCode = (typeof DAY_CODES)[number];

function parseScheduleDays(formData: FormData): DayCode[] {
  const raw = formData.getAll("schedule_days").map(String).map((s) => s.toLowerCase());
  const legacy = String(formData.get("schedule_day") || "").toLowerCase();
  const seen = new Set<DayCode>();
  for (const value of [...raw, legacy]) {
    if ((DAY_CODES as readonly string[]).includes(value)) seen.add(value as DayCode);
  }
  return DAY_CODES.filter((code) => seen.has(code));
}

function parseIsoDate(formData: FormData, key: string): string | null {
  const raw = String(formData.get(key) || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

function parseOptionalString(formData: FormData, key: string): string | null {
  const raw = String(formData.get(key) || "").trim();
  return raw.length ? raw : null;
}

type ClassSchedulePayload = {
  term_id: string | null;
  schedule_day: Database["public"]["Enums"]["schedule_day"] | null;
  schedule_days: DayCode[] | null;
  start_date: string | null;
  end_date: string | null;
};

function buildSchedulePayload(formData: FormData): ClassSchedulePayload | { error: string } {
  const termId = parseOptionalString(formData, "term_id");
  const startDate = parseIsoDate(formData, "start_date");
  const endDate = parseIsoDate(formData, "end_date");
  const days = parseScheduleDays(formData);

  if (days.length === 0) {
    return { error: "schedule_days_required" };
  }
  // Custom-schedule path: requires both start and end dates.
  // Term-anchored path: term_id supplies the window.
  if (!termId && (!startDate || !endDate)) {
    return { error: "term_or_dates_required" };
  }
  if (startDate && endDate && endDate < startDate) {
    return { error: "invalid_date_range" };
  }

  return {
    term_id: termId,
    // schedule_day (single) stays populated so legacy consumers keep working;
    // schedule_days (array) is always persisted so the term-less branch of
    // classes_required_fields_by_kind (which requires schedule_days
    // non-empty) passes even for a one-day class.
    schedule_day: days[0] as Database["public"]["Enums"]["schedule_day"],
    schedule_days: days,
    start_date: startDate,
    end_date: endDate,
  };
}

export async function createClass(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const primaryCoachId = String(formData.get("coach_id"));

  const schedule = buildSchedulePayload(formData);
  if ("error" in schedule) {
    redirect(`/portal/admin/classes?error=${schedule.error}`);
  }

  const { data: createdClass, error: insertError } = await supabase
    .from("classes")
    .insert({
      term_id: schedule.term_id,
      name: String(formData.get("name")),
      description: String(formData.get("description") || "") || null,
      type: String(formData.get("type")) as Database["public"]["Enums"]["class_type"],
      coach_id: primaryCoachId,
      schedule_day: schedule.schedule_day,
      schedule_days: schedule.schedule_days,
      start_date: schedule.start_date,
      end_date: schedule.end_date,
      schedule_start_time: String(formData.get("schedule_start_time")),
      schedule_end_time: String(formData.get("schedule_end_time")),
      timezone: String(formData.get("timezone") || "America/Vancouver"),
      zoom_link: String(formData.get("zoom_link") || "") || null,
      max_students: Number(formData.get("max_students") || 12),
      eligible_sub_tier: String(formData.get("eligible_sub_tier")) as Database["public"]["Enums"]["coach_tier"],
      custom_price_cad: parseCustomPriceCad(formData),
    })
    .select("id")
    .maybeSingle();
  if (insertError) {
    console.error("[admin-classes] create failed", insertError);
    redirect("/portal/admin/classes?error=save_failed");
  }

  // Save optional co-coaches (excluding primary coach).
  const coCoachIds = formData
    .getAll("co_coach_ids")
    .map(String)
    .filter((coachId) => Boolean(coachId) && coachId !== primaryCoachId);
  if (createdClass?.id && coCoachIds.length) {
    const { error: coCoachError } = await supabase.from("class_coaches").insert(
      coCoachIds.map((coachId) => ({
        class_id: createdClass.id,
        coach_id: coachId,
      }))
    );
    if (coCoachError) {
      console.error("[admin-classes] co-coach insert failed", coCoachError);
      redirect("/portal/admin/classes?error=save_failed");
    }
  }

  revalidatePath("/portal/admin/classes");
  redirect("/portal/admin/classes?created=1");
}

export async function updateClass(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const classId = String(formData.get("id") || "");
  if (!classId) {
    redirect("/portal/admin/classes?error=missing_record");
  }
  const primaryCoachId = String(formData.get("coach_id"));

  const schedule = buildSchedulePayload(formData);
  if ("error" in schedule) {
    redirect(`/portal/admin/classes?error=${schedule.error}`);
  }

  const { error: updateError } = await supabase
    .from("classes")
    .update({
      term_id: schedule.term_id,
      name: String(formData.get("name")),
      description: String(formData.get("description") || "") || null,
      type: String(formData.get("type")) as Database["public"]["Enums"]["class_type"],
      coach_id: primaryCoachId,
      schedule_day: schedule.schedule_day,
      schedule_days: schedule.schedule_days,
      start_date: schedule.start_date,
      end_date: schedule.end_date,
      schedule_start_time: String(formData.get("schedule_start_time")),
      schedule_end_time: String(formData.get("schedule_end_time")),
      timezone: String(formData.get("timezone") || "America/Vancouver"),
      zoom_link: String(formData.get("zoom_link") || "") || null,
      max_students: Number(formData.get("max_students") || 12),
      eligible_sub_tier: String(formData.get("eligible_sub_tier")) as Database["public"]["Enums"]["coach_tier"],
      custom_price_cad: parseCustomPriceCad(formData),
    })
    .eq("id", classId);
  if (updateError) {
    console.error("[admin-classes] update failed", updateError);
    redirect("/portal/admin/classes?error=save_failed");
  }

  // Sync co-coaches: delete all then re-insert.
  const coCoachIds = formData
    .getAll("co_coach_ids")
    .map(String)
    .filter((coachId) => Boolean(coachId) && coachId !== primaryCoachId);
  const { error: deleteCoCoachError } = await supabase
    .from("class_coaches")
    .delete()
    .eq("class_id", classId);
  if (deleteCoCoachError) {
    console.error("[admin-classes] co-coach reset failed", deleteCoCoachError);
    redirect("/portal/admin/classes?error=save_failed");
  }
  if (coCoachIds.length) {
    const { error: coCoachError } = await supabase.from("class_coaches").insert(
      coCoachIds.map((coachId) => ({
        class_id: classId,
        coach_id: coachId,
      }))
    );
    if (coCoachError) {
      console.error("[admin-classes] co-coach insert failed", coCoachError);
      redirect("/portal/admin/classes?error=save_failed");
    }
  }

  revalidatePath("/portal/admin/classes");
  redirect("/portal/admin/classes?saved=1");
}

export async function deleteClass(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const classId = String(formData.get("id") || "");
  if (!classId) {
    redirect("/portal/admin/classes?error=missing_record");
  }
  const { error } = await supabase.from("classes").delete().eq("id", classId);
  if (error) {
    console.error("[admin-classes] delete failed", error);
    redirect("/portal/admin/classes?error=delete_failed");
  }
  revalidatePath("/portal/admin/classes");
  redirect("/portal/admin/classes?deleted=1");
}

function appendQuery(url: string, extra: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}${extra}`;
}

export async function archiveClass(formData: FormData) {
  const session = await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const classId = String(formData.get("id") || "");
  const redirectTo = String(formData.get("redirect_to") || "/portal/admin/classes");
  if (!classId) {
    redirect(appendQuery(redirectTo, "error=missing_record"));
  }
  const { error } = await (supabase as any)
    .from("classes")
    .update({
      archived_at: new Date().toISOString(),
      archived_by: session.userId,
    })
    .eq("id", classId);
  if (error) {
    console.error("[admin-classes] archive failed", error);
    redirect(appendQuery(redirectTo, "error=archive_failed"));
  }
  revalidatePath("/portal/admin/classes");
  redirect(appendQuery(redirectTo, "archived=1"));
}

export async function unarchiveClass(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const classId = String(formData.get("id") || "");
  const redirectTo = String(formData.get("redirect_to") || "/portal/admin/classes");
  if (!classId) {
    redirect(appendQuery(redirectTo, "error=missing_record"));
  }
  const { error } = await (supabase as any)
    .from("classes")
    .update({ archived_at: null, archived_by: null })
    .eq("id", classId);
  if (error) {
    console.error("[admin-classes] unarchive failed", error);
    redirect(appendQuery(redirectTo, "error=unarchive_failed"));
  }
  revalidatePath("/portal/admin/classes");
  redirect(appendQuery(redirectTo, "unarchived=1"));
}

export async function assignSessionCover(formData: FormData) {
  const session = await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const classId = String(formData.get("id") || "");
  const sessionDate = String(formData.get("session_date") || "").trim();
  const coveringCoachId = String(formData.get("covering_coach_id") || "").trim();
  const redirectTo = String(formData.get("redirect_to") || `/portal/admin/classes/${classId}`);
  if (!classId || !/^\d{4}-\d{2}-\d{2}$/.test(sessionDate) || !coveringCoachId) {
    redirect(appendQuery(redirectTo, "error=cover_invalid"));
  }

  const { data: classRow } = await (supabase as any)
    .from("classes")
    .select("id,coach_id")
    .eq("id", classId)
    .maybeSingle();
  if (!classRow || !classRow.coach_id) {
    redirect(appendQuery(redirectTo, "error=cover_no_primary"));
  }
  if (classRow.coach_id === coveringCoachId) {
    redirect(appendQuery(redirectTo, "error=cover_same_coach"));
  }

  // Reuse an existing (non-cancelled) request for this class+date if present,
  // otherwise create a fresh, already-accepted one.
  const { data: existing } = await (supabase as any)
    .from("sub_requests")
    .select("id")
    .eq("class_id", classId)
    .eq("session_date", sessionDate)
    .in("status", ["open", "accepted"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await (supabase as any)
      .from("sub_requests")
      .update({
        accepting_coach_id: coveringCoachId,
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) {
      console.error("[admin-classes] assign cover (update) failed", error);
      redirect(appendQuery(redirectTo, "error=cover_failed"));
    }
  } else {
    const { error } = await (supabase as any).from("sub_requests").insert({
      requesting_coach_id: classRow.coach_id,
      class_id: classId,
      session_date: sessionDate,
      reason: "Cover assigned by admin",
      status: "accepted",
      accepting_coach_id: coveringCoachId,
      accepted_at: new Date().toISOString(),
    });
    if (error) {
      console.error("[admin-classes] assign cover (insert) failed", error);
      redirect(appendQuery(redirectTo, "error=cover_failed"));
    }
  }

  // The original coach didn't teach this session — drop their check-in for
  // that date so payroll doesn't pay them (payroll is driven by check-ins).
  await (supabase as any)
    .from("coach_checkins")
    .delete()
    .eq("class_id", classId)
    .eq("session_date", sessionDate)
    .eq("coach_id", classRow.coach_id);

  revalidatePath(`/portal/admin/classes/${classId}`);
  redirect(appendQuery(redirectTo, "cover_assigned=1"));
}

export async function removeSessionCover(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const classId = String(formData.get("id") || "");
  const sessionDate = String(formData.get("session_date") || "").trim();
  const redirectTo = String(formData.get("redirect_to") || `/portal/admin/classes/${classId}`);
  if (!classId || !/^\d{4}-\d{2}-\d{2}$/.test(sessionDate)) {
    redirect(appendQuery(redirectTo, "error=cover_invalid"));
  }

  // Find the accepted cover for this class+date, capture the covering coach.
  const { data: cover } = await (supabase as any)
    .from("sub_requests")
    .select("id,accepting_coach_id")
    .eq("class_id", classId)
    .eq("session_date", sessionDate)
    .eq("status", "accepted")
    .order("accepted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cover) {
    await (supabase as any)
      .from("sub_requests")
      .update({ status: "cancelled" })
      .eq("id", cover.id);

    // Remove the (no-longer-covering) coach's check-in so they're not paid.
    if (cover.accepting_coach_id) {
      await (supabase as any)
        .from("coach_checkins")
        .delete()
        .eq("class_id", classId)
        .eq("session_date", sessionDate)
        .eq("coach_id", cover.accepting_coach_id);
    }
  }

  revalidatePath(`/portal/admin/classes/${classId}`);
  redirect(appendQuery(redirectTo, "cover_removed=1"));
}

export async function renamePrivateSessionGroup(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const classId = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const redirectTo = String(formData.get("redirect_to") || "/portal/admin/classes");
  if (!classId || !name) {
    redirect(appendQuery(redirectTo, "error=missing_record"));
  }
  // Guard: only rename private-session group classrooms here so this can't be
  // used to mangle a regular term class's required fields.
  const { data: classRow } = await (supabase as any)
    .from("classes")
    .select("id,is_private_session_group")
    .eq("id", classId)
    .maybeSingle();
  if (!classRow || !classRow.is_private_session_group) {
    redirect(appendQuery(redirectTo, "error=not_a_private_group"));
  }
  const { error } = await (supabase as any)
    .from("classes")
    .update({ name, description: description || null })
    .eq("id", classId);
  if (error) {
    console.error("[admin-classes] rename private group failed", error);
    redirect(appendQuery(redirectTo, "error=rename_failed"));
  }
  revalidatePath("/portal/admin/classes");
  redirect(appendQuery(redirectTo, "renamed=1"));
}

export async function cloneClassesToTerm(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();

  const sourceTermId = String(formData.get("source_term_id") || "");
  const targetTermId = String(formData.get("target_term_id") || "");
  if (!sourceTermId || !targetTermId || sourceTermId === targetTermId) {
    redirect("/portal/admin/classes?error=invalid_clone");
  }

  const { data: existingClasses } = await supabase
    .from("classes")
    .select("id")
    .eq("term_id", targetTermId)
    .limit(1);
  if ((existingClasses ?? []).length > 0) {
    revalidatePath("/portal/admin/classes");
    redirect("/portal/admin/classes?error=target_term_not_empty");
  }

  const { data: sourceClasses, error } = await supabase
    .from("classes")
    .select(
      "id,name,description,type,coach_id,schedule_day,schedule_start_time,schedule_end_time,timezone,zoom_link,max_students,eligible_sub_tier,custom_price_cad,schedule_days"
    )
    .eq("term_id", sourceTermId);
  if (error) {
    console.error("[admin-classes] clone read failed", error);
    redirect("/portal/admin/classes?error=clone_failed");
  }
  if (!sourceClasses?.length) {
    redirect("/portal/admin/classes?error=source_term_empty");
  }
  const classesToClone = sourceClasses as Array<{
    id: string;
    name: string;
    description: string | null;
    type: Database["public"]["Enums"]["class_type"];
    coach_id: string | null;
    schedule_day: Database["public"]["Enums"]["schedule_day"];
    schedule_start_time: string;
    schedule_end_time: string;
    timezone: string;
    zoom_link: string | null;
    max_students: number;
    eligible_sub_tier: Database["public"]["Enums"]["coach_tier"];
    custom_price_cad: number | null;
    schedule_days: string[] | null;
  }>;

  const clones = classesToClone.map((cls) => ({
    term_id: targetTermId,
    name: cls.name,
    description: cls.description,
    type: cls.type,
    coach_id: cls.coach_id,
    schedule_day: cls.schedule_day,
    schedule_start_time: cls.schedule_start_time,
    schedule_end_time: cls.schedule_end_time,
    timezone: cls.timezone,
    zoom_link: cls.zoom_link,
    max_students: cls.max_students,
    eligible_sub_tier: cls.eligible_sub_tier,
    // Flat-fee programs (e.g. Globals Training) price off custom_price_cad.
    // Dropping it here would silently reprice them at the class-type tier.
    custom_price_cad: cls.custom_price_cad,
    // Weekday pattern is term-independent, so it carries over. The per-class
    // start_date/end_date window deliberately does not: it is an alternative
    // to term_id, and copying it would pin the clone to the old term's dates.
    schedule_days: cls.schedule_days,
  }));

  const { data: insertedClasses, error: cloneInsertError } = await supabase
    .from("classes")
    .insert(clones)
    .select("id,name,coach_id,schedule_day,schedule_start_time,schedule_end_time");
  if (cloneInsertError) {
    console.error("[admin-classes] clone insert failed", cloneInsertError);
    redirect("/portal/admin/classes?error=clone_failed");
  }

  // Clone co-coach assignments.
  const sourceClassIds = classesToClone.map((classRow) => classRow.id);
  const { data: sourceClassCoaches } = sourceClassIds.length
    ? await supabase.from("class_coaches").select("class_id,coach_id").in("class_id", sourceClassIds)
    : { data: [] as Array<{ class_id: string; coach_id: string }> };
  const insertedByKey = new Map<string, string>(
    (insertedClasses ?? []).map((classRow: {
      id: string;
      name: string;
      coach_id: string | null;
      schedule_day: Database["public"]["Enums"]["schedule_day"];
      schedule_start_time: string;
      schedule_end_time: string;
    }) => [
      `${classRow.name}::${classRow.coach_id}::${classRow.schedule_day}::${classRow.schedule_start_time}::${classRow.schedule_end_time}`,
      classRow.id,
    ])
  );

  const classIdMap = new Map<string, string>();
  for (const sourceClass of classesToClone) {
    const key = `${sourceClass.name}::${sourceClass.coach_id}::${sourceClass.schedule_day}::${sourceClass.schedule_start_time}::${sourceClass.schedule_end_time}`;
    const targetClassId = insertedByKey.get(key);
    if (targetClassId) {
      classIdMap.set(sourceClass.id, targetClassId);
    }
  }

  const clonedCoaches = (sourceClassCoaches ?? [])
    .map((row: { class_id: string; coach_id: string }) => {
      const targetClassId = classIdMap.get(row.class_id);
      if (!targetClassId) return null;
      return { class_id: targetClassId, coach_id: row.coach_id };
    })
    .filter(
      (row: { class_id: string; coach_id: string } | null): row is { class_id: string; coach_id: string } =>
        row !== null
    );

  if (clonedCoaches.length) {
    const { error: clonedCoachesError } = await supabase
      .from("class_coaches")
      .insert(clonedCoaches);
    if (clonedCoachesError) {
      console.error("[admin-classes] clone co-coaches failed", clonedCoachesError);
      redirect("/portal/admin/classes?error=clone_failed");
    }
  }

  revalidatePath("/portal/admin/classes");
  redirect("/portal/admin/classes?cloned=1");
}
