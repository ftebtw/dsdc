import "server-only";
import type { GroupTierKey } from "@/lib/pricing";
import type { Database } from "@/lib/supabase/database.types";

type PriceEnvByTier = Record<GroupTierKey, string>;
export type StripePriceMap = Record<GroupTierKey, string>;
type ClassType = Database["public"]["Enums"]["class_type"];

const priceEnvByTier: PriceEnvByTier = {
  // One-time Stripe price IDs for per-term enrollment checkout.
  noviceIntermediate: "STRIPE_PRICE_NOVICE_INTERMEDIATE",
  publicSpeaking: "STRIPE_PRICE_PUBLIC_SPEAKING",
  wsc: "STRIPE_PRICE_WSC",
  advanced: "STRIPE_PRICE_ADVANCED",
};

let cachedPriceMap: StripePriceMap | null = null;

function loadStripePriceMap(): StripePriceMap {
  if (cachedPriceMap) {
    return cachedPriceMap;
  }

  const missing: string[] = [];
  const resolved = {} as StripePriceMap;

  for (const tier of Object.keys(priceEnvByTier) as GroupTierKey[]) {
    const envName = priceEnvByTier[tier];
    const value = process.env[envName]?.trim();
    if (!value) {
      missing.push(envName);
      continue;
    }
    resolved[tier] = value;
  }

  if (missing.length > 0) {
    throw new Error(`Missing Stripe price env vars: ${missing.join(", ")}`);
  }

  cachedPriceMap = resolved;
  return cachedPriceMap;
}

export function getStripePriceMap(): StripePriceMap {
  return loadStripePriceMap();
}

export function getPriceIdForTier(tier: GroupTierKey): string {
  return loadStripePriceMap()[tier];
}

export function isAllowedPriceId(priceId: string): boolean {
  return Object.values(loadStripePriceMap()).includes(priceId);
}

export function getTierForPriceId(priceId: string): GroupTierKey | null {
  const map = loadStripePriceMap();
  for (const tier of Object.keys(map) as GroupTierKey[]) {
    if (map[tier] === priceId) {
      return tier;
    }
  }
  return null;
}

export function getPriceIdForClassType(classType: ClassType): string {
  if (classType === "novice_debate" || classType === "intermediate_debate") {
    return getPriceIdForTier("noviceIntermediate");
  }
  if (classType === "public_speaking") {
    return getPriceIdForTier("publicSpeaking");
  }
  if (classType === "wsc") {
    return getPriceIdForTier("wsc");
  }
  return getPriceIdForTier("advanced");
}
