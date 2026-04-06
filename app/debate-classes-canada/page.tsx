import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { buildFaqSchema, buildBreadcrumbSchema, SITE_URL, SITE_LOGO_URL } from "@/lib/structuredData";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/debate-classes-canada",
    title: "Debate Classes for Kids in Canada | Online | DSDC",
    description:
      "Online debate classes for kids across Canada. Grades 4-12, small classes, award-winning coaches. Build confidence, critical thinking, and public speaking skills.",
    keywords: [
      "debate classes canada",
      "debate classes for kids canada",
      "online debate classes canada",
      "kids debate program canada",
      "youth debate training canada",
      "public speaking classes canada",
    ],
    images: [{ url: "/images/photos/wsc-students-2.jpg" }],
    hasChineseVersion: false,
  });
}

const faqItems = [
  {
    question: "What ages are DSDC debate classes for?",
    answer:
      "DSDC offers debate and public speaking classes for students in Grades 4 through 12. We have separate programs for elementary (Grades 4-6), intermediate (Grades 7-9), and senior (Grades 10-12) students.",
  },
  {
    question: "Can students from any province in Canada join?",
    answer:
      "Yes. All DSDC classes are delivered live online via Zoom, so students from British Columbia, Alberta, Ontario, Quebec, and every other province and territory can participate. We have students from over 30 cities across Canada.",
  },
  {
    question: "How much do debate classes cost in Canada?",
    answer:
      "DSDC group debate classes range from $30 to $50 CAD per hour, depending on the program level. Private coaching is also available. See our pricing page for full details.",
  },
  {
    question: "What debate formats do you teach?",
    answer:
      "We teach Canadian National Debate Format (CNDF), British Parliamentary, World Schools, and Cross-Examination. Students learn the format most relevant to their age and competition goals.",
  },
  {
    question: "Do students need prior debate experience?",
    answer:
      "No experience is needed. Our Novice Debate program is designed specifically for beginners. Many students start with no debate experience and progress to compete at national and international tournaments.",
  },
  {
    question: "How are online debate classes structured?",
    answer:
      "Each class is 1 to 1.5 hours long, held live on Zoom with 8-12 students per class. Students receive direct coaching feedback every session. Classes run weekly during the school year.",
  },
];

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "DSDC Online Debate Classes for Kids in Canada",
  description:
    "Live online debate and public speaking classes for Canadian students in Grades 4-12. Small group format with award-winning coaches.",
  provider: {
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: "Debate & Speech Development Community",
    url: SITE_URL,
    logo: SITE_LOGO_URL,
  },
  hasCourseInstance: [
    {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT1H30M",
      instructor: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
      },
    },
  ],
  offers: {
    "@type": "Offer",
    category: "Paid",
    priceCurrency: "CAD",
    price: "30",
    url: `${SITE_URL}/pricing`,
  },
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
    suggestedMinAge: 9,
    suggestedMaxAge: 18,
  },
  inLanguage: "en",
  availableLanguage: ["en", "zh"],
  areaServed: {
    "@type": "Country",
    name: "Canada",
  },
};

