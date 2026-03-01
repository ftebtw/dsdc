"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/portal/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export async function createClass(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const primaryCoachId = String(formData.get("coach_id"));

  const { data: createdClass } = await supabase
    .from("classes")
    .insert({
      term_id: String(formData.get("term_id")),
      name: String(formData.get("name")),
      description: String(formData.get("description") || "") || null,
      type: String(formData.get("type")) as Database["public"]["Enums"]["class_type"],
      coach_id: primaryCoachId,
      schedule_day: String(formData.get("schedule_day")) as Database["public"]["Enums"]["schedule_day"],
      schedule_start_time: String(formData.get("schedule_start_time")),
      schedule_end_time: String(formData.get("schedule_end_time")),
      timezone: String(formData.get("timezone") || "America/Vancouver"),
      zoom_link: String(formData.get("zoom_link") || "") || null,
      max_students: Number(formData.get("max_students") || 12),
      eligible_sub_tier: String(formData.get("eligible_sub_tier")) as Database["public"]["Enums"]["coach_tier"],
    })
    .select("id")
    .maybeSingle();

  // Save optional co-coaches (excluding primary coach).
  const coCoachIds = formData
    .getAll("co_coach_ids")
    .map(String)
    .filter((coachId) => Boolean(coachId) && coachId !== primaryCoachId);
  if (createdClass?.id && coCoachIds.length) {
    await supabase.from("class_coaches").insert(
      coCoachIds.map((coachId) => ({
        class_id: createdClass.id,
        coach_id: coachId,
      }))
    );
  }

  revalidatePath("/portal/admin/classes");
}

export async function updateClass(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const classId = String(formData.get("id") || "");
  if (!classId) return;
  const primaryCoachId = String(formData.get("coach_id"));

  await supabase
    .from("classes")
    .update({
      term_id: String(formData.get("term_id")),
      name: String(formData.get("name")),
      description: String(formData.get("description") || "") || null,
      type: String(formData.get("type")) as Database["public"]["Enums"]["class_type"],
      coach_id: primaryCoachId,
      schedule_day: String(formData.get("schedule_day")) as Database["public"]["Enums"]["schedule_day"],
      schedule_start_time: String(formData.get("schedule_start_time")),
      schedule_end_time: String(formData.get("schedule_end_time")),
      timezone: String(formData.get("timezone") || "America/Vancouver"),
      zoom_link: String(formData.get("zoom_link") || "") || null,
      max_students: Number(formData.get("max_students") || 12),
      eligible_sub_tier: String(formData.get("eligible_sub_tier")) as Database["public"]["Enums"]["coach_tier"],
    })
    .eq("id", classId);

  // Sync co-coaches: delete all then re-insert.
  const coCoachIds = formData
    .getAll("co_coach_ids")
    .map(String)
    .filter((coachId) => Boolean(coachId) && coachId !== primaryCoachId);
  await supabase.from("class_coaches").delete().eq("class_id", classId);
  if (coCoachIds.length) {
    await supabase.from("class_coaches").insert(
      coCoachIds.map((coachId) => ({
        class_id: classId,
        coach_id: coachId,
      }))
    );
  }

  revalidatePath("/portal/admin/classes");
}

export async function deleteClass(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const classId = String(formData.get("id") || "");
  if (!classId) return;
  await supabase.from("classes").delete().eq("id", classId);
  revalidatePath("/portal/admin/classes");
}

export async function cloneClassesToTerm(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();

  const sourceTermId = String(formData.get("source_term_id") || "");
  const targetTermId = String(formData.get("target_term_id") || "");
  if (!sourceTermId || !targetTermId || sourceTermId === targetTermId) return;

  const { data: existingClasses } = await supabase
    .from("classes")
    .select("id")
    .eq("term_id", targetTermId)
    .limit(1);
  if ((existingClasses ?? []).length > 0) {
    revalidatePath("/portal/admin/classes");
    return;
  }

  const { data: sourceClasses, error } = await supabase
    .from("classes")
    .select(
      "id,name,description,type,coach_id,schedule_day,schedule_start_time,schedule_end_time,timezone,zoom_link,max_students,eligible_sub_tier"
    )
    .eq("term_id", sourceTermId);
  if (error || !sourceClasses?.length) return;
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
  }));

  const { data: insertedClasses } = await supabase
    .from("classes")
    .insert(clones)
    .select("id,name,coach_id,schedule_day,schedule_start_time,schedule_end_time");

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
    await supabase.from("class_coaches").insert(clonedCoaches);
  }

  revalidatePath("/portal/admin/classes");
}
