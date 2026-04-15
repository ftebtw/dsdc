import JsonLd from "@/components/JsonLd";
import { SITE_URL, buildBreadcrumbSchema } from "@/lib/structuredData";
import { GROUP_TIERS, SESSIONS_PER_TERM } from "@/lib/pricing";
import PricingPageClient from "./PricingPageClient";

export const revalidate = 60;

const tierCopy: Record<(typeof GROUP_TIERS)[number]["key"], { name: string; description: string }> = {
  noviceIntermediate: {
    name: "Novice & Intermediate Debate (Grades 4-9)",
    description: `12-week group debate class for Grades 4-9. Weekly 90-minute lessons, personalized feedback, and tournament preparation.`,
  },
  publicSpeaking: {
    name: "Public Speaking (Grades 4-9)",
    description: `12-week group public speaking class covering impromptu, persuasive, interpretive, and parliamentary formats.`,
  },
  wsc: {
    name: "World Scholar's Cup Preparation",
    description: `12-week WSC preparation covering debate, collaborative writing, bowl, and challenge from regionals to Yale ToC.`,
  },
  advanced: {
    name: "Advanced Competitive Debate (Grades 10-12)",
    description: `12-week elite program led by world-class university debaters for students committed to competitive debate.`,
  },
};

const pricingOffersSchema = {
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  name: "DSDC Group Class Pricing",
  url: `${SITE_URL}/pricing`,
  itemListElement: GROUP_TIERS.map((tier, index) => ({
    "@type": "Offer",
    position: index + 1,
    name: tierCopy[tier.key].name,
    description: tierCopy[tier.key].description,
    category: "Paid",
    priceCurrency: "CAD",
    price: tier.baseCadPrice.toString(),
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: tier.baseCadPrice.toString(),
      priceCurrency: "CAD",
      referenceQuantity: {
        "@type": "QuantitativeValue",
        value: SESSIONS_PER_TERM,
        unitText: "classes",
      },
    },
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}/pricing`,
    seller: {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: "DSDC",
      url: SITE_URL,
    },
  })),
};

const pricingBreadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Pricing", path: "/pricing" },
]);

export default function PricingPage() {
  return (
    <>
      <JsonLd id="pricing-offers-schema" data={pricingOffersSchema} />
      <JsonLd id="pricing-breadcrumb-schema" data={pricingBreadcrumbSchema} />
      <PricingPageClient />
    </>
  );
}
