#!/usr/bin/env node
/**
 * One-off inspector: show the current state of STRIPE_PRICE_WSC and recent
 * checkout sessions that used it, so we can see what's been happening with
 * GST.
 *
 * Run: npx tsx scripts/inspect-wsc-tax.ts
 */
import Stripe from "stripe";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

function formatCents(n: number | null, currency: string) {
  if (n === null || n === undefined) return "n/a";
  return `${(n / 100).toFixed(2)} ${currency.toUpperCase()}`;
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
  const wscPriceId = process.env.STRIPE_PRICE_WSC?.trim();
  if (!wscPriceId) {
    console.error("Missing STRIPE_PRICE_WSC env var.");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-01-28.clover" });

  // 1) Current Price details
  console.log("\n=== STRIPE_PRICE_WSC ===");
  const price = await stripe.prices.retrieve(wscPriceId, { expand: ["product"] });
  const product =
    typeof price.product === "object" && !price.product.deleted ? price.product : null;
  console.log(`  id:            ${price.id}`);
  console.log(`  active:        ${price.active}`);
  console.log(`  currency:      ${price.currency.toUpperCase()}`);
  console.log(`  unit_amount:   ${formatCents(price.unit_amount, price.currency)}`);
  console.log(`  tax_behavior:  ${price.tax_behavior}`);
  console.log(`  product:       ${product?.name ?? price.product} (${product?.id ?? "n/a"})`);
  if (product && "tax_code" in product) {
    console.log(`  product.tax_code: ${product.tax_code ?? "(none)"}`);
  }

  // 2) Recent checkout sessions that used this price
  console.log("\n=== Last 20 checkout sessions, filtering for WSC price line items ===");
  const sessions = await stripe.checkout.sessions.list({
    limit: 20,
    expand: ["data.line_items", "data.total_details"],
  });

  let matched = 0;
  for (const s of sessions.data) {
    const lineItems = s.line_items?.data ?? [];
    const hit = lineItems.some((li) => li.price?.id === wscPriceId);
    if (!hit) continue;
    matched++;
    const taxAmount = s.total_details?.amount_tax ?? 0;
    console.log(
      `  ${s.id}  status=${s.status}  payment=${s.payment_status}  created=${new Date(
        s.created * 1000
      ).toISOString()}`
    );
    console.log(
      `    subtotal=${formatCents(s.amount_subtotal, s.currency || "cad")}  ` +
        `tax=${formatCents(taxAmount, s.currency || "cad")}  ` +
        `total=${formatCents(s.amount_total, s.currency || "cad")}  ` +
        `auto_tax.enabled=${s.automatic_tax?.enabled ?? false}  ` +
        `auto_tax.status=${s.automatic_tax?.status ?? "null"}`
    );
  }
  if (matched === 0) {
    console.log("  (none of the last 20 sessions used STRIPE_PRICE_WSC)");
  }
  console.log(`\nMatched ${matched} WSC sessions out of last ${sessions.data.length}.`);
}

main().catch((error) => {
  console.error("Inspector failed:", error);
  process.exit(1);
});
