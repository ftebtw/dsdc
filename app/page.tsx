import dynamic from "next/dynamic";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import FeatureCards from "@/components/FeatureCards";
import HowItWorks from "@/components/HowItWorks";
import MissionSection from "@/components/MissionSection";
import ClassesOverview from "@/components/ClassesOverview";
import AuthHashRedirect from "@/components/AuthHashRedirect";
import FinalCTA from "@/components/FinalCTA";
import { homePageDataSanity } from "@/lib/sanity/presentation";

const StatsCounter = dynamic(() => import("@/components/StatsCounter"));
const CompetitionLogos = dynamic(() => import("@/components/CompetitionLogos"), { ssr: true });
const TestimonialCarousel = dynamic(() => import("@/components/TestimonialCarousel"), { ssr: true });
const FAQ = dynamic(() => import("@/components/FAQ"), { ssr: true });

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Online Debate & Public Speaking Classes | DSDC",
  description:
    "Award-winning online debate and public speaking classes for kids, teens, and university students. Expert coaching, personalized feedback every class, and proven results at national and international tournaments. Book a free consultation.",
  alternates: {
    canonical: "https://dsdc.ca",
  },
  openGraph: {
    title: "Online Debate & Public Speaking Classes | DSDC",
    description:
      "Award-winning online debate and public speaking classes for kids, teens, and university students. Expert coaching, personalized feedback every class, and proven results at national and international tournaments. Book a free consultation.",
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
    title: "Online Debate & Public Speaking Classes | DSDC",
    description:
      "Award-winning online debate and public speaking classes for kids, teens, and university students. Expert coaching, personalized feedback every class, and proven results at national and international tournaments. Book a free consultation.",
    images: ["https://dsdc.ca/images/photos/wsc-group-2.jpg"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What ages and grades do you teach?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer classes for students in Grades 4 through 12, with programs tailored to each age group - Novice (Grades 4-6), Junior (Grades 7-9), Senior (Grades 10-12), and Advanced Competitive (Grades 10-12). We also work with university students.",
      },
    },
    {
      "@type": "Question",
      name: "How are classes conducted?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "All classes are conducted live online via Zoom. Each 2-hour session includes warm-up activities, a topical lesson, practice debates, and personalized written feedback from your coach.",
      },
    },
    {
      "@type": "Question",
      name: "How much do classes cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Group classes range from $30-50/hr plus applicable taxes. All group classes are 2 hours. Private coaching is customizable with a 1-hour minimum. See our pricing page for full details.",
      },
    },
    {
      "@type": "Question",
      name: "Does my child need prior debate experience?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No prior experience is needed. Our Novice program is designed for complete beginners, and even shy or introverted students thrive in our supportive environment.",
      },
    },
    {
      "@type": "Question",
      name: "What does a typical class look like?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each class opens with a warm-up activity, followed by a topical lesson, structured practice debates, and personalized feedback from your coach. Students also receive homework to reinforce skills between sessions.",
      },
    },
    {
      "@type": "Question",
      name: "Can my child try a class before committing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Book a free 15-minute consultation and we'll recommend the right class for your child. Trial classes may be available depending on the program.",
      },
    },
    {
      "@type": "Question",
      name: "What is the World Scholar's Cup?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The World Scholar's Cup is a global academic competition combining Team Debate, Collaborative Writing, Scholar's Challenge, and Scholar's Bowl. DSDC has maintained a 100% qualification rate from regionals to the Tournament of Champions at Yale since 2020.",
      },
    },
    {
      "@type": "Question",
      name: "How do I register or get started?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Book a free 15-minute consultation with our team. We'll discuss your goals and recommend the right class. Then your child can start learning in live online sessions right away.",
      },
    },
  ],
};

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />
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
