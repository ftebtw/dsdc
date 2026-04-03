import type { Metadata } from "next";
import LegalPageClient from "@/components/LegalPageClient";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/terms",
    title: "Terms of Service | DSDC",
    description:
      "Review DSDC's terms of service for online debate and public speaking classes, including enrollment, payment terms, portal access, acceptable use, and governing law.",
    noIndex: true,
  });
}

export default function TermsPage() {
  return <LegalPageClient page="terms" />;
}
