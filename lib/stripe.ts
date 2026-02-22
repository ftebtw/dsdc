import "server-only";
import Stripe from "stripe";

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2026-01-28.clover";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("Missing required env var: STRIPE_SECRET_KEY");
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
  });

  return stripeClient;
}
