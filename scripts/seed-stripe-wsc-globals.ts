#!/usr/bin/env node
import Stripe from "stripe";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PROGRAM_KEY = "wsc_globals";
const PRODUCT_NAME = "WSC Globals Training";
const AMOUNT_CAD_CENTS = 120000;
const ENV_VAR = "STRIPE_PRICE_WSC_GLOBALS";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key] && value) process.env[key] = value;
  }
}

async function findOrCreateProduct(stripe: Stripe): Promise<Stripe.Product> {
  let startingAfter: string | undefined;
  while (true) {
    const products = await stripe.products.list({ limit: 100, starting_after: startingAfter });
    for (const product of products.data) {
      if (product.metadata?.program === PROGRAM_KEY) return product;
    }
    if (!products.has_more || products.data.length === 0) break;
    startingAfter = products.data[products.data.length - 1]?.id;
  }
  return stripe.products.create({
    name: PRODUCT_NAME,
    metadata: { program: PROGRAM_KEY, unit: "program", sessions: "15" },
  });
}

async function findOrCreatePrice(stripe: Stripe, productId: string): Promise<Stripe.Price> {
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
        price.unit_amount === AMOUNT_CAD_CENTS
      ) {
        return price;
      }
    }
    if (!prices.has_more || prices.data.length === 0) break;
    startingAfter = prices.data[prices.data.length - 1]?.id;
  }
  return stripe.prices.create({
    currency: "cad",
    unit_amount: AMOUNT_CAD_CENTS,
    product: productId,
    metadata: { program: PROGRAM_KEY, unit: "program", sessions: "15" },
  });
}

async function main() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const root = join(scriptDir, "..");
  loadEnvFile(join(root, ".env.local"));
  loadEnvFile(join(root, ".env"));

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("Missing STRIPE_SECRET_KEY.");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-01-28.clover" });

  const mode = secretKey.startsWith("sk_live_") ? "LIVE" : "TEST";
  console.log(`Seeding WSC Globals price in ${mode} mode...`);

  const product = await findOrCreateProduct(stripe);
  const price = await findOrCreatePrice(stripe, product.id);

  console.log(`Product: ${product.id} (${product.name})`);
  console.log(`Price:   ${price.id} ($${(AMOUNT_CAD_CENTS / 100).toFixed(2)} CAD, one-time)`);
  console.log("");
  console.log(`${ENV_VAR}=${price.id}`);
}

main().catch((error) => {
  console.error("Stripe WSC Globals seed failed:", error);
  process.exit(1);
});
