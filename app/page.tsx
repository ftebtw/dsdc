import dynamic from "next/dynamic";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/Hero";
import FeatureCards from "@/components/FeatureCards";
import HowItWorks from "@/components/HowItWorks";
import MissionSection from "@/components/MissionSection";
import ClassesOverview from "@/components/ClassesOverview";
import AuthHashRedirect from "@/components/AuthHashRedirect";
import FinalCTA from "@/components/FinalCTA";
import { homePageDataSanity } from "@/lib/sanity/presentation";
import { buildFaqSchema, heroVideoSchema } from "@/lib/structuredData";
import { siteFaqItems } from "@/lib/siteFaq";

const StatsCounter = dynamic(() => import("@/components/StatsCounter"));
const CompetitionLogos = dynamic(() => import("@/components/CompetitionLogos"), { ssr: true });
const TestimonialCarousel = dynamic(() => import("@/components/TestimonialCarousel"), { ssr: true });
const FAQ = dynamic(() => import("@/components/FAQ"), { ssr: true });

export const revalidate = 60;

export const metadata: Metadata = {
  title: "DSDC | Debate & Public Speaking Classes for Kids",
  description:
    "DSDC offers online debate and public speaking classes for kids in Vancouver and across Canada, with expert coaches, personalized feedback, and proven tournament results.",
  alternates: {
    canonical: "https://dsdc.ca",
  },
  openGraph: {
    title: "DSDC | Debate & Public Speaking Classes for Kids",
    description:
      "DSDC offers online debate and public speaking classes for kids in Vancouver and across Canada, with expert coaches, personalized feedback, and proven tournament results.",
    url: "https://dsdc.ca",
    siteName: "DSDC",
    type: "website",
    images: [
      {
        url: "https://dsdc.ca/images/photos/wsc-group-2.jpg",
        width: 1200,
        height: 630,
        alt: "DSDC Online Debate Classes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DSDC | Debate & Public Speaking Classes for Kids",
    description:
      "DSDC offers online debate and public speaking classes for kids in Vancouver and across Canada, with expert coaches, personalized feedback, and proven tournament results.",
    images: ["https://dsdc.ca/images/photos/wsc-group-2.jpg"],
  },
};

const faqSchema = buildFaqSchema(siteFaqItems);

const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".about-dsdc", ".faq-section", ".stats-section"],
  },
};

export default async function HomePage() {
  const { isEnabled } = await draftMode();
  return (
    <div data-sanity={isEnabled ? homePageDataSanity() : undefined}>
      <JsonLd id="home-faq-schema" data={faqSchema} />
      <JsonLd id="home-video-schema" data={heroVideoSchema} />
      <JsonLd id="home-speakable-schema" data={speakableSchema} />
      <AuthHashRedirect />
      <Hero />
      <FeatureCards />
      <HowItWorks />
      <MissionSection />
      <ClassesOverview />
      <StatsCounter />
      <CompetitionLogos />
      <TestimonialCarousel />
      <FAQ />
      <FinalCTA />
    </div>
  );
}
