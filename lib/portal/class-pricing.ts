import "server-only";
import { GROUP_TIERS, proratedPrice, weeksRemainingInTerm } from "@/lib/pricing";
import type { Database } from "@/lib/supabase/database.types";

type ClassType = Database["public"]["Enums"]["class_type"];

function getTierPrice(key: "noviceIntermediate" | "publicSpeaking" | "wsc" | "advanced"): number {
  return GROUP_TIERS.find((tier) => tier.key === key)?.baseCadPrice ?? 0;
}

export function getCadPriceForClassType(classType: ClassType): number {
  if (classType === "novice_debate" || classType === "intermediate_debate") {
    return getTierPrice("noviceIntermediate");
  }
  if (classType === "public_speaking") {
    return getTierPrice("publicSpeaking");
  }
  if (classType === "wsc") {
    return getTierPrice("wsc");
  }
  return getTierPrice("advanced");
}

/**
 * Get the prorated CAD price for a class type based on term timing.
 */
export function getProratedCadPrice(
  classType: ClassType,
  termEndDate: string,
  totalWeeks: number
): number {
  const fullPrice = getCadPriceForClassType(classType);
  const remaining = weeksRemainingInTerm(termEndDate);
  if (remaining >= totalWeeks) return fullPrice;
  return proratedPrice(fullPrice, totalWeeks, remaining);
}
