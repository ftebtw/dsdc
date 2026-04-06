import type { Metadata } from "next";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/pricing",
    title: "Debate Class Pricing | From $30/hr Online | DSDC",
    description:
      "Transparent pricing for DSDC's online debate and public speaking classes. Group classes from $30-50/hr. Private coaching available with flexible scheduling.",
    images: [
      {
        url: "/images/photos/wsc-group-2.jpg",
        width: 1200,
        height: 630,
        alt: "DSDC Online Debate Classes",
      },
    ],
  });
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
