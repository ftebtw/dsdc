import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { randomInt } from "crypto";

const CODE_PREFIX = "DSDC";
const CODE_LENGTH = 6;
export const CREDIT_AMOUNT_CAD = 50;

function randomReferralCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    suffix += alphabet[randomInt(0, alphabet.length)] ?? "A";
  }
  return `${CODE_PREFIX}-${suffix}`;
}

/**
 * Get or create a permanent referral code for a user.
 */
export async function getOrCreateReferralCode(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data: existing } = await supabase
    .from("referral_codes")
    .select("code")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.code) return existing.code;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = randomReferralCode();
    const { data: created, error } = await supabase
      .from("referral_codes")
      .insert({ user_id: userId, code })
      .select("code")
      .maybeSingle();

    if (!error && created?.code) {
      return created.code;
    }

    // If another request created this user's code concurrently, return it.
    const { data: retry } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", userId)
      .maybeSingle();
    if (retry?.code) return retry.code;
  }

  throw new Error("Failed to create referral code.");
}

