import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ContactPageContent from "@/components/ContactPageContent";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema } from "@/lib/structuredData";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/contact",
    title: "Contact DSDC | Debate & Public Speaking",
    description:
      "DSDC can help with debate classes, public speaking programs, scheduling, pricing, and enrollment questions. Contact our team online today.",
  });
}

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact DSDC",
  url: "https://dsdc.ca/contact",
  description:
    "Get in touch with DSDC about debate classes, public speaking programs, consultations, and enrollment.",
};

const contactBreadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
]);

export default function ContactPage() {
  return (
    <>
      <JsonLd id="contact-page-schema" data={contactSchema} />
      <JsonLd id="contact-breadcrumb-schema" data={contactBreadcrumbSchema} />
      <ContactPageContent />
    </>
  );
}
