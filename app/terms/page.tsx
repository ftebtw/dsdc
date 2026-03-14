import type { Metadata } from "next";
import LegalPageClient from "@/components/LegalPageClient";

export const metadata: Metadata = {
  title: "Terms of Service | DSDC",
  description:
    "Review DSDC's terms of service for online debate and public speaking classes, including enrollment, payment terms, portal access, acceptable use, and governing law.",
  alternates: {
    canonical: "https://dsdc.ca/terms",
  },
  openGraph: {
    title: "Terms of Service | DSDC",
    description:
      "Review DSDC's terms of service for online debate and public speaking classes, including enrollment, payment terms, portal access, acceptable use, and governing law.",
    url: "https://dsdc.ca/terms",
    siteName: "DSDC",
    type: "website",
  },
};

export default function TermsPage() {
  return <LegalPageClient page="terms" />;
}
