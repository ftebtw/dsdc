import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { getSpecialProgramPriceId } from "@/lib/stripe-prices";

export const runtime = "nodejs";

type Locale = Stripe.Checkout.SessionCreateParams.Locale;

function isLocale(value: unknown): value is "en" | "zh" {
  return value === "en" || value === "zh";
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  let body: { locale?: unknown; customerEmail?: unknown } = {};
  try {
    body = (await request.json()) ?? {};
  } catch {
    body = {};
  }

  const priceId = getSpecialProgramPriceId("wscGlobals");
  if (!priceId) {
    return jsonError("WSC Globals checkout is not configured.", 500);
  }

  const locale: Locale = isLocale(body.locale) ? body.locale : "auto";
  const customerEmail =
    typeof body.customerEmail === "string" && body.customerEmail.includes("@")
      ? body.customerEmail.trim()
      : undefined;

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
    metadata: {
      program: "wsc_globals",
    },
  };

  if (customerEmail) {
    params.customer_email = customerEmail;
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create(params);
    if (!session.url) {
      return jsonError("Checkout session URL was not returned.", 500);
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout-wsc-globals] Stripe session creation failed", error);
    return jsonError("Unable to start checkout right now.", 500);
  }
}
