import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { buildFaqSchema, buildBreadcrumbSchema, SITE_URL, SITE_LOGO_URL } from "@/lib/structuredData";
import { canadaFaqItems as faqItems } from "@/lib/faqData";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/debate-classes-canada",
    title: "Debate in Canada: Formats, Tournaments & How to Start | DSDC",
    description:
      "A guide to debate in Canada — the main formats taught in schools (CNDF, BP, World Schools), the national and provincial tournament circuit, and how families can find the right path into competitive debate.",
    keywords: [
      "debate in canada",
      "canadian debate formats",
      "canadian nationals debate",
      "osdu debate",
      "how to start debate canada",
      "debate tournaments canada",
    ],
    images: [{ url: "/images/photos/wsc-students-2.jpg" }],
    hasChineseVersion: false,
  });
}

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
            Debate in Canada: Formats, Tournaments & How to Start
          </h1>
          <p className="text-xl text-white/90 font-sans mb-8 max-w-3xl mx-auto">
            A practical overview of debate education in Canada — the formats taught in schools, the national
            and provincial tournament circuit, and how families find the right path into competitive debate.
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
            Debate Education in Canada: An Overview
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none font-sans">
            <p>
              Competitive debate in Canada is organized around a handful of well-established formats. The most
              common in school-based programs is the Canadian National Debate Format (CNDF), with British
              Parliamentary (BP), World Schools, and Cross-Examination (CX) also widely taught — particularly at
              the senior and university levels. Each format builds different strengths, and most serious debaters
              learn more than one.
            </p>
            <p>
              The national tournament circuit runs from early Fall through late Spring. Key events include the
              Canadian Student Debating Federation (CSDF) National Championships, the Ontario Student Debating
              Union (OSDU) tournaments, BC Provincials through the BC Debate Society, and a growing set of
              independent invitationals. Many Canadian students also compete at US National qualifiers and the
              World Scholar&apos;s Cup, which has a strong global footprint across Canadian schools.
            </p>
            <p>
              Most Canadian students first encounter debate through a school club, a public speaking program, or
              an external provider like DSDC. School clubs vary widely in consistency and coaching depth —
              especially outside major cities — which is why many families pair a school club with an online
              program that runs reliably every week. DSDC was founded in Vancouver in 2017 and runs live online
              classes for families in every province.
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