export default function DebateClassesCanadaPage() {
  return (
    <>
      <JsonLd data={courseSchema} id="canada-course-schema" />
      <JsonLd data={buildFaqSchema(faqItems)} id="canada-faq-schema" />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Debate Classes Canada", path: "/debate-classes-canada" },
        ])}
        id="canada-breadcrumb-schema"
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Debate Classes for Kids in Canada
          </h1>
          <p className="text-xl text-white/90 font-sans mb-8 max-w-3xl mx-auto">
            Live online debate and public speaking classes for students in Grades 4-12 across every province.
            Small classes, award-winning coaches, proven results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="inline-block bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold px-8 py-3 rounded-lg transition-colors"
            >
              Book a Free Consultation
            </Link>
            <Link
              href="/classes"
              className="inline-block border-2 border-white/40 hover:border-white text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              View All Classes
            </Link>
          </div>
        </div>
      </section>

      {/* Why DSDC */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 dark:text-white mb-8 text-center">
            Why Canadian Families Choose DSDC
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none font-sans">
            <p>
              DSDC is Canada&apos;s leading online youth debate training program. Founded in Vancouver in 2017, we&apos;ve
              coached over 5,000 students from more than 30 cities across Canada &mdash; from Vancouver and Surrey to
              Toronto, Calgary, Ottawa, and beyond. Our kids debate program combines expert instruction with small class
              sizes so every student receives personalized feedback every session.
            </p>
            <p>
              Unlike traditional debate clubs that rely on volunteer coaches, DSDC&apos;s classes are led by
              award-winning competitive debaters from top Canadian universities. Our coaches have competed at Canadian
              Nationals, US Nationals, World Schools, and the World Scholar&apos;s Cup Tournament of Champions at Yale.
              This depth of experience means your child learns from debaters who have succeeded at the highest levels.
            </p>
            <p>
              All classes are delivered live online via Zoom, making high-quality debate coaching accessible to families
              in every province and territory. Whether you live in downtown Toronto or rural Alberta, your child can
              participate in the same program that has produced national champions and World Scholar&apos;s Cup global
              qualifiers.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Overview */}
      <section className="py-16 md:py-24 bg-warm-50 dark:bg-navy-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 dark:text-white mb-10 text-center">
            Debate Programs for Every Level
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Novice Debate (Grades 4-7)",
                description:
                  "For students with no debate experience. Builds foundational skills in argumentation, public speaking, and critical thinking through fun, structured exercises.",
                link: "/debate-classes-for-beginners",
                linkText: "Learn about beginner classes",
              },
              {
                title: "Intermediate Debate (Grades 7-9)",
                description:
                  "Students learn formal debate formats (CNDF, British Parliamentary) and begin competing in regional tournaments. Focus on research, rebuttal, and persuasive delivery.",
                link: "/classes",
                linkText: "View class schedule",
              },
              {
                title: "Advanced Debate (Grades 9-12)",
                description:
                  "Tournament-focused preparation for Canadian Nationals, US Nationals, and international competitions. Advanced argumentation, case strategy, and competitive practice rounds.",
                link: "/online-debate-classes",
                linkText: "Explore advanced programs",
              },
              {
                title: "Public Speaking (Grades 4-9)",
                description:
                  "Dedicated public speaking classes for students who want to build confidence, leadership, and presentation skills without competitive debate.",
                link: "/public-speaking-classes-for-kids",
                linkText: "Public speaking classes",
              },
            ].map((program) => (
              <div
                key={program.title}
                className="rounded-2xl border border-warm-200 dark:border-navy-600 bg-white dark:bg-navy-900 p-6"
              >
                <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-3">{program.title}</h3>
                <p className="text-charcoal/75 dark:text-navy-200 font-sans mb-4">{program.description}</p>
                <Link href={program.link} className="text-sm font-semibold text-gold-600 dark:text-gold-400 hover:underline">
                  {program.linkText} &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regional Links */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 dark:text-white mb-6 text-center">
            Serving Students Across Canada
          </h2>
          <p className="text-center text-charcoal/70 dark:text-navy-200 font-sans mb-10 max-w-2xl mx-auto">
            While our classes are 100% online, we&apos;ve built dedicated pages for families in major regions to
            learn how DSDC fits local debate ecosystems and tournaments.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { href: "/debate-classes-vancouver", label: "Vancouver & BC" },
              { href: "/debate-classes-toronto", label: "Toronto & GTA" },
              { href: "/debate-classes-calgary", label: "Calgary" },
              { href: "/debate-classes-ottawa", label: "Ottawa" },
              { href: "/debate-classes-ontario", label: "Ontario" },
              { href: "/debate-classes-alberta", label: "Alberta" },
            ].map((region) => (
              <Link
                key={region.href}
                href={region.href}
                className="rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-800 px-4 py-3 text-center font-semibold text-navy-800 dark:text-white hover:border-gold-300 hover:bg-white dark:hover:border-gold-400 transition-colors"
              >
                {region.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/EducationalOrganization"
        title="Key Facts"
        facts={[
          { label: "Founded", value: "2017, Vancouver, Canada" },
          { label: "Format", value: "Live online via Zoom" },
          { label: "Class size", value: "8-12 students" },
          { label: "Ages", value: "Grades 4-12 and university students" },
          { label: "Pricing", value: "$30-50 CAD/hr (group classes)" },
          { label: "Formats taught", value: "CNDF, British Parliamentary, World Schools, Cross-Examination" },
          { label: "Location", value: "Vancouver, BC, Canada" },
          { label: "Service area", value: "All provinces across Canada via online classes" },
        ]}
      />

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 dark:text-white mb-10 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-warm-200 dark:border-navy-600 bg-warm-50 dark:bg-navy-800 overflow-hidden"
              >
                <summary className="cursor-pointer px-6 py-4 font-semibold text-navy-800 dark:text-white select-none">
                  {item.question}
                </summary>
                <div className="px-6 pb-4 text-charcoal/75 dark:text-navy-200 font-sans">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-navy-800 to-navy-700 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/85 font-sans mb-8">
            Book a free consultation to find the right debate or public speaking class for your child.
            No commitment, no pressure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="inline-block bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold px-8 py-3 rounded-lg transition-colors"
            >
              Book a Free Consultation
            </Link>
            <Link
              href="/pricing"
              className="inline-block border-2 border-white/40 hover:border-white text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
