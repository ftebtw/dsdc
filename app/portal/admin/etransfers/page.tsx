import AdminEtransferManager from "@/app/portal/_components/AdminEtransferManager";
import SectionCard from "@/app/portal/_components/SectionCard";
import { requireRole } from "@/lib/portal/auth";
import { getCadPriceForClassType, getProratedCadPrice } from "@/lib/portal/class-pricing";
import { SESSIONS_PER_TERM } from "@/lib/pricing";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type ClassType = Database["public"]["Enums"]["class_type"];

export default async function AdminEtransfersPage() {
  await requireRole(["admin"]);
  const supabase = await getSupabaseServerClient();

  const { data: rowsData } = await supabase
    .from("enrollments")
    .select("id,student_id,class_id,status,enrolled_at,etransfer_expires_at,etransfer_sent_at,etransfer_token")
    .in("status", ["pending_etransfer", "etransfer_sent"])
    .order("enrolled_at", { ascending: false });

  const rows = (rowsData ?? []) as Array<{
    id: string;
    student_id: string;
    class_id: string;
    status: "pending_etransfer" | "etransfer_sent";
    enrolled_at: string;
    etransfer_expires_at: string | null;
    etransfer_sent_at: string | null;
    etransfer_token: string | null;
  }>;

  const studentIds = [...new Set(rows.map((row) => row.student_id))];
  const classIds = [...new Set(rows.map((row) => row.class_id))];
  const [{ data: studentRowsData }, { data: classRowsData }] = await Promise.all([
    studentIds.length
      ? supabase.from("profiles").select("id,email,display_name").in("id", studentIds)
      : Promise.resolve({ data: [] as Array<{ id: string; email: string; display_name: string | null }> }),
    classIds.length
      ? supabase.from("classes").select("id,name,type,term_id").in("id", classIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string; type: ClassType; term_id: string }> }),
  ]);

  const studentRows = (studentRowsData ?? []) as Array<{
    id: string;
    email: string;
    display_name: string | null;
  }>;
  const classRowsTyped = (classRowsData ?? []) as Array<{
    id: string;
    name: string;
    type: ClassType;
    term_id: string;
  }>;
  const termIds = [...new Set(classRowsTyped.map((row) => row.term_id))];
  const { data: termRowsData } =
    termIds.length > 0
      ? await supabase.from("terms").select("id,end_date,weeks").in("id", termIds)
      : { data: [] as Array<{ id: string; end_date: string; weeks: number | null }> };
  const termsById = new Map(
    ((termRowsData ?? []) as Array<{ id: string; end_date: string; weeks: number | null }>).map((row) => [
      row.id,
      row,
    ])
  );

  const studentMap = Object.fromEntries(studentRows.map((row) => [row.id, row])) as Record<
    string,
    { id: string; email: string; display_name: string | null }
  >;
  const classMap = Object.fromEntries(classRowsTyped.map((row) => [row.id, row])) as Record<
    string,
    { id: string; name: string; type: ClassType; term_id: string }
  >;

  const groups = new Map<
    string,
    {
      studentId: string;
      token: string;
      classIds: string[];
      statuses: Array<"pending_etransfer" | "etransfer_sent">;
      reservedAt: string;
      expiresAt: string | null;
      sentAt: string | null;
    }
  >();

  for (const row of rows) {
    if (!row.etransfer_token) continue;
    const key = `${row.student_id}:${row.etransfer_token}`;
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, {
        studentId: row.student_id,
        token: row.etransfer_token,
        classIds: [row.class_id],
        statuses: [row.status],
        reservedAt: row.enrolled_at,
        expiresAt: row.etransfer_expires_at,
        sentAt: row.etransfer_sent_at,
      });
      continue;
    }
    if (!existing.classIds.includes(row.class_id)) existing.classIds.push(row.class_id);
    existing.statuses.push(row.status);
    if (row.enrolled_at < existing.reservedAt) existing.reservedAt = row.enrolled_at;
    if (row.etransfer_expires_at && (!existing.expiresAt || row.etransfer_expires_at > existing.expiresAt)) {
      existing.expiresAt = row.etransfer_expires_at;
    }
    if (row.etransfer_sent_at && (!existing.sentAt || row.etransfer_sent_at > existing.sentAt)) {
      existing.sentAt = row.etransfer_sent_at;
    }
  }

  const items = [...groups.values()]
    .map((group) => {
      const classes = group.classIds
        .map((id) => classMap[id])
        .filter(Boolean)
        .map((classRow) => classRow.name);
      const totalAmountCad = group.classIds
        .map((id) => classMap[id])
        .filter(Boolean)
        .reduce((sum, classRow) => {
          const term = termsById.get(classRow.term_id);
          if (!term?.end_date) return sum + getCadPriceForClassType(classRow.type);
          const totalWeeks =
            typeof term.weeks === "number" && term.weeks > 0 ? term.weeks : SESSIONS_PER_TERM;
          return sum + getProratedCadPrice(classRow.type, term.end_date, totalWeeks);
        }, 0);
      const status: "pending_etransfer" | "etransfer_sent" = group.statuses.includes("etransfer_sent")
        ? "etransfer_sent"
        : "pending_etransfer";
      const student = studentMap[group.studentId];
      return {
        studentId: group.studentId,
        token: group.token,
        studentName: student?.display_name || student?.email || group.studentId,
        studentEmail: student?.email || group.studentId,
        classesText: classes.join(", "),
        totalAmountCad,
        status,
        reservedAt: group.reservedAt,
        expiresAt: group.expiresAt,
        sentAt: group.sentAt,
      };
    })
    .sort((a, b) => (a.reservedAt < b.reservedAt ? 1 : -1));

  return (
    <SectionCard
      title="E-Transfers"
      description="Review and action pending Interac e-transfer reservation batches."
    >
      <AdminEtransferManager items={items} />
    </SectionCard>
  );
}
