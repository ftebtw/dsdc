import AdminPendingApprovalsManager from "@/app/portal/_components/AdminPendingApprovalsManager";
import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPendingApprovalsPage() {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();

  const { data: rowsData } = await supabase
    .from("enrollments")
    .select("student_id,class_id,enrolled_at,approval_expires_at")
    .eq("status", "pending_approval")
    .order("enrolled_at", { ascending: false });

  const rows = (rowsData ?? []) as Array<{
    student_id: string;
    class_id: string;
    enrolled_at: string;
    approval_expires_at: string | null;
  }>;

  const studentIds = [...new Set(rows.map((row) => row.student_id))];
  const classIds = [...new Set(rows.map((row) => row.class_id))];
  const [{ data: studentRowsData }, { data: classRowsData }] = await Promise.all([
    studentIds.length
      ? supabase.from("profiles").select("id,email,display_name").in("id", studentIds)
      : Promise.resolve({ data: [] as Array<{ id: string; email: string; display_name: string | null }> }),
    classIds.length
      ? supabase.from("classes").select("id,name").in("id", classIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
  ]);

  const studentMap = Object.fromEntries(
    ((studentRowsData ?? []) as Array<{ id: string; email: string; display_name: string | null }>).map((row) => [
      row.id,
      row,
    ])
  ) as Record<string, { id: string; email: string; display_name: string | null }>;
  const classMap = Object.fromEntries(
    ((classRowsData ?? []) as Array<{ id: string; name: string }>).map((row) => [row.id, row.name])
  ) as Record<string, string>;

  const grouped = new Map<
    string,
    {
      studentId: string;
      studentName: string;
      studentEmail: string;
      classNames: string[];
      submittedAt: string;
      approvalExpiresAt: string | null;
    }
  >();

  for (const row of rows) {
    const existing = grouped.get(row.student_id);
    const className = classMap[row.class_id] || row.class_id;
    const student = studentMap[row.student_id];
    const studentName = student?.display_name || student?.email || row.student_id;
    const studentEmail = student?.email || row.student_id;

    if (!existing) {
      grouped.set(row.student_id, {
        studentId: row.student_id,
        studentName,
        studentEmail,
        classNames: [className],
        submittedAt: row.enrolled_at,
        approvalExpiresAt: row.approval_expires_at,
      });
      continue;
    }

    if (!existing.classNames.includes(className)) {
      existing.classNames.push(className);
    }
    if (row.enrolled_at < existing.submittedAt) {
      existing.submittedAt = row.enrolled_at;
    }
    if (
      row.approval_expires_at &&
      (!existing.approvalExpiresAt || row.approval_expires_at < existing.approvalExpiresAt)
    ) {
      existing.approvalExpiresAt = row.approval_expires_at;
    }
  }

  const items = [...grouped.values()]
    .map((group) => ({
      studentId: group.studentId,
      studentName: group.studentName,
      studentEmail: group.studentEmail,
      classesText: group.classNames.join(", "),
      classCount: group.classNames.length,
      submittedAt: group.submittedAt,
      approvalExpiresAt: group.approvalExpiresAt,
    }))
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  return (
    <SectionCard
      title="Pending Approvals"
      description="Review enrollment submissions from families who selected Already Paid."
    >
      <AdminPendingApprovalsManager items={items} />
    </SectionCard>
  );
}
