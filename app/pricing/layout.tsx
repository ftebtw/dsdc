import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent debate and public speaking class rates. Group classes from $30/hr plus applicable taxes. World Scholars Cup $40/hr, advanced debate $50/hr. Private coaching available.",
  openGraph: {
    title: "Pricing | DSDC",
    description: "Transparent pricing for debate and public speaking classes. No hidden fees.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
