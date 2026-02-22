import Link from "next/link";
import type Stripe from "stripe";
import en from "@/messages/en.json";
import zh from "@/messages/zh.json";
import { getStripeClient } from "@/lib/stripe";
import { getCmsMessageOverrides } from "@/lib/sanity/content";

type Locale = "en" | "zh";
type GroupTierKey = "noviceIntermediate" | "publicSpeaking" | "wsc" | "advanced";

const dictionaries = { en, zh };

interface Props {
  searchParams: Promise<{ session_id?: string; lang?: string }>;
}

function resolveLocale(value: string | undefined): Locale {
  return value === "zh" ? "zh" : "en";
}

function isGroupTierKey(value: string | undefined): value is GroupTierKey {
  return value === "noviceIntermediate" || value === "publicSpeaking" || value === "wsc" || value === "advanced";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (Array.isArray(value)) {
      merged[key] = value;
      continue;
    }
    const current = merged[key];
    if (isObject(current) && isObject(value)) {
      merged[key] = deepMerge(current, value);
      continue;
    }
    merged[key] = value;
  }
  return merged;
}

function formatAmount(amount: number, currency: string, locale: Locale): string {
  const normalizedCurrency = currency.toUpperCase();
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-CA", {
    style: "currency",
    currency: normalizedCurrency,
  }).format(amount / 100);
}

async function loadReceiptUrl(stripe: Stripe, session: Stripe.Checkout.Session): Promise<string | null> {
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!paymentIntentId) {
    return null;
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["latest_charge"],
  });
  const latestCharge = paymentIntent.latest_charge;

  if (!latestCharge || typeof latestCharge === "string") {
    return null;
  }

  return latestCharge.receipt_url ?? null;
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const locale = resolveLocale(params.lang);
  const cmsResult = await getCmsMessageOverrides({ draft: false });
  const baseCopy = dictionaries[locale] as unknown as Record<string, unknown>;
  const cmsOverride = (cmsResult.source === "live"
    ? cmsResult.overrides[locale]
    : {}) as Record<string, unknown>;
  const copy = deepMerge(baseCopy, cmsOverride) as typeof en;
  const sessionId = params.session_id;

  if (!sessionId) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-4 py-20 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-xl w-full rounded-2xl border border-warm-200 bg-white dark:bg-navy-800 p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-navy-800 dark:text-white mb-3">{copy.paymentSuccess.title}</h1>
          <p className="text-charcoal/70 dark:text-navy-200">{copy.paymentSuccess.subtitle}</p>
          <Link
            href="/"
            className="inline-block mt-8 px-6 py-3 rounded-lg bg-gold-300 text-navy-900 font-semibold hover:bg-gold-200 transition-colors"
          >
            {copy.paymentSuccess.backHome}
          </Link>
        </div>
      </section>
    );
  }

  let stripe: Stripe;
  try {
    stripe = getStripeClient();
  } catch (error) {
    console.error("Stripe client init failed:", error);
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-4 py-20 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-xl w-full rounded-2xl border border-warm-200 bg-white dark:bg-navy-800 p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-navy-800 dark:text-white mb-3">{copy.paymentSuccess.title}</h1>
          <p className="text-charcoal/70 dark:text-navy-200">{copy.paymentSuccess.subtitle}</p>
          <Link
            href="/"
            className="inline-block mt-8 px-6 py-3 rounded-lg bg-gold-300 text-navy-900 font-semibold hover:bg-gold-200 transition-colors"
          >
            {copy.paymentSuccess.backHome}
          </Link>
        </div>
      </section>
    );
  }

  let session: Stripe.Checkout.Session;
  let lineItems: Stripe.ApiList<Stripe.LineItem>;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
    lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
      limit: 20,
      expand: ["data.price.product"],
    });
  } catch (error) {
    console.error("Unable to retrieve Stripe checkout session:", error);
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-4 py-20 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-xl w-full rounded-2xl border border-warm-200 bg-white dark:bg-navy-800 p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-navy-800 dark:text-white mb-3">{copy.paymentSuccess.title}</h1>
          <p className="text-charcoal/70 dark:text-navy-200">{copy.paymentSuccess.subtitle}</p>
          <Link
            href="/"
            className="inline-block mt-8 px-6 py-3 rounded-lg bg-gold-300 text-navy-900 font-semibold hover:bg-gold-200 transition-colors"
          >
            {copy.paymentSuccess.backHome}
          </Link>
        </div>
      </section>
    );
  }

  const firstItem = lineItems.data[0];
  const product = firstItem?.price?.product;
  const expandedProduct =
    typeof product !== "string" && product && !product.deleted ? product : null;
  const metadataTier = expandedProduct?.metadata?.tier;

  let classTierLabel =
    firstItem?.description ||
    expandedProduct?.name ||
    "-";

  if (isGroupTierKey(metadataTier)) {
    classTierLabel = copy.pricingPage[metadataTier];
  }

  const amountPaid =
    typeof session.amount_total === "number" && session.currency
      ? formatAmount(session.amount_total, session.currency, locale)
      : "-";

  let receiptUrl: string | null = null;
  try {
    receiptUrl = await loadReceiptUrl(stripe, session);
  } catch (error) {
    console.error("Failed to load Stripe receipt URL:", error);
  }

  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4 py-20 bg-warm-100 dark:bg-navy-900/50">
      <div className="max-w-xl w-full rounded-2xl border border-warm-200 bg-white dark:bg-navy-800 p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-navy-800 dark:text-white">{copy.paymentSuccess.title}</h1>
        <p className="mt-2 text-charcoal/70 dark:text-navy-200">{copy.paymentSuccess.subtitle}</p>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-warm-100 dark:bg-navy-900/40 px-4 py-3">
            <span className="text-sm text-charcoal/70 dark:text-navy-200">{copy.paymentSuccess.amountPaid}</span>
            <span className="font-semibold text-navy-900 dark:text-white">{amountPaid}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-warm-100 dark:bg-navy-900/40 px-4 py-3">
            <span className="text-sm text-charcoal/70 dark:text-navy-200">{copy.paymentSuccess.classTier}</span>
            <span className="font-semibold text-navy-900 dark:text-white text-right">{classTierLabel}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {receiptUrl ? (
            <a
              href={receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block px-5 py-3 rounded-lg border border-gold-300 text-navy-900 dark:text-white font-semibold hover:bg-gold-50 dark:hover:bg-navy-700 transition-colors"
            >
              {copy.paymentSuccess.receipt}
            </a>
          ) : null}
          <Link
            href="/"
            className="inline-block px-5 py-3 rounded-lg bg-gold-300 text-navy-900 font-semibold hover:bg-gold-200 transition-colors"
          >
            {copy.paymentSuccess.backHome}
          </Link>
        </div>
      </div>
    </section>
  );
}
