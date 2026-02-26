import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/portal/auth";
import { CREDIT_AMOUNT_CAD, getOrCreateReferralCode } from "@/lib/portal/referral";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  referrerId: z.string().uuid(),
  referredEmail: z.string().email(),
  status: z.enum(["pending", "registered", "converted"]),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid payload.");

  const admin = getSupabaseAdminClient();
  const { referrerId, referredEmail, status } = parsed.data;
  const normalizedEmail = referredEmail.trim().toLowerCase();

  const { data: referrerProfile } = await admin
    .from("profiles")
    .select("id,role")
    .eq("id", referrerId)
    .in("role", ["student", "parent"])
    .maybeSingle();

  if (!referrerProfile) {
    return jsonError("Referrer must be a student or parent.", 400);
  }

  await getOrCreateReferralCode(admin, referrerId);

  const { data: refCodeRow } = await admin
    .from("referral_codes")
    .select("id")
    .eq("user_id", referrerId)
    .maybeSingle();

  if (!refCodeRow) {
    return jsonError("Could not find referral code.", 400);
  }

  const { data: existingStudent } = await admin
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .eq("role", "student")
    .maybeSingle();

  const now = new Date().toISOString();

  const { error } = await admin.from("referrals").insert({
    referrer_id: referrerId,
    referral_code_id: refCodeRow.id,
    referred_email: normalizedEmail,
    referred_student_id: existingStudent?.id || null,
    status,
    credit_amount_cad: status === "converted" ? CREDIT_AMOUNT_CAD : 0,
    registered_at: status === "registered" || status === "converted" ? now : null,
    converted_at: status === "converted" ? now : null,
  });

  if (error) {
    return jsonError(error.message, 400);
  }

  return NextResponse.json({ ok: true });
}

