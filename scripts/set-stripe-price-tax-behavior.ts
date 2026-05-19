#!/usr/bin/env node
/**
 * One-off helper: set `tax_behavior: "exclusive"` on the pre-existing Stripe
 * Prices that legacy + WSC globals checkouts reference by env var.
 *
 * Why: inline `price_data` checkouts now set tax_behavior on the fly, but
 * legacy/WSC checkouts pass a stored Price ID and Stripe ignores any tax
 * settings on the session for those. The Price itself must have
 * tax_behavior set so `automatic_tax: { enabled: true }` actually adds GST.
 *
 * Notes:
 * - Stripe lets you set tax_behavior on a Price exactly once (from
 *   "unspecified" to "exclusive" or "inclusive"). After that it's locked.
 * - Run: npx tsx scripts/set-stripe-price-tax-behavior.ts
 */
import Stripe from "stripe";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TARGET_BEHAVIOR: Stripe.Price.TaxBehavior = "exclusive";

const ENV_VARS_TO_UPDATE = [
  "STRIPE_PRICE_NOVICE_INTERMEDIATE",
  "STRIPE_PRICE_PUBLIC_SPEAKING",
  "STRIPE_PRICE_WSC",
  "STRIPE_PRICE_ADVANCED",
  "STRIPE_PRICE_WSC_GLOBALS",
] as const;

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed
      .slice(eqIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
    if (!process.env[key] && value) {
      process.env[key] = value;
    }
  }
}

async function main() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const root = join(scriptDir, "..");
  loadEnvFile(join(root, ".env.local"));
  loadEnvFile(join(root, ".env"));

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("Missing STRIPE_SECRET_KEY. Add it to .env.local before running.");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-01-28.clover" });

  let updated = 0;
  let alreadySet = 0;
  let missing = 0;
  let failed = 0;

  for (const envVar of ENV_VARS_TO_UPDATE) {
    const priceId = process.env[envVar]?.trim();
    if (!priceId) {
      console.warn(`- ${envVar}: skip (env var not set)`);
      missing++;
      continue;
    }

    try {
      const price = await stripe.prices.retrieve(priceId);
      if (price.tax_behavior === TARGET_BEHAVIOR) {
        console.log(`- ${envVar} (${priceId}): already ${TARGET_BEHAVIOR}, no change`);
        alreadySet++;
        continue;
      }
      if (price.tax_behavior && price.tax_behavior !== "unspecified") {
        console.warn(
          `- ${envVar} (${priceId}): tax_behavior is "${price.tax_behavior}" (locked) — Stripe does not allow changing it. Skip.`
        );
        failed++;
        continue;
      }
      const updatedPrice = await stripe.prices.update(priceId, {
        tax_behavior: TARGET_BEHAVIOR,
      });
      console.log(`- ${envVar} (${priceId}): set tax_behavior=${updatedPrice.tax_behavior}`);
      updated++;
    } catch (error) {
      console.error(`- ${envVar} (${priceId}): failed`, error);
      failed++;
    }
  }

  console.log(`\nDone. updated=${updated} alreadySet=${alreadySet} missing=${missing} failed=${failed}`);
}

main().catch((error) => {
  console.error("set-stripe-price-tax-behavior failed:", error);
  process.exit(1);
});
