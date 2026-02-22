import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent debate and public speaking class rates. Group classes are billed per 13-week term in CAD, plus applicable taxes. Private coaching available.",
  openGraph: {
    title: "Pricing | DSDC",
    description: "Transparent pricing for debate and public speaking classes. No hidden fees.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
