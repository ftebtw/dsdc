import type { Metadata } from "next";
import LegalPageClient from "@/components/LegalPageClient";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/privacy",
    title: "Privacy Policy | DSDC",
    description:
      "Read DSDC's privacy policy, including what data we collect, how we use it, third-party services, children's privacy protections, and your rights under PIPEDA.",
    noIndex: true,
  });
}

export default function PrivacyPage() {
  return <LegalPageClient page="privacy" />;
}
