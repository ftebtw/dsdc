import dynamic from "next/dynamic";
import Link from "next/link";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/Hero";
import FeatureCards from "@/components/FeatureCards";
import HowItWorksMission from "@/components/HowItWorksMission";
import ClassesOverview from "@/components/ClassesOverview";
import HomepageExploreLinks from "@/components/HomepageExploreLinks";
import AuthHashRedirect from "@/components/AuthHashRedirect";
import FinalCTA from "@/components/FinalCTA";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { homePageDataSanity } from "@/lib/sanity/presentation";
import { buildFaqSchema, heroVideoSchema } from "@/lib/structuredData";
import { siteFaqItems } from "@/lib/siteFaq";

const ProofStrip = dynamic(() => import("@/components/ProofStrip"), { ssr: true });
const TestimonialCarousel = dynamic(() => import("@/components/TestimonialCarousel"), { ssr: true });
const FAQ = dynamic(() => import("@/components/FAQ"), { ssr: true });

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/",
    title: "Online Debate Classes for Grades 4-12 | Debate Club Canada | DSDC",
    description:
      "DSDC runs online debate classes and a Canada-wide debate club for students in Grades 4 to 12. Live Zoom classes, small groups, expert coaches from Canada's National Debate Team, and a 100% World Scholar's Cup qualification rate. Book a free consultation.",
    keywords: [
      "debate classes",
      "debate classes near me",
      "debate club",
      "debate club near me",
      "online debate classes",
      "debate classes for kids",
      "public speaking for kids",
      "online debate coaching Canada",
      "World Scholar's Cup preparation",
      "DSDC",
    ],
    images: [
      {
        url: "/images/photos/wsc-group-2.jpg",
        width: 1200,
        height: 630,
        alt: "DSDC Online Debate Classes",
      },
    ],
  });
}

const faqSchema = buildFaqSchema(siteFaqItems);

const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".about-dsdc", ".faq-section", ".stats-section"],
  },
};

const homeCourseSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "Course",
      position: 1,
      name: "Online Debate Classes for Grades 4-12",
      description:
        "Live online debate classes for students in Grades 4 to 12. Small-group Zoom classes taught by coaches from Canada's National Debate Team, with personalized written feedback after every session.",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
      url: "https://dsdc.ca/online-debate-classes",
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "Online",
        courseWorkload: "PT1H30M",
      },
      offers: {
        "@type": "Offer",
        price: "30",
        priceCurrency: "CAD",
        availability: "https://schema.org/InStock",
        url: "https://dsdc.ca/pricing",
      },
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "student",
        audienceType: "Students in Grades 4-12",
      },
    },
    {
      "@type": "Course",
      position: 2,
      name: "DSDC Online Debate Club",
      description:
        "Canada's online debate club for students in Grades 4 to 12. Weekly live practice, tournament prep, and a national peer group - all delivered over Zoom.",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
      url: "https://dsdc.ca/debate-club",
    },
    {
      "@type": "Course",
      position: 3,
      name: "Public Speaking Classes for Kids",
      description:
        "Live online public speaking classes for students in Grades 4 to 12. Confidence-building curriculum for younger speakers and a bridge into debate.",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
      url: "https://dsdc.ca/public-speaking-classes-for-kids",
    },
  ],
};

const homeCohorts = [
  {
    term: "Fall 2026",
    window: "September 2026 - December 2026",
    description: "Core debate and public speaking classes for Novice, Junior, Senior, and Advanced students. New Novice cohorts open every fall for beginners in Grades 4-6.",
  },
  {
    term: "Winter 2027",
    window: "January 2027 - March 2027",
    description: "Continuing cohorts plus new Novice intakes. Canadian Nationals prep for senior competitors and Winter intensives for students preparing for BC and Ontario tournaments.",
  },
  {
    term: "Spring 2027",
    window: "April 2027 - June 2027",
    description: "Tournament season wraps up and students finish the year with showcase debates. New Public Speaking cohorts open for kids who want to try speaking before committing to full debate.",
  },
  {
    term: "Summer 2027",
    window: "July 2027 - August 2027",
    description: "Summer debate camps, intensive 2-week tracks for beginners, and World Scholar's Cup Global Round preparation for qualifying students.",
  },
];

export default async function HomePage() {
  const { isEnabled } = await draftMode();
  return (
    <div data-sanity={isEnabled ? homePageDataSanity() : undefined}>
      <JsonLd id="home-faq-schema" data={faqSchema} />
      <JsonLd id="home-video-schema" data={heroVideoSchema} />
      <JsonLd id="home-speakable-schema" data={speakableSchema} />
      <JsonLd id="home-course-schema" data={homeCourseSchema} />
      <AuthHashRedirect />
      <Hero />
      <FeatureCards />
      <ProofStrip />
      <HowItWorksMission />
      <ClassesOverview />

      {/* Canada's Online Debate Club - targets "debate club" / "debate club near me" cluster */}
      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Join Canada&apos;s Online Debate Club
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            DSDC runs a Canada-wide online debate club for students in Grades 4 to 12. Members meet weekly
            over Zoom, practice with a consistent peer group, and get direct coaching from Canadian National
            Debate Team alumni - without leaving home.
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                title: "Weekly Live Practice",
                text: "Students debate real motions every week in small groups of 8 to 12. Coaches run the room, referee practice rounds, and give written feedback after every session.",
              },
              {
                title: "A National Peer Group",
                text: "Unlike a small in-person debate club, DSDC puts students alongside peers from Vancouver, Toronto, Calgary, Ottawa, and beyond. Searching \"debate club near me\" stops mattering when the club comes to you.",
              },
              {
                title: "Tournament-Ready Coaching",
                text: "Club members train for CNDF, British Parliamentary, World Schools, and Cross-Examination formats, plus Canadian Nationals and World Scholar's Cup.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 bg-warm-50 p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{item.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/debate-club"
              className="rounded-lg bg-gold-400 px-8 py-3.5 text-center font-semibold text-navy-900 shadow-md transition-all duration-200 hover:bg-gold-300"
            >
              Explore the Debate Club
            </Link>
            <Link
              href="/book"
              className="rounded-lg border-2 border-navy-800 px-8 py-3.5 text-center font-semibold text-navy-800 transition-all duration-200 hover:bg-navy-800 hover:text-white dark:border-white dark:text-white"
            >
              Book a Free Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming cohort schedule */}
      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Upcoming Cohort Schedule
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans md:text-lg">
            DSDC runs four term-based cohorts each year so students can join at a sensible starting point.
            Schedules are announced a few weeks before each intake - contact us to reserve a spot before the
            cohort fills.
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {homeCohorts.map((cohort) => (
              <article
                key={cohort.term}
                className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300 font-sans">
                  {cohort.window}
                </p>
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white font-serif">
                  {cohort.term}
                </h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{cohort.description}</p>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-center text-base leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
            Prefer to compare programs before booking? See all{" "}
            <Link href="/classes" className="underline underline-offset-4 transition-colors hover:text-gold-500">
              class levels and pricing
            </Link>{" "}
            or review our{" "}
            <Link href="/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-500">
              published group rates
            </Link>
            .
          </p>
        </div>
      </section>

      <HomepageExploreLinks />
      <TestimonialCarousel />
      <FAQ />
      <FinalCTA />
    </div>
  );
}
