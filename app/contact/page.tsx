import type { Metadata } from "next";
import ContactPageContent from "@/components/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact DSDC | Get in Touch",
  description:
    "Contact DSDC to ask questions about classes, scheduling, pricing, or enrollment. Reach our team online or through the contact form.",
  alternates: {
    canonical: "https://dsdc.ca/contact",
  },
  openGraph: {
    title: "Contact DSDC | Get in Touch",
    description:
      "Contact DSDC to ask questions about classes, scheduling, pricing, or enrollment. Reach our team online or through the contact form.",
    url: "https://dsdc.ca/contact",
    siteName: "DSDC",
    type: "website",
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

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <ContactPageContent />
    </>
  );
}
