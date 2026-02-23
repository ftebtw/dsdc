import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const previewSchema = z.object({
  userId: z.string().uuid(),
});

const deleteSchema = z.object({
  userId: z.string().uuid(),
  confirmName: z.string().min(1).max(200),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function normalizeName(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

async function loadProfile(admin: any, userId: string) {
  const { data, error } = await admin
    .from("profiles")
    .select("id,email,display_name,role")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as { id: string; email: string; display_name: string | null; role: string } | null;
}

async function validateDeleteGuards(input: {
  sessionUserId: string;
  profile: { id: string; role: string } | null;
}) {
  if (!input.profile) return jsonError("User profile not found.", 404);
  if (input.profile.id === input.sessionUserId) {
    return jsonError("Cannot delete your own account.", 400);
  }
  if (input.profile.role === "admin") {
    return jsonError("Cannot delete admin accounts through this interface.", 400);
  }
  return null;
}

type Impact = {
  activeEnrollments: number;
  assignedClasses: string[];
  attendanceRecords: number;
  reportCardsWritten: number;
  privateSessions: number;
  linkedUsers: string[];
  legalSignatures: number;
};

async function buildImpact(admin: any, profile: { id: string; role: string }): Promise<Impact> {
  const userId = profile.id;
  const [
    activeEnrollmentsResult,
    assignedClassesResult,
    attendanceResult,
    reportCardsResult,
    privateSessionsResult,
    linksByParentResult,
    linksByStudentResult,
    legalSignaturesResult,
  ] = await Promise.all([
    admin
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("student_id", userId)
      .in("status", ["active", "pending_etransfer", "etransfer_sent", "pending_approval"]),
    admin.from("classes").select("name").eq("coach_id", userId).order("name", { ascending: true }),
    admin.from("attendance_records").select("id", { count: "exact", head: true }).eq("marked_by", userId),
    admin.from("report_cards").select("id", { count: "exact", head: true }).eq("written_by", userId),
    admin
      .from("private_sessions")
      .select("id", { count: "exact", head: true })
      .or(`student_id.eq.${userId},coach_id.eq.${userId}`)
      .in("status", [
        "pending",
        "rescheduled_by_coach",
        "rescheduled_by_student",
        "coach_accepted",
        "awaiting_payment",
        "confirmed",
      ]),
    admin.from("parent_student_links").select("student_id").eq("parent_id", userId),
    admin.from("parent_student_links").select("parent_id").eq("student_id", userId),
    admin.from("legal_signatures").select("id", { count: "exact", head: true }).eq("signer_id", userId),
  ]);

  const errors = [
    activeEnrollmentsResult.error,
    assignedClassesResult.error,
    attendanceResult.error,
    reportCardsResult.error,
    privateSessionsResult.error,
    linksByParentResult.error,
    linksByStudentResult.error,
    legalSignaturesResult.error,
  ].filter(Boolean);
  if (errors.length > 0) {
    throw new Error(errors[0].message);
  }

  const studentIds =
    ((linksByParentResult.data ?? []) as Array<{ student_id: string | null }>)
      .map((row) => row.student_id)
      .filter((value): value is string => Boolean(value));
  const parentIds =
    ((linksByStudentResult.data ?? []) as Array<{ parent_id: string | null }>)
      .map((row) => row.parent_id)
      .filter((value): value is string => Boolean(value));

  const relatedProfileIds = [...new Set([...studentIds, ...parentIds])];
  const relatedProfilesResult = relatedProfileIds.length
    ? await admin
        .from("profiles")
        .select("id,display_name,email,role")
        .in("id", relatedProfileIds)
    : { data: [], error: null };
  if (relatedProfilesResult.error) {
    throw new Error(relatedProfilesResult.error.message);
  }

  const relatedProfileMap = new Map(
    ((relatedProfilesResult.data ?? []) as Array<{
      id: string;
      display_name: string | null;
      email: string;
      role: string;
    }>).map((row) => [row.id, row])
  );

  const linkedUsers: string[] = [];
  for (const studentId of studentIds) {
    const student = relatedProfileMap.get(studentId);
    if (!student) continue;
    linkedUsers.push(`Student: ${student.display_name || student.email}`);
  }
  for (const parentId of parentIds) {
    const parent = relatedProfileMap.get(parentId);
    if (!parent) continue;
    linkedUsers.push(`Parent: ${parent.display_name || parent.email}`);
  }

  return {
    activeEnrollments: activeEnrollmentsResult.count ?? 0,
    assignedClasses: ((assignedClassesResult.data ?? []) as Array<{ name: string }>).map((row) => row.name),
    attendanceRecords: attendanceResult.count ?? 0,
    reportCardsWritten: reportCardsResult.count ?? 0,
    privateSessions: privateSessionsResult.count ?? 0,
    linkedUsers,
    legalSignatures: legalSignaturesResult.count ?? 0,
  };
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = previewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid request payload.");

  const admin = getSupabaseAdminClient();
  try {
    const profile = await loadProfile(admin, parsed.data.userId);
    const guardError = await validateDeleteGuards({
      sessionUserId: session.userId,
      profile,
    });
    if (guardError) return guardError;
    if (!profile) return jsonError("User profile not found.", 404);

    const impact = await buildImpact(admin, profile);
    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        role: profile.role,
      },
      impact,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load delete impact.";
    return jsonError(message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid request payload.");

  const admin = getSupabaseAdminClient();
  try {
    const profile = await loadProfile(admin, parsed.data.userId);
    const guardError = await validateDeleteGuards({
      sessionUserId: session.userId,
      profile,
    });
    if (guardError) return guardError;
    if (!profile) return jsonError("User profile not found.", 404);

    const expectedName = profile.display_name?.trim() || profile.email.trim();
    if (normalizeName(parsed.data.confirmName) !== normalizeName(expectedName)) {
      return jsonError(`Name confirmation did not match "${expectedName}".`, 400);
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(profile.id);
    if (deleteError) return jsonError(deleteError.message, 500);

    console.log("[admin-delete-user]", {
      adminUserId: session.userId,
      deletedUserId: profile.id,
      deletedRole: profile.role,
      deletedEmail: profile.email,
      at: new Date().toISOString(),
    });

    return NextResponse.json({
      deleted: true,
      userId: profile.id,
      displayName: profile.display_name || profile.email,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete user.";
    return jsonError(message, 500);
  }
}
