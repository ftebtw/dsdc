import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { isAllowedPriceId } from "@/lib/stripe-prices";

export const runtime = "nodejs";

type CheckoutPayload = {
  priceId?: unknown;
  locale?: unknown;
  customerEmail?: unknown;
};

type SupportedCheckoutLocale = "en" | "zh";

function isValidLocale(value: unknown): value is SupportedCheckoutLocale {
  return value === "en" || value === "zh";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  let body: CheckoutPayload;
  try {
    body = (await request.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const priceId = typeof body.priceId === "string" ? body.priceId.trim() : "";
  const locale = isValidLocale(body.locale) ? body.locale : "auto";
  const customerEmail =
    typeof body.customerEmail === "string" ? body.customerEmail.trim() : undefined;

  let allowedPriceId = false;
  try {
    allowedPriceId = Boolean(priceId) && isAllowedPriceId(priceId);
  } catch (error) {
    console.error("Stripe price env configuration error:", error);
    return NextResponse.json({ error: "Stripe price IDs are not configured." }, { status: 500 });
  }

  if (!allowedPriceId) {
    return NextResponse.json({ error: "Invalid price ID." }, { status: 400 });
  }

  if (customerEmail && !isValidEmail(customerEmail)) {
    return NextResponse.json({ error: "Invalid customer email." }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const successLocaleParam = locale === "auto" ? "en" : locale;

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    automatic_tax: { enabled: true },
    billing_address_collection: "required",
    allow_promotion_codes: true,
    customer_creation: "always",
    locale,
    success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&lang=${successLocaleParam}`,
    cancel_url: `${origin}/pricing`,
  };

  if (customerEmail) {
    params.customer_email = customerEmail;
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create(params);
    if (!session.url) {
      return NextResponse.json({ error: "Checkout session URL was not returned." }, { status: 500 });
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error);
    return NextResponse.json({ error: "Unable to start checkout right now." }, { status: 500 });
  }
}
