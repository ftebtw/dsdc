import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendPortalEmail } from "@/lib/email/send";
import { referralCreditTemplate } from "@/lib/email/templates";
import { requireApiRole } from "@/lib/portal/auth";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  referralId: z.string().uuid(),
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function makePromoCodeSeed(referrerId: string, referralId: string): string {
  const a = referrerId.replace(/-/g, "").slice(0, 4).toUpperCase();
  const b = referralId.replace(/-/g, "").slice(0, 4).toUpperCase();
  const c = Date.now().toString().slice(-4);
  return `REF-${a}${b}${c}`;
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ["admin"]);
  if (!session) return jsonError("Unauthorized", 401);

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid request payload.");

  const { referralId } = parsed.data;
  const admin = getSupabaseAdminClient();

  const { data: selectedReferral } = await admin
    .from("referrals")
    .select("id,referrer_id,status,referrer:profiles!referrals_referrer_id_fkey(email,display_name)")
    .eq("id", referralId)
    .maybeSingle();

  if (!selectedReferral || selectedReferral.status !== "converted") {
    return jsonError("Referral not found or not ready for credit issuance.", 404);
  }

  const { data: pendingConvertedRows } = await admin
    .from("referrals")
    .select("id,credit_amount_cad")
    .eq("referrer_id", selectedReferral.referrer_id)
    .eq("status", "converted");

  const pendingRows = (pendingConvertedRows ?? []) as Array<{ id: string; credit_amount_cad: number | null }>;
  if (pendingRows.length === 0) {
    return jsonError("No converted referrals available for this referrer.", 400);
  }

  const totalCreditCad = pendingRows.reduce((sum, row) => {
    const value = Number(row.credit_amount_cad ?? 0);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  if (totalCreditCad <= 0) {
    return jsonError("Referral credit amount is invalid.", 400);
  }

  const stripe = getStripeClient();

  const coupon = await stripe.coupons.create({
    amount_off: Math.round(totalCreditCad * 100),
    currency: "cad",
    duration: "once",
    max_redemptions: 1,
    name: `Referral Credit ${selectedReferral.referrer_id.slice(0, 8)}`,
  });

  const promoCode = await stripe.promotionCodes.create({
    promotion: {
      type: "coupon",
      coupon: coupon.id,
    },
    code: makePromoCodeSeed(selectedReferral.referrer_id, referralId),
    max_redemptions: 1,
  });

  const creditedAt = new Date().toISOString();
  const convertedIds = pendingRows.map((row) => row.id);

  await admin
    .from("referrals")
    .update({
      status: "credited",
      stripe_promo_code_id: promoCode.id,
      stripe_promo_code: promoCode.code,
      credited_at: creditedAt,
    })
    .in("id", convertedIds);

  const referrerEmail = selectedReferral.referrer?.email;
  if (referrerEmail) {
    const { html, text } = referralCreditTemplate({
      referrerName:
        selectedReferral.referrer?.display_name || selectedReferral.referrer?.email || "DSDC Member",
      creditAmount: totalCreditCad,
      promoCode: promoCode.code,
    });

    await sendPortalEmail({
      to: referrerEmail,
      subject: `You earned ${new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(totalCreditCad)} referral credit!`,
      html,
      text,
    });
  }

  return NextResponse.json({
    ok: true,
    promoCode: promoCode.code,
    creditedAmountCad: totalCreditCad,
    creditedReferrals: convertedIds.length,
  });
}

