export const dynamic = 'force-dynamic';

import { revalidatePath } from "next/cache";
import Link from "next/link";
import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

async function linkStudentToParent(formData: FormData) {
  "use server";
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const parentId = String(formData.get("parent_id") || "");
  const studentId = String(formData.get("student_id") || "");
  if (!parentId || !studentId) return;

  await supabase
    .from("parent_student_links")
    .upsert(
      { parent_id: parentId, student_id: studentId },
      { onConflict: "parent_id,student_id" }
    );
  revalidatePath("/portal/admin/parents");
}

async function unlinkStudentFromParent(formData: FormData) {
  "use server";
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();
  const parentId = String(formData.get("parent_id") || "");
  const studentId = String(formData.get("student_id") || "");
  if (!parentId || !studentId) return;

  await supabase
    .from("parent_student_links")
    .delete()
    .eq("parent_id", parentId)
    .eq("student_id", studentId);
  revalidatePath("/portal/admin/parents");
}

function formatCreated(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default async function AdminParentsPage() {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();

  const [parentsResult, studentsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,display_name,created_at")
      .eq("role", "parent")
      .order("display_name", { ascending: true }),
    supabase
      .from("profiles")
      .select("id,email,display_name")
      .eq("role", "student")
      .order("display_name", { ascending: true }),
  ]);

  if (parentsResult.error) throw new Error(parentsResult.error.message);
  if (studentsResult.error) throw new Error(studentsResult.error.message);

  const parents = (parentsResult.data ?? []) as Array<{
    id: string;
    email: string;
    display_name: string | null;
    created_at: string | null;
  }>;
  const students = (studentsResult.data ?? []) as Array<{
    id: string;
    email: string;
    display_name: string | null;
  }>;

  const parentIds = parents.map((parent) => parent.id);
  const { data: linksData, error: linksError } = parentIds.length
    ? await supabase
        .from("parent_student_links")
        .select("parent_id,student_id")
        .in("parent_id", parentIds)
    : { data: [], error: null as { message: string } | null };
  if (linksError) throw new Error(linksError.message);

  const links = (linksData ?? []) as Array<{ parent_id: string; student_id: string }>;
  const studentMap = new Map(students.map((student) => [student.id, student]));
  const linkedIdsByParent = new Map<string, string[]>();

  for (const link of links) {
    const list = linkedIdsByParent.get(link.parent_id) ?? [];
    list.push(link.student_id);
    linkedIdsByParent.set(link.parent_id, list);
  }

  return (
    <SectionCard title="Parents" description="Parent accounts and student links.">
      <div className="rounded-xl border border-warm-200 dark:border-navy-600 overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-warm-100 dark:bg-navy-900/60">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Linked Students</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {parents.map((parent) => {
              const linkedStudentIds = linkedIdsByParent.get(parent.id) ?? [];
              const linkedStudents = linkedStudentIds
                .map((studentId) => studentMap.get(studentId))
                .filter((student): student is { id: string; email: string; display_name: string | null } =>
                  Boolean(student)
                );

              const unlinkedStudents = students.filter(
                (student) => !linkedStudentIds.includes(student.id)
              );

              return (
                <tr key={parent.id} className="border-t border-warm-200 dark:border-navy-700 align-top">
                  <td className="px-4 py-3 font-medium text-navy-800 dark:text-white">
                    {parent.display_name || "-"}
                  </td>
                  <td className="px-4 py-3">{parent.email}</td>
                  <td className="px-4 py-3">
                    {linkedStudents.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {linkedStudents.map((student) => (
                          <span
                            key={`${parent.id}:${student.id}`}
                            className="inline-flex items-center rounded-md border border-warm-300 dark:border-navy-600 px-2 py-1 text-xs"
                          >
                            <Link
                              href={`/portal/admin/students/${student.id}`}
                              className="underline underline-offset-2"
                            >
                              {student.display_name || student.email}
                            </Link>
                            <form action={unlinkStudentFromParent} className="inline ml-1">
                              <input type="hidden" name="parent_id" value={parent.id} />
                              <input type="hidden" name="student_id" value={student.id} />
                              <button
                                type="submit"
                                className="text-red-500 text-xs ml-1"
                                title="Unlink"
                              >
                                ×
                              </button>
                            </form>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-charcoal/60 dark:text-navy-300 mb-2">No linked students</p>
                    )}

                    <form action={linkStudentToParent} className="flex items-center gap-2">
                      <input type="hidden" name="parent_id" value={parent.id} />
                      <select
                        name="student_id"
                        disabled={unlinkedStudents.length === 0}
                        className="rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-2 py-1.5 text-xs"
                      >
                        {unlinkedStudents.length === 0 ? (
                          <option value="">All students linked</option>
                        ) : (
                          unlinkedStudents.map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.display_name || student.email} ({student.email})
                            </option>
                          ))
                        )}
                      </select>
                      <button
                        type="submit"
                        disabled={unlinkedStudents.length === 0}
                        className="rounded-md border border-warm-300 dark:border-navy-600 px-2 py-1 text-xs disabled:opacity-50"
                      >
                        Link
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">{formatCreated(parent.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {parents.length === 0 ? (
        <p className="mt-4 text-sm text-charcoal/70 dark:text-navy-300">No parent accounts found.</p>
      ) : null}
    </SectionCard>
  );
}
