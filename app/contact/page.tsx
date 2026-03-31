import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ContactPageContent from "@/components/ContactPageContent";
import { buildBreadcrumbSchema } from "@/lib/structuredData";

export const metadata: Metadata = {
  title: "Contact DSDC | Debate & Public Speaking",
  description:
    "DSDC can help with debate classes, public speaking programs, scheduling, pricing, and enrollment questions. Contact our team online today.",
  alternates: {
    canonical: "https://dsdc.ca/contact",
  },
  openGraph: {
    title: "Contact DSDC | Debate & Public Speaking",
    description:
      "DSDC can help with debate classes, public speaking programs, scheduling, pricing, and enrollment questions. Contact our team online today.",
    url: "https://dsdc.ca/contact",
    siteName: "DSDC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact DSDC | Debate & Public Speaking",
    description:
      "DSDC can help with debate classes, public speaking programs, scheduling, pricing, and enrollment questions. Contact our team online today.",
  },
};

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
