import "server-only";
import { GROUP_TIERS, proratedPrice, weeksRemainingInTerm } from "@/lib/pricing";
import type { Database } from "@/lib/supabase/database.types";

type ClassType = Database["public"]["Enums"]["class_type"];

type PriceableClass = {
  type: ClassType;
  custom_price_cad: number | null;
};

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

export function getCadPriceForClass(classRow: PriceableClass): number {
  if (typeof classRow.custom_price_cad === "number" && classRow.custom_price_cad > 0) {
    return classRow.custom_price_cad;
  }
  return getCadPriceForClassType(classRow.type);
}

/**
 * Prorate a full-term price by how many weeks are left in the term.
 * Guards against a stale (expired) term billing 1/totalWeeks by mistake.
 */
function prorateForTerm(
  fullPrice: number,
  termEndDate: string,
  totalWeeks: number
): number {
  const remaining = weeksRemainingInTerm(termEndDate);
  // A term whose end date has already passed means the active term is stale,
  // not that someone is enrolling for one final week. proratedPrice() floors
  // at one week, so without this guard an expired term quietly bills
  // 1/totalWeeks of the price — at Stripe checkout too, not just on the
  // enrollment screen.
  if (remaining <= 0) return fullPrice;
  if (remaining >= totalWeeks) return fullPrice;
  return proratedPrice(fullPrice, totalWeeks, remaining);
}

/**
 * Get the prorated CAD price for a class type based on term timing.
 * Proration is a late-join discount for a term that is still running, so it
 * only applies while weeks actually remain.
 */
export function getProratedCadPrice(
  classType: ClassType,
  termEndDate: string,
  totalWeeks: number
): number {
  return prorateForTerm(getCadPriceForClassType(classType), termEndDate, totalWeeks);
}

/**
 * Prorate the class's effective full price by weeks remaining in the term.
 * Custom-priced classes (custom_price_cad set on the class row) are prorated
 * off that custom price — the admin is expressing the full-term amount when
 * they set it; the checkout charges (full / totalWeeks) × weeksRemaining.
 */
export function getProratedCadPriceForClass(
  classRow: PriceableClass,
  termEndDate: string,
  totalWeeks: number
): number {
  return prorateForTerm(getCadPriceForClass(classRow), termEndDate, totalWeeks);
}
