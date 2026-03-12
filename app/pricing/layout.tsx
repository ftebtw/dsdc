import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debate Class Pricing | Online Group & Private Coaching from $30/hr | DSDC",
  description:
    "Transparent pricing for DSDC's online debate and public speaking classes. Group classes from $30-50/hr. Private coaching available with flexible scheduling.",
  alternates: {
    canonical: "https://dsdc.ca/pricing",
  },
  openGraph: {
    title: "Debate Class Pricing | Online Group & Private Coaching from $30/hr | DSDC",
    description:
      "Transparent pricing for DSDC's online debate and public speaking classes. Group classes from $30-50/hr. Private coaching available with flexible scheduling.",
    url: "https://dsdc.ca/pricing",
    siteName: "DSDC",
    type: "website",
    images: [
      {
        url: "https://dsdc.ca/images/photos/wsc-group-2.jpg",
        width: 1200,
        height: 630,
        alt: "DSDC Online Debate Classes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Debate Class Pricing | Online Group & Private Coaching from $30/hr | DSDC",
    description:
      "Transparent pricing for DSDC's online debate and public speaking classes. Group classes from $30-50/hr. Private coaching available with flexible scheduling.",
    images: ["https://dsdc.ca/images/photos/wsc-group-2.jpg"],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
