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

export async function createClass(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const primaryCoachId = String(formData.get("coach_id"));

  const { data: createdClass, error: insertError } = await supabase
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

  const { error: updateError } = await supabase
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

export async function archiveClass(formData: FormData) {
  const session = await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const classId = String(formData.get("id") || "");
  const redirectTo = String(formData.get("redirect_to") || "/portal/admin/classes");
  if (!classId) {
    redirect(`${redirectTo}?error=missing_record`);
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
    redirect(`${redirectTo}?error=archive_failed`);
  }
  revalidatePath("/portal/admin/classes");
  redirect(`${redirectTo}?archived=1`);
}

export async function unarchiveClass(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const classId = String(formData.get("id") || "");
  const redirectTo = String(formData.get("redirect_to") || "/portal/admin/classes");
  if (!classId) {
    redirect(`${redirectTo}?error=missing_record`);
  }
  const { error } = await (supabase as any)
    .from("classes")
    .update({ archived_at: null, archived_by: null })
    .eq("id", classId);
  if (error) {
    console.error("[admin-classes] unarchive failed", error);
    redirect(`${redirectTo}?error=unarchive_failed`);
  }
  revalidatePath("/portal/admin/classes");
  redirect(`${redirectTo}?unarchived=1`);
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
      "id,name,description,type,coach_id,schedule_day,schedule_start_time,schedule_end_time,timezone,zoom_link,max_students,eligible_sub_tier"
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
