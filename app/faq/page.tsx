import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import FaqPageContent from "@/components/FaqPageContent";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { buildFaqSchema } from "@/lib/structuredData";
import { siteFaqItems } from "@/lib/siteFaq";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/faq",
    title: "FAQ | DSDC Debate & Public Speaking",
    description:
      "Find answers to common questions about DSDC's debate classes, public speaking programs, scheduling, pricing, and registration.",
  });
}

const faqPageSchema = buildFaqSchema(siteFaqItems);

export default function FaqPage() {
  return (
    <>
      <JsonLd id="faq-page-schema" data={faqPageSchema} />
      <FaqPageContent />
    </>
  );
}
