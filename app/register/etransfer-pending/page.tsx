export const dynamic = 'force-dynamic';

import EtransferPendingClient from "./EtransferPendingClient";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { classTypeLabel } from "@/lib/portal/labels";
import { getCadPriceForClassType, getProratedCadPrice } from "@/lib/portal/class-pricing";
import { SESSIONS_PER_TERM } from "@/lib/pricing";
import type { Database } from "@/lib/supabase/database.types";

type ClassType = Database["public"]["Enums"]["class_type"];
type EnrollmentStatus = string;

type PendingClass = {
  id: string;
  name: string;
  typeLabel: string;
  scheduleText: string;
};

function formatSchedule(classRow: {
  schedule_day: string;
  schedule_start_time: string;
  schedule_end_time: string;
  timezone: string;
}) {
  return `${classRow.schedule_day.toUpperCase()} ${classRow.schedule_start_time.slice(0, 5)}-${classRow.schedule_end_time.slice(0, 5)} (${classRow.timezone})`;
}

export default async function EtransferPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; token?: string; lang?: string }>;
}) {
  const params = await searchParams;
  const locale = params.lang === "zh" ? "zh" : "en";
  const token = params.token?.trim() || "";
  const requestedStudentId = params.student?.trim() || "";

  if (!token) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-warm-100 via-white to-gold-50 dark:from-navy-900 dark:via-navy-800 dark:to-navy-900 pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <EtransferPendingClient
            localeHint={locale}
            state="expired"
            token={token}
            studentId={requestedStudentId}
            classes={[]}
            totalAmountCad={0}
            etransferEmail={process.env.NEXT_PUBLIC_ETRANSFER_EMAIL?.trim() || "education.dsdc@gmail.com"}
            expiresAt={null}
            sentAt={null}
          />
        </div>
      </section>
    );
  }

  const admin = getSupabaseAdminClient();
  const { data: enrollmentRows, error: enrollmentError } = await admin
    .from("enrollments")
    .select("id,student_id,class_id,status,etransfer_expires_at,etransfer_sent_at,etransfer_token")
    .eq("etransfer_token", token);

  if (enrollmentError || !enrollmentRows || enrollmentRows.length === 0) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-warm-100 via-white to-gold-50 dark:from-navy-900 dark:via-navy-800 dark:to-navy-900 pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <EtransferPendingClient
            localeHint={locale}
            state="expired"
            token={token}
            studentId={requestedStudentId}
            classes={[]}
            totalAmountCad={0}
            etransferEmail={process.env.NEXT_PUBLIC_ETRANSFER_EMAIL?.trim() || "education.dsdc@gmail.com"}
            expiresAt={null}
            sentAt={null}
          />
        </div>
      </section>
    );
  }

  const enrollmentRowsTyped = enrollmentRows as Array<{
    id: string;
    student_id: string;
    class_id: string;
    status: string;
    etransfer_expires_at: string | null;
    etransfer_sent_at: string | null;
    etransfer_token: string | null;
  }>;

  const studentId = enrollmentRowsTyped[0].student_id;
  if (requestedStudentId && requestedStudentId !== studentId) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-warm-100 via-white to-gold-50 dark:from-navy-900 dark:via-navy-800 dark:to-navy-900 pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <EtransferPendingClient
            localeHint={locale}
            state="expired"
            token={token}
            studentId={requestedStudentId}
            classes={[]}
            totalAmountCad={0}
            etransferEmail={process.env.NEXT_PUBLIC_ETRANSFER_EMAIL?.trim() || "education.dsdc@gmail.com"}
            expiresAt={null}
            sentAt={null}
          />
        </div>
      </section>
    );
  }

  const classIds = [...new Set(enrollmentRowsTyped.map((row) => row.class_id))];
  const { data: classRowsData } = await admin
    .from("classes")
    .select("id,name,type,schedule_day,schedule_start_time,schedule_end_time,timezone,term_id")
    .in("id", classIds);
  const { data: activeTerm } = await admin
    .from("terms")
    .select("id,end_date,weeks")
    .eq("is_active", true)
    .maybeSingle();

  const classRows = (classRowsData ?? []) as Array<{
    id: string;
    name: string;
    type: ClassType;
    schedule_day: string;
    schedule_start_time: string;
    schedule_end_time: string;
    timezone: string;
    term_id: string;
  }>;

  const classes: PendingClass[] = classRows.map((classRow) => ({
    id: classRow.id,
    name: classRow.name,
    typeLabel: classTypeLabel[classRow.type] || classRow.type,
    scheduleText: formatSchedule(classRow),
  }));
  const totalWeeks =
    activeTerm && typeof activeTerm.weeks === "number" && activeTerm.weeks > 0
      ? activeTerm.weeks
      : SESSIONS_PER_TERM;
  const totalAmountCad = classRows.reduce((sum, classRow) => {
    if (!activeTerm?.end_date) {
      return sum + getCadPriceForClassType(classRow.type);
    }
    return sum + getProratedCadPrice(classRow.type, activeTerm.end_date, totalWeeks);
  }, 0);

  const statusSet = new Set<EnrollmentStatus>(enrollmentRowsTyped.map((row) => row.status));
  let state: "pending" | "sent" | "expired" = "expired";
  if (statusSet.has("pending_etransfer")) {
    state = "pending";
  } else if (statusSet.has("etransfer_sent")) {
    state = "sent";
  }

  const expiresAtValues = enrollmentRowsTyped
    .map((row) => row.etransfer_expires_at)
    .filter((value): value is string => Boolean(value))
    .sort();
  const sentAtValues = enrollmentRowsTyped
    .map((row) => row.etransfer_sent_at)
    .filter((value): value is string => Boolean(value))
    .sort();

  return (
    <section className="min-h-screen bg-gradient-to-br from-warm-100 via-white to-gold-50 dark:from-navy-900 dark:via-navy-800 dark:to-navy-900 pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <EtransferPendingClient
          localeHint={locale}
          state={state}
          token={token}
          studentId={studentId}
          classes={classes}
          totalAmountCad={totalAmountCad}
          etransferEmail={process.env.NEXT_PUBLIC_ETRANSFER_EMAIL?.trim() || "education.dsdc@gmail.com"}
          expiresAt={expiresAtValues.length ? expiresAtValues[expiresAtValues.length - 1] : null}
          sentAt={sentAtValues.length ? sentAtValues[sentAtValues.length - 1] : null}
        />
      </div>
    </section>
  );
}
