import { NextResponse } from "next/server";
import { BASE_FX_FALLBACK, type SupportedCurrency } from "@/lib/pricing";

type RatePayload = {
  rates: Record<SupportedCurrency, number>;
  source: "live" | "cache" | "fallback";
  lastUpdated: string;
};

const FX_URL = "https://open.er-api.com/v6/latest/CAD";
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

let cachedPayload: RatePayload | null = null;
let cachedAt = 0;

async function fetchLiveRates(): Promise<RatePayload | null> {
  try {
    const res = await fetch(FX_URL, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    const usdRate = Number(data?.rates?.USD);
    const rmbRate = Number(data?.rates?.CNY);
    if (!Number.isFinite(usdRate) || !Number.isFinite(rmbRate)) return null;

    return {
      rates: {
        CAD: 1,
        USD: usdRate,
        RMB: rmbRate,
      },
      source: "live",
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[fx-rates] live fetch failed", err);
    return null;
  }
}

export async function GET() {
  const now = Date.now();

  if (cachedPayload && now - cachedAt < CACHE_TTL_MS) {
    return NextResponse.json({ ...cachedPayload, source: "cache" as const });
  }

  const liveRates = await fetchLiveRates();
  if (liveRates) {
    cachedPayload = liveRates;
    cachedAt = now;
    return NextResponse.json(liveRates);
  }

  if (cachedPayload) {
    return NextResponse.json({ ...cachedPayload, source: "cache" as const });
  }

  return NextResponse.json({
    rates: BASE_FX_FALLBACK,
    source: "fallback",
    lastUpdated: new Date().toISOString(),
  } satisfies RatePayload);
}
