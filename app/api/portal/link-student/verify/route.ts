import { NextRequest, NextResponse } from "next/server";
import { getRequestSessionProfile } from "@/lib/portal/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { mergeCookies } from "@/lib/supabase/route";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const supabaseResponse = NextResponse.next();
  const session = await getRequestSessionProfile(request);
  if (!session || session.profile.role !== "parent") {
    return mergeCookies(supabaseResponse, jsonError("Unauthorized", 401));
  }

  const body = (await request.json()) as { code?: string; studentEmail?: string };
  const code = body.code?.trim();
  const studentEmail = body.studentEmail?.trim().toLowerCase();

  if (!code || !studentEmail) {
    return mergeCookies(supabaseResponse, jsonError("Code and student email are required."));
  }

  const admin = getSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data: verificationRow, error: fetchError } = await admin
    .from("link_verification_codes")
    .select("*")
    .eq("parent_id", session.userId)
    .eq("student_email", studentEmail)
    .eq("code", code)
    .is("verified_at", null)
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError || !verificationRow) {
    return mergeCookies(
      supabaseResponse,
      jsonError("Invalid or expired verification code. Please request a new one.")
    );
  }

  const studentId = verificationRow.student_id;
  if (!studentId) {
    return mergeCookies(supabaseResponse, jsonError("Student account not found.", 400));
  }

  await admin
    .from("link_verification_codes")
    .update({ verified_at: now })
    .eq("id", verificationRow.id);

  const { error: linkError } = await admin
    .from("parent_student_links")
    .upsert(
      { parent_id: session.userId, student_id: studentId },
      { onConflict: "parent_id,student_id" }
    );

  if (linkError) {
    console.error("[link-student/verify] Link creation failed:", linkError);
    return mergeCookies(supabaseResponse, jsonError("Could not link accounts. Please try again.", 500));
  }

  const { data: studentProfile } = await admin
    .from("profiles")
    .select("display_name,email")
    .eq("id", studentId)
    .maybeSingle();

  return mergeCookies(
    supabaseResponse,
    NextResponse.json({
      ok: true,
      studentName: studentProfile?.display_name || studentProfile?.email || studentEmail,
    })
  );
}
