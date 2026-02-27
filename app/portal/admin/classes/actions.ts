"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/portal/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export async function createClass(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();

  await supabase.from("classes").insert({
    term_id: String(formData.get("term_id")),
    name: String(formData.get("name")),
    description: String(formData.get("description") || "") || null,
    type: String(formData.get("type")) as Database["public"]["Enums"]["class_type"],
    coach_id: String(formData.get("coach_id")),
    schedule_day: String(formData.get("schedule_day")) as Database["public"]["Enums"]["schedule_day"],
    schedule_start_time: String(formData.get("schedule_start_time")),
    schedule_end_time: String(formData.get("schedule_end_time")),
    timezone: String(formData.get("timezone") || "America/Vancouver"),
    zoom_link: String(formData.get("zoom_link") || "") || null,
    max_students: Number(formData.get("max_students") || 12),
    eligible_sub_tier: String(formData.get("eligible_sub_tier")) as Database["public"]["Enums"]["coach_tier"],
  });

  revalidatePath("/portal/admin/classes");
}

export async function updateClass(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const classId = String(formData.get("id") || "");
  if (!classId) return;

  await supabase
    .from("classes")
    .update({
      term_id: String(formData.get("term_id")),
      name: String(formData.get("name")),
      description: String(formData.get("description") || "") || null,
      type: String(formData.get("type")) as Database["public"]["Enums"]["class_type"],
      coach_id: String(formData.get("coach_id")),
      schedule_day: String(formData.get("schedule_day")) as Database["public"]["Enums"]["schedule_day"],
      schedule_start_time: String(formData.get("schedule_start_time")),
      schedule_end_time: String(formData.get("schedule_end_time")),
      timezone: String(formData.get("timezone") || "America/Vancouver"),
      zoom_link: String(formData.get("zoom_link") || "") || null,
      max_students: Number(formData.get("max_students") || 12),
      eligible_sub_tier: String(formData.get("eligible_sub_tier")) as Database["public"]["Enums"]["coach_tier"],
    })
    .eq("id", classId);

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
      "name,description,type,coach_id,schedule_day,schedule_start_time,schedule_end_time,timezone,zoom_link,max_students,eligible_sub_tier"
    )
    .eq("term_id", sourceTermId);
  if (error || !sourceClasses?.length) return;

  const clones = sourceClasses.map((cls: Record<string, unknown>) => ({
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

  await supabase.from("classes").insert(clones);
  revalidatePath("/portal/admin/classes");
}
