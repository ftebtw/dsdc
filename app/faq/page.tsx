import type { Metadata } from "next";
import FaqPageContent from "@/components/FaqPageContent";

export const metadata: Metadata = {
  title: "FAQ | DSDC Debate & Public Speaking",
  description:
    "Find answers to common questions about DSDC’s debate classes, public speaking programs, scheduling, pricing, and registration.",
  alternates: {
    canonical: "https://dsdc.ca/faq",
  },
  openGraph: {
    title: "FAQ | DSDC Debate & Public Speaking",
    description:
      "Find answers to common questions about DSDC’s debate classes, public speaking programs, scheduling, pricing, and registration.",
    url: "https://dsdc.ca/faq",
    siteName: "DSDC",
    type: "website",
  },
};

const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What ages and grades do you teach?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer classes for students in Grades 4 through 12, with programs tailored to each age group — Novice (Grades 4–6), Junior (Grades 7–9), Senior (Grades 10–12), and Advanced Competitive (Grades 10–12).",
      },
    },
    {
      "@type": "Question",
      name: "How are classes conducted?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "All classes are held live online via Zoom. Group classes are 2 hours per session, with small groups of 8–12 students to ensure personalized attention.",
      },
    },
    {
      "@type": "Question",
      name: "How much do classes cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Novice and Public Speaking group classes are $720 CAD per 12-week term, World Scholar’s Cup is $960 CAD, and Advanced Debate is $1,200 CAD, plus applicable taxes.",
      },
    },
    {
      "@type": "Question",
      name: "Does my child need prior debate experience?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not at all. Our beginner-friendly programs are designed for students with zero prior experience.",
      },
    },
  ],
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <FaqPageContent />
    </>
  );
}
