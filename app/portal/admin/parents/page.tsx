import AdminDeleteUserButton from "@/app/portal/_components/AdminDeleteUserButton";
import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminParentsPage() {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();

  const { data: parentsData, error: parentsError } = await supabase
    .from("profiles")
    .select("id,email,display_name")
    .eq("role", "parent")
    .order("display_name", { ascending: true });
  if (parentsError) throw new Error(parentsError.message);

  const parents = (parentsData ?? []) as Array<{
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

  const studentIds = [
    ...new Set(
      ((linksData ?? []) as Array<{ parent_id: string; student_id: string }>)
        .map((link) => link.student_id)
        .filter(Boolean)
    ),
  ];

  const { data: studentsData, error: studentsError } = studentIds.length
    ? await supabase
        .from("profiles")
        .select("id,display_name,email")
        .in("id", studentIds)
    : { data: [], error: null as { message: string } | null };
  if (studentsError) throw new Error(studentsError.message);

  const studentMap = new Map(
    ((studentsData ?? []) as Array<{ id: string; display_name: string | null; email: string }>).map((student) => [
      student.id,
      student,
    ])
  );

  const studentsByParent = new Map<string, string[]>();
  for (const link of (linksData ?? []) as Array<{ parent_id: string; student_id: string }>) {
    const list = studentsByParent.get(link.parent_id) ?? [];
    const student = studentMap.get(link.student_id);
    if (student) {
      list.push(student.display_name || student.email);
    } else {
      list.push(link.student_id);
    }
    studentsByParent.set(link.parent_id, list);
  }

  return (
    <SectionCard
      title="Parents"
      description="Parent profiles and their linked students."
    >
      <div className="rounded-xl border border-warm-200 dark:border-navy-600 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-warm-100 dark:bg-navy-900/60">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Linked Students</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {parents.map((parent) => (
              <tr key={parent.id} className="border-t border-warm-200 dark:border-navy-700">
                <td className="px-4 py-3 font-medium text-navy-800 dark:text-white">
                  {parent.display_name || "-"}
                </td>
                <td className="px-4 py-3">{parent.email}</td>
                <td className="px-4 py-3">
                  {(studentsByParent.get(parent.id) ?? []).join(", ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <AdminDeleteUserButton userId={parent.id} displayName={parent.display_name || parent.email} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {parents.length === 0 ? (
        <p className="mt-4 text-sm text-charcoal/70 dark:text-navy-300">No parent accounts found.</p>
      ) : null}
    </SectionCard>
  );
}
