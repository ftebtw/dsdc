import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleCheckoutSessionCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 20,
    expand: ["data.price.product"],
  });

  const items = lineItems.data.map((item) => {
    const product = item.price?.product;
    const expandedProduct =
      typeof product !== "string" && product && !product.deleted ? product : null;
    const productName = expandedProduct?.name;
    const tier = expandedProduct?.metadata?.tier;

    return {
      description: item.description,
      quantity: item.quantity ?? 0,
      amountSubtotal: item.amount_subtotal,
      amountTotal: item.amount_total,
      priceId: item.price?.id,
      productName,
      tier,
    };
  });

  const payload = {
    eventType: "checkout.session.completed",
    sessionId: session.id,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
    amountTotal: session.amount_total,
    currency: session.currency,
    paymentStatus: session.payment_status,
    items,
  };

  console.log("[stripe-webhook]", JSON.stringify(payload));
}

export async function POST(request: NextRequest) {
  const stripeSignature = request.headers.get("stripe-signature");
  if (!stripeSignature) {
    return NextResponse.json({ error: "Missing Stripe signature header." }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error("Missing required env var: STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 500 });
  }

  const rawBody = await request.text();
  let stripe: Stripe;
  try {
    stripe = getStripeClient();
  } catch (error) {
    console.error("Stripe webhook client init failed:", error);
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, stripeSignature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutSessionCompleted(stripe, event.data.object as Stripe.Checkout.Session);
    }
  } catch (error) {
    console.error("Stripe webhook handler failed:", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
