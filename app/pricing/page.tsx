import PricingPageClient from "./PricingPageClient";
import { getStripePriceMap } from "@/lib/stripe-prices";

export default function PricingPage() {
  const stripePriceIds = getStripePriceMap();
  return <PricingPageClient stripePriceIds={stripePriceIds} />;
}
