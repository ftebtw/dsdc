import type { Metadata } from "next";
import AboutPageContent from "@/components/AboutPageContent";

export const metadata: Metadata = {
  title: "About DSDC | Our Mission & Story",
  description:
    "Learn about DSDC’s mission, story, coaching philosophy, and debate programs for students in Canada and around the world.",
  alternates: {
    canonical: "https://dsdc.ca/about",
  },
  openGraph: {
    title: "About DSDC | Our Mission & Story",
    description:
      "Learn about DSDC’s mission, story, coaching philosophy, and debate programs for students in Canada and around the world.",
    url: "https://dsdc.ca/about",
    siteName: "DSDC",
    type: "website",
  },
};

const aboutOrgSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "DSDC - Debate & Speech Development Community",
  url: "https://dsdc.ca/about",
  foundingDate: "2017",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Vancouver",
    addressRegion: "BC",
    addressCountry: "CA",
  },
  email: "education@dsdc.ca",
  description:
    "Online debate and public speaking academy founded in Vancouver, Canada, serving students through live Zoom classes.",
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutOrgSchema) }}
      />
      <AboutPageContent />
    </>
  );
}
