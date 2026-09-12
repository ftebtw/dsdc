import type { Metadata } from "next";
import LegalPageClient from "@/components/LegalPageClient";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/cancellation",
    title: "Cancellation & Refund Policy | DSDC",
    description:
      "Read DSDC's cancellation and refund policy, including paid trial sessions, make-up options for missed classes, DSDC-initiated cancellations, and Stripe refund processing timelines.",
    noIndex: true,
  });
}

export default function CancellationPage() {
  return <LegalPageClient page="cancellation" />;
}
