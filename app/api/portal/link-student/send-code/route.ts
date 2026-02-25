import { randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getRequestSessionProfile } from "@/lib/portal/auth";
import { sendPortalEmail } from "@/lib/email/send";
import { linkVerificationCodeTemplate } from "@/lib/email/templates";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { mergeCookies } from "@/lib/supabase/route";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function generateCode(): string {
  return String(randomInt(100000, 1000000));
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0] ?? "*"}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

export async function POST(request: NextRequest) {
  const supabaseResponse = NextResponse.next();
  const session = await getRequestSessionProfile(request);
  if (!session || session.profile.role !== "parent") {
    return mergeCookies(supabaseResponse, jsonError("Unauthorized", 401));
  }

  const body = (await request.json()) as { studentEmail?: string };
  const studentEmail = body.studentEmail?.trim().toLowerCase();

  if (!studentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
    return mergeCookies(supabaseResponse, jsonError("Please enter a valid email address."));
  }

  const admin = getSupabaseAdminClient();

  const { data: studentProfile } = await admin
    .from("profiles")
    .select("id,role,email,display_name")
    .ilike("email", studentEmail)
    .maybeSingle();

  if (!studentProfile) {
    return mergeCookies(
      supabaseResponse,
      jsonError("No student account found with that email. The student needs to create an account first.")
    );
  }

  if (studentProfile.role !== "student") {
    return mergeCookies(
      supabaseResponse,
      jsonError("That email belongs to a non-student account and cannot be linked.")
    );
  }

  const { data: existingLink } = await admin
    .from("parent_student_links")
    .select("id")
    .eq("parent_id", session.userId)
    .eq("student_id", studentProfile.id)
    .maybeSingle();

  if (existingLink) {
    return mergeCookies(supabaseResponse, jsonError("This student is already linked to your account."));
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("link_verification_codes")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", session.userId)
    .gt("created_at", oneHourAgo)
    .is("verified_at", null);

  if ((count ?? 0) >= 3) {
    return mergeCookies(
      supabaseResponse,
      jsonError("Too many verification attempts. Please wait before trying again.")
    );
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const { error: insertError } = await admin.from("link_verification_codes").insert({
    parent_id: session.userId,
    student_email: studentProfile.email.toLowerCase(),
    student_id: studentProfile.id,
    code,
    expires_at: expiresAt,
  });

  if (insertError) {
    console.error("[link-student/send-code] Insert failed:", insertError);
    return mergeCookies(supabaseResponse, jsonError("Could not generate verification code.", 500));
  }

  const parentName = session.profile.display_name || session.profile.email || "A parent";
  const template = linkVerificationCodeTemplate({
    parentName,
    code,
  });

  const emailResult = await sendPortalEmail({
    to: studentProfile.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  if (!emailResult.ok) {
    console.error("[link-student/send-code] Email send failed:", emailResult.error);
    return mergeCookies(
      supabaseResponse,
      jsonError("Could not send verification email. Please try again later.", 500)
    );
  }

  return mergeCookies(
    supabaseResponse,
    NextResponse.json({
      ok: true,
      studentName: studentProfile.display_name || studentProfile.email,
      maskedEmail: maskEmail(studentProfile.email),
    })
  );
}
