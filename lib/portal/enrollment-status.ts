import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

type Client = SupabaseClient<any, "public", any>;

const ENROLLED_STATUSES = ["active", "pending_etransfer", "etransfer_sent", "pending_approval"];

/**
 * Returns true if a student has at least one enrollment in the active term.
 */
export async function hasActiveEnrollment(
  supabase: Client,
  studentId: string
): Promise<boolean> {
  const { data: activeTerm } = await supabase
    .from("terms")
    .select("id")
    .eq("is_active", true)
    .maybeSingle();
  if (!activeTerm) return false;

  const { data: termClasses } = await supabase
    .from("classes")
    .select("id")
    .eq("term_id", activeTerm.id);
  const termClassIds = (termClasses ?? []).map((row: any) => row.id as string);
  if (!termClassIds.length) return false;

  const { data: enrollmentRows } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .in("class_id", termClassIds)
    .in("status", ENROLLED_STATUSES)
    .limit(1);

  return (enrollmentRows ?? []).length > 0;
}

/**
 * Returns whether any linked student has an enrollment in the active term.
 */
export async function parentHasEnrolledStudent(
  supabase: Client,
  parentId: string
): Promise<{ hasEnrolled: boolean; linkedStudentIds: string[] }> {
  const { data: links } = await supabase
    .from("parent_student_links")
    .select("student_id")
    .eq("parent_id", parentId);

  const linkedStudentIds = [...new Set((links ?? []).map((row: any) => row.student_id as string))];
  if (!linkedStudentIds.length) return { hasEnrolled: false, linkedStudentIds };

  const { data: activeTerm } = await supabase
    .from("terms")
    .select("id")
    .eq("is_active", true)
    .maybeSingle();
  if (!activeTerm) return { hasEnrolled: false, linkedStudentIds };

  const { data: termClasses } = await supabase
    .from("classes")
    .select("id")
    .eq("term_id", activeTerm.id);
  const termClassIds = (termClasses ?? []).map((row: any) => row.id as string);
  if (!termClassIds.length) return { hasEnrolled: false, linkedStudentIds };

  const { data: enrollmentRows } = await supabase
    .from("enrollments")
    .select("id")
    .in("student_id", linkedStudentIds)
    .in("class_id", termClassIds)
    .in("status", ENROLLED_STATUSES)
    .limit(1);

  return {
    hasEnrolled: (enrollmentRows ?? []).length > 0,
    linkedStudentIds,
  };
}
