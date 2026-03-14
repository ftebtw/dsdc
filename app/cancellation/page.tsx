import type { Metadata } from "next";
import LegalPageClient from "@/components/LegalPageClient";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | DSDC",
  description:
    "Read DSDC's cancellation and refund policy, including the 7-day cancellation window, first-class refund exception, and Stripe refund processing timelines.",
  alternates: {
    canonical: "https://dsdc.ca/cancellation",
  },
  openGraph: {
    title: "Cancellation & Refund Policy | DSDC",
    description:
      "Read DSDC's cancellation and refund policy, including the 7-day cancellation window, first-class refund exception, and Stripe refund processing timelines.",
    url: "https://dsdc.ca/cancellation",
    siteName: "DSDC",
    type: "website",
  },
};

export default function CancellationPage() {
  return <LegalPageClient page="cancellation" />;
}
