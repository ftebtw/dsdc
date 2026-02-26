import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { CREDIT_AMOUNT_CAD } from "@/lib/portal/referral";

export async function convertFirstRegisteredReferral(
  supabase: SupabaseClient<Database>,
  referredProfileIds: Array<string | null | undefined>
): Promise<string | null> {
  const candidates = [...new Set(referredProfileIds.filter(Boolean) as string[])];

  for (const profileId of candidates) {
    const { data: referral } = await supabase
      .from("referrals")
      .select("id")
      .eq("referred_student_id", profileId)
      .eq("status", "registered")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!referral) continue;

    await supabase
      .from("referrals")
      .update({
        status: "converted",
        credit_amount_cad: CREDIT_AMOUNT_CAD,
        converted_at: new Date().toISOString(),
      })
      .eq("id", referral.id)
      .eq("status", "registered");

    return referral.id;
  }

  return null;
}

