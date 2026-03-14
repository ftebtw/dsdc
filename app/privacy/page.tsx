import type { Metadata } from "next";
import LegalPageClient from "@/components/LegalPageClient";

export const metadata: Metadata = {
  title: "Privacy Policy | DSDC",
  description:
    "Read DSDC's privacy policy, including what data we collect, how we use it, third-party services, children's privacy protections, and your rights under PIPEDA.",
  alternates: {
    canonical: "https://dsdc.ca/privacy",
  },
  openGraph: {
    title: "Privacy Policy | DSDC",
    description:
      "Read DSDC's privacy policy, including what data we collect, how we use it, third-party services, children's privacy protections, and your rights under PIPEDA.",
    url: "https://dsdc.ca/privacy",
    siteName: "DSDC",
    type: "website",
  },
};

export default function PrivacyPage() {
  return <LegalPageClient page="privacy" />;
}
