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
  return cadAmount * (rates[currency] ?? 1);
}

export function formatDisplayPrice(
  amount: number,
  currency: SupportedCurrency,
  locale: "en" | "zh"
): string {
  const currencyCode = currency === "RMB" ? "CNY" : currency;
  const minimumFractionDigits = currency === "USD" ? 2 : 0;
  const maximumFractionDigits = currency === "USD" ? 2 : 0;

  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-CA", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
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
