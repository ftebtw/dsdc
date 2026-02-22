#!/usr/bin/env node
import Stripe from "stripe";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type TierSeed = {
  key: "noviceIntermediate" | "publicSpeaking" | "wsc" | "advanced";
  envVar:
    | "STRIPE_PRICE_NOVICE_INTERMEDIATE"
    | "STRIPE_PRICE_PUBLIC_SPEAKING"
    | "STRIPE_PRICE_WSC"
    | "STRIPE_PRICE_ADVANCED";
  productName: string;
  amountCadCents: number;
};

const SESSIONS_PER_TERM = 13;

const tiers: TierSeed[] = [
  {
    key: "noviceIntermediate",
    envVar: "STRIPE_PRICE_NOVICE_INTERMEDIATE",
    productName: "Novice & Intermediate Debate",
    amountCadCents: 39000,
  },
  {
    key: "publicSpeaking",
    envVar: "STRIPE_PRICE_PUBLIC_SPEAKING",
    productName: "Public Speaking",
    amountCadCents: 39000,
  },
  {
    key: "wsc",
    envVar: "STRIPE_PRICE_WSC",
    productName: "World Scholar's Cup",
    amountCadCents: 52000,
  },
  {
    key: "advanced",
    envVar: "STRIPE_PRICE_ADVANCED",
    productName: "Advanced Debate",
    amountCadCents: 65000,
  },
];

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const raw = readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key] && value) {
      process.env[key] = value;
    }
  }
}

async function findOrCreateProduct(stripe: Stripe, tier: TierSeed): Promise<Stripe.Product> {
  let startingAfter: string | undefined;

  while (true) {
    const products = await stripe.products.list({
      limit: 100,
      starting_after: startingAfter,
    });

    for (const product of products.data) {
      if (product.metadata?.tier === tier.key) {
        return product;
      }
    }

    if (!products.has_more || products.data.length === 0) {
      break;
    }

    startingAfter = products.data[products.data.length - 1]?.id;
  }

  return stripe.products.create({
    name: tier.productName,
    metadata: {
      tier: tier.key,
      unit: "term",
      sessions_per_term: String(SESSIONS_PER_TERM),
    },
  });
}

async function findOrCreatePrice(stripe: Stripe, tier: TierSeed, productId: string): Promise<Stripe.Price> {
  let startingAfter: string | undefined;

  while (true) {
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 100,
      starting_after: startingAfter,
    });

    for (const price of prices.data) {
      if (
        price.currency === "cad" &&
        price.type === "one_time" &&
        price.unit_amount === tier.amountCadCents
      ) {
        return price;
      }
    }

    if (!prices.has_more || prices.data.length === 0) {
      break;
    }

    startingAfter = prices.data[prices.data.length - 1]?.id;
  }

  return stripe.prices.create({
    currency: "cad",
    unit_amount: tier.amountCadCents,
    product: productId,
    metadata: {
      tier: tier.key,
      unit: "term",
      sessions_per_term: String(SESSIONS_PER_TERM),
    },
  });
}

async function main() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const root = join(scriptDir, "..");
  loadEnvFile(join(root, ".env.local"));
  loadEnvFile(join(root, ".env"));

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("Missing STRIPE_SECRET_KEY. Add it to .env.local before running this script.");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-01-28.clover",
  });

  console.log("Seeding Stripe products and prices...");
  const outputLines: string[] = [];

  for (const tier of tiers) {
    const product = await findOrCreateProduct(stripe, tier);
    const price = await findOrCreatePrice(stripe, tier, product.id);

    console.log(
      `- ${tier.productName}: ${(tier.amountCadCents / 100).toFixed(2)} CAD per term -> ${price.id}`
    );
    outputLines.push(`${tier.envVar}=${price.id}`);
  }

  console.log("\nCopy these into your environment:");
  for (const line of outputLines) {
    console.log(line);
  }
}

main().catch((error) => {
  console.error("Stripe seed failed:", error);
  process.exit(1);
});
