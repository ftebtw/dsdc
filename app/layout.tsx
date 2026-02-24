import type { Metadata } from "next";
import { draftMode } from "next/headers";

import { getCmsMessageOverrides } from "@/lib/sanity/content";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import ClientProviders from "./providers";
import VisualEditingWrapper from "@/components/VisualEditingWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DSDC | Online Debate & Public Speaking Classes for Grades 4–12",
    template: "%s | DSDC",
  },
  description:
    "World-class online debate and public speaking coaching for students in Grades 4–12. Founded in Vancouver, Canada. Expert coaches, individualized attention, and proven results with 1000+ students.",
  keywords: [
    "debate classes Vancouver",
    "public speaking for kids BC",
    "online debate coaching Canada",
    "debate school Surrey",
    "World Scholar's Cup preparation",
    "debate classes for kids",
    "public speaking classes online",
    "DSDC",
    "youth debate training",
  ],
  openGraph: {
    title: "DSDC | Online Debate & Public Speaking Classes for Grades 4–12",
    description:
      "World-class online debate and public speaking coaching. Expert coaches, proven results, 1000+ students coached.",
    url: "https://dsdc.ca",
    siteName: "DSDC",
    type: "website",
    locale: "en_CA",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "DSDC – Online Debate & Public Speaking Classes for Grades 4–12",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DSDC | Online Debate & Public Speaking Classes for Grades 4â€“12",
    description:
      "World-class online debate and public speaking coaching. Expert coaches, proven results, 1000+ students coached.",
    images: ["/images/og-image.png"],
  },
  alternates: {
    languages: {
      "en": "https://dsdc.ca",
      "zh": "https://dsdc.ca",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL("https://dsdc.ca"),
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
        text: "We offer classes for students in Grades 4 through 12, with programs tailored to each age group — Novice (Grades 4–6), Junior (Grades 7–9), Senior (Grades 10–12), and Advanced Competitive (Grades 10–12).",
      },
    },
    {
      "@type": "Question",
      name: "How are classes conducted?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "All classes are held live online via Zoom. Group classes are 2 hours per session, with small groups of 8–12 students to ensure personalized attention. Private coaching is customizable in length with a 1-hour minimum. Students receive written feedback from their coach every class.",
      },
    },
    {
      "@type": "Question",
      name: "How much do classes cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We publish our rates openly: Novice & Intermediate Debate and Public Speaking are $780 CAD per 12-week term plus applicable taxes, World Scholar's Cup is $1,040 CAD per term plus applicable taxes, and Advanced Debate is $1,300 CAD per term plus applicable taxes. Mid-term registrations are prorated based on weeks remaining. Private coaching (1-on-1, 2-on-1, or 3-on-1) is priced separately based on coach and group size. See our Pricing page for full details.",
      },
    },
    {
      "@type": "Question",
      name: "Does my child need prior debate experience?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not at all! Our Novice and Public Speaking classes are designed for complete beginners. Many of our most successful students started with zero experience.",
      },
    },
    {
      "@type": "Question",
      name: "What does a typical class look like?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Classes begin with a brief warm-up or lesson on a current topic, followed by structured practice (speeches or debates), and conclude with personalized feedback from the coach.",
      },
    },
    {
      "@type": "Question",
      name: "Can my child try a class before committing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! We encourage families to book a free consultation first. We can often arrange a trial session so your child can experience the class environment before enrolling.",
      },
    },
    {
      "@type": "Question",
      name: "What is the World Scholar's Cup?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The World Scholar's Cup (WSC) is a prestigious international academic competition. DSDC has maintained a 100% qualification rate since 2020.",
      },
    },
    {
      "@type": "Question",
      name: "How do I register or get started?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The easiest way to start is to book a free 15-minute consultation. We'll discuss your child's interests, recommend the right class, and walk you through enrollment.",
      },
    },
  ],
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Debate and Speech Development Community (DSDC)",
  url: "https://dsdc.ca",
  description:
    "Global online debate coaching institution founded in Vancouver, Canada in 2017.",
  foundingDate: "2017",
  foundingLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Vancouver",
      addressRegion: "BC",
      addressCountry: "CA",
    },
  },
  sameAs: [
    "https://instagram.com/debate_education",
    "https://www.linkedin.com/company/debate-and-speech-development-community/",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "education.dsdc@gmail.com",
    contactType: "customer service",
  },
};

const courseSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Novice Debate (Grades 4–6)",
    description: "An excellent starting point for younger scholars eager to develop public speaking and debate skills.",
    provider: { "@type": "Organization", name: "DSDC", url: "https://dsdc.ca" },
    educationalLevel: "Grades 4–6",
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", instructor: { "@type": "Person", name: "Rebecca Amisano" } },
  },
  {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Junior Debate (Grades 7–9)",
    description: "Build competitive debate skills while accelerating academic growth through challenging topics.",
    provider: { "@type": "Organization", name: "DSDC", url: "https://dsdc.ca" },
    educationalLevel: "Grades 7–9",
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" },
  },
  {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Senior Debate (Grades 10–12)",
    description: "Rigorous practice in BP, CNDF, and World Schools formats with advanced lectures on complex topics.",
    provider: { "@type": "Organization", name: "DSDC", url: "https://dsdc.ca" },
    educationalLevel: "Grades 10–12",
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" },
  },
  {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Advanced Competitive Debate (Grades 10–12)",
    description: "Elite program led by world-renowned university debaters for students deeply committed to competitive debate.",
    provider: { "@type": "Organization", name: "DSDC", url: "https://dsdc.ca" },
    educationalLevel: "Grades 10–12",
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" },
  },
  {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "World Scholar's Cup Preparation (Grades 4–12)",
    description: "Full preparation for WSC from regionals to the Tournament of Champions at Yale University.",
    provider: { "@type": "Organization", name: "DSDC", url: "https://dsdc.ca" },
    educationalLevel: "Grades 4–12",
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" },
  },
  {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Public Speaking (Grades 4–9)",
    description: "Comprehensive training in impromptu, persuasive, interpretive, and parliamentary debate formats.",
    provider: { "@type": "Organization", name: "DSDC", url: "https://dsdc.ca" },
    educationalLevel: "Grades 4–9",
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" },
  },
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled } = await draftMode();
  const cmsResult = await getCmsMessageOverrides({ draft: isEnabled });
  const initialCmsOverrides = cmsResult.source === "live" ? cmsResult.overrides : undefined;
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="alternate" hrefLang="en" href="https://dsdc.ca" />
        <link rel="alternate" hrefLang="zh" href="https://dsdc.ca" />
        <link rel="alternate" hrefLang="x-default" href="https://dsdc.ca" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        {courseSchemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="font-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: 'try{var t=localStorage.getItem("dsdc-theme");var e=document.documentElement;if(t==="dark")e.classList.add("dark");else if(t==="light")e.classList.remove("dark");}catch(n){}',
          }}
        />
        <ClientProviders initialCmsOverrides={initialCmsOverrides}>
          {children}
        </ClientProviders>
        <VisualEditingWrapper enabled={isEnabled} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
