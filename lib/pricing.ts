export type SupportedCurrency = "CAD" | "USD" | "RMB";

export type GroupTierKey =
  | "noviceIntermediate"
  | "publicSpeaking"
  | "wsc"
  | "advanced";

export interface GroupTier {
  key: GroupTierKey;
  baseCadPrice: number;
}

export const SESSIONS_PER_TERM = 12;

export const GROUP_TIERS: GroupTier[] = [
  { key: "noviceIntermediate", baseCadPrice: 720 },
  { key: "publicSpeaking", baseCadPrice: 720 },
  { key: "wsc", baseCadPrice: 960 },
  { key: "advanced", baseCadPrice: 1200 },
];

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ["CAD", "USD", "RMB"];

export const BASE_FX_FALLBACK: Record<SupportedCurrency, number> = {
  CAD: 1,
  USD: 0.73,
  RMB: 5.05,
};

export function convertCadPrice(
  cadAmount: number,
  currency: SupportedCurrency,
  rates: Record<SupportedCurrency, number>
): number {
  const raw = cadAmount * (rates[currency] ?? 1);
  // Round non-CAD estimates to clean whole numbers.
  if (currency !== "CAD") return Math.round(raw);
  return raw;
}

export function formatDisplayPrice(
  amount: number,
  currency: SupportedCurrency,
  locale: "en" | "zh"
): string {
  const rounded = Math.round(amount);

  const numberStr = new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);

  switch (currency) {
    case "CAD":
      return `$${numberStr}`;
    case "USD":
      return `US$${numberStr}`;
    case "RMB":
      return `¥${numberStr}`;
    default:
      return `$${numberStr}`;
  }
}

/**
 * Calculate prorated price based on weeks remaining in the term.
 * Minimum billable amount is 1 week.
 */
export function proratedPrice(
  fullTermPrice: number,
  totalWeeks: number,
  weeksRemaining: number
): number {
  const effectiveWeeks = Math.max(1, Math.min(weeksRemaining, totalWeeks));
  return Math.round((fullTermPrice / totalWeeks) * effectiveWeeks);
}

/**
 * Calculate weeks remaining in a term from now.
 * Counts the current week as remaining if the term has not ended yet.
 */
export function weeksRemainingInTerm(termEndDate: string): number {
  const now = new Date();
  const end = new Date(`${termEndDate}T23:59:59Z`);
  if (now > end) return 0;
  const msRemaining = end.getTime() - now.getTime();
  const daysRemaining = msRemaining / (1000 * 60 * 60 * 24);
  return Math.ceil(daysRemaining / 7);
}
