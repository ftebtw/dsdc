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

export const GROUP_TIERS: GroupTier[] = [
  { key: "noviceIntermediate", baseCadPrice: 30 },
  { key: "publicSpeaking", baseCadPrice: 30 },
  { key: "wsc", baseCadPrice: 40 },
  { key: "advanced", baseCadPrice: 50 },
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
