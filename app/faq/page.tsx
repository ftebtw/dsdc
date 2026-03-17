import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import FaqPageContent from "@/components/FaqPageContent";
import { buildFaqSchema } from "@/lib/structuredData";
import { siteFaqItems } from "@/lib/siteFaq";

export const metadata: Metadata = {
  title: "FAQ | DSDC Debate & Public Speaking",
  description:
    "Find answers to common questions about DSDC's debate classes, public speaking programs, scheduling, pricing, and registration.",
  alternates: {
    canonical: "https://dsdc.ca/faq",
  },
  openGraph: {
    title: "FAQ | DSDC Debate & Public Speaking",
    description:
      "Find answers to common questions about DSDC's debate classes, public speaking programs, scheduling, pricing, and registration.",
    url: "https://dsdc.ca/faq",
    siteName: "DSDC",
    type: "website",
  },
};

const faqPageSchema = buildFaqSchema(siteFaqItems);

export default function FaqPage() {
  return (
    <>
      <JsonLd id="faq-page-schema" data={faqPageSchema} />
      <FaqPageContent />
    </>
  );
}
