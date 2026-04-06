import type { Metadata } from "next";
import Link from "next/link";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";

const faqItems = [
  {
    question: "What age/grade is WSC for?",
    answer: "Students in Grades 4-12 can participate. There are Junior and Senior divisions.",
  },
  {
    question: "Does my child need debate experience?",
    answer: "No. WSC includes debate as one of four events, and our coaching prepares students for all of them from scratch.",
  },
  {
    question: "When do WSC classes run?",
    answer: "WSC classes are seasonal, typically running in the months leading up to regional rounds. Contact us for the current schedule.",
  },
  {
    question: "How much does WSC coaching cost?",
    answer: "WSC classes follow our standard group pricing of $30-50/hr. See our pricing page for details.",
  },
  {
    question: "Where are WSC competitions held?",
    answer:
      "Regional rounds are held in cities worldwide, including Canada. Global rounds rotate between international cities. The Tournament of Champions is at Yale University.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "World Scholar's Cup Coaching & Preparation",
  description:
    "Prepare for the World Scholar's Cup with DSDC's expert coaching. 100% qualification rate from regionals to the Tournament of Champions at Yale since 2020. Online classes for Grades 4-12.",
  provider: {
    "@type": "Organization",
    name: "Debate & Speech Development Community (DSDC)",
    sameAs: "https://dsdc.ca",
  },
  url: "https://dsdc.ca/world-scholars-cup-coaching",
};

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/world-scholars-cup-coaching",
    title: "World Scholar's Cup Coaching Canada | 100% Qual. Rate | DSDC",
    description:
      "Prepare for the World Scholar's Cup with DSDC's expert coaching. 100% qualification rate from regionals to the Tournament of Champions at Yale since 2020. Online classes for Grades 4-12.",
    images: [
      {
        url: "/images/photos/wsc-students-1.jpg",
      },
    ],
    hasChineseVersion: false,
  });
}

export default function WorldScholarsCupCoachingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

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
            World Scholar&apos;s Cup Coaching &amp; Preparation
          </h1>
          <p className="text-xl text-white/90 font-sans mb-10 max-w-4xl mx-auto">
            100% qualification rate from regionals to the Tournament of Champions at Yale - every year since 2020
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="px-8 py-3.5 bg-gold-400 text-navy-900 font-semibold rounded-lg hover:bg-gold-300 transition-all duration-200 shadow-md text-center"
            >
              Book a Free Consultation
            </Link>
            <Link
              href="/classes"
              className="px-8 py-3.5 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-navy-800 transition-all duration-200 text-center"
            >
              View WSC Class Details
            </Link>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/Course"
        title="Key Facts"
        facts={[
          { label: "Program", value: "World Scholar's Cup preparation" },
          { label: "Qualification rate", value: "100% since 2020 from regionals, globals, and the Tournament of Champions at Yale" },
          { label: "Format", value: "Live online via Zoom" },
          { label: "Schedule", value: "Seasonal classes, 1x per week, 2 hours" },
          { label: "Ages", value: "Grades 4-12" },
          { label: "Pricing", value: "$30-50 CAD/hr (group classes)" },
          { label: "Competition destinations", value: "Beijing, Amsterdam, Sydney, and Yale University" },
          { label: "Events covered", value: "Team Debate, Collaborative Writing, Scholar's Challenge, and Scholar's Bowl" },
        ]}
      />

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 dark:text-white mb-8 text-center">
            What Is the World Scholar&apos;s Cup?
          </h2>
          <div className="space-y-5 text-charcoal/80 dark:text-navy-200 text-lg leading-relaxed font-sans">
            <p>
              The World Scholar&apos;s Cup (WSC) is a global academic competition for students of all ages, founded in
              2006. It combines four events: Team Debate, Collaborative Writing, Scholar&apos;s Challenge (a
              multiple-choice test), and Scholar&apos;s Bowl. For many families, WSC is the first major international
              competition that blends speaking, writing, critical thinking, and teamwork in one program.
            </p>
            <p>
              Students compete in regional rounds held in cities worldwide, advance to global rounds (hosted in
              locations like Beijing, Amsterdam, Sydney, Dubai, and others), and the top scholars qualify for the
              Tournament of Champions held annually at Yale University. This progression gives students a clear pathway
              from local participation to world-level achievement.
            </p>
            <p>
              WSC is known for its interdisciplinary approach. Each year&apos;s curriculum spans six subjects: Science,
              History, Art &amp; Music, Literature, Social Studies, and a Special Area. The themes are deliberately
              thought-provoking and designed to reward curiosity, perspective, and intellectual flexibility rather than
              memorization alone.
            </p>
            <p>
              For students in Grades 4-12, it is one of the most rewarding academic journeys available. Beyond medals
              and rankings, WSC builds confidence, communication skills, and a lasting global community of peers who
              share a love of learning.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-6">
            DSDC&apos;s World Scholar&apos;s Cup Results
          </h2>
          <p className="text-center text-2xl md:text-3xl font-bold text-gold-600 dark:text-gold-300 mb-6">
            100% Qualification Rate Since 2020
          </p>
          <p className="text-lg text-charcoal/80 dark:text-navy-200 leading-relaxed font-sans text-center max-w-4xl mx-auto">
            Every DSDC student who has entered a World Scholar&apos;s Cup regional round since 2020 has qualified to
            advance - through regionals, globals, and the Tournament of Champions at Yale. This is a record we&apos;re
            incredibly proud of.
          </p>
          <p className="text-base text-charcoal/70 dark:text-navy-300 font-sans text-center mt-4">
            Our students have traveled to compete in Beijing, Amsterdam, Sydney, and New Haven (Yale).
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-10">
            How We Prepare Students for the World Scholar&apos;s Cup
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              "Seasonal classes (1x per week, 2 hours) aligned with the WSC competition calendar",
              "Curriculum coverage across all six WSC subject areas",
              "Practice in Team Debate, Collaborative Writing, Scholar's Challenge, and Scholar's Bowl",
              "Mock competitions and timed practice rounds to build confidence under pressure",
              "Personalized feedback and targeted prep based on each student's strengths and weaknesses",
              "Fully online via Zoom, so students can join from anywhere",
            ].map((point) => (
              <div
                key={point}
                className="rounded-xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800 px-4 py-3 text-sm sm:text-base text-navy-800 dark:text-navy-100"
              >
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-8">
            Is the World Scholar&apos;s Cup Right for Your Child?
          </h2>
          <div className="space-y-5 text-lg text-charcoal/80 dark:text-navy-200 leading-relaxed font-sans">
            <p>
              WSC is ideal for curious, academically motivated students who love learning across subjects. You
              don&apos;t need debate experience to start - many of our WSC students are trying competitive academics for
              the first time.
            </p>
            <p>
              Students in Grades 4-12 can participate. Younger students compete in the Junior division, while older
              students compete in the Senior division.
            </p>
            <p>
              If your child loves reading, trivia, writing, or intellectual discussion, WSC is a perfect fit.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            The World Scholar&apos;s Cup Competition Pathway
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Regional Round",
                text: "Held in cities worldwide (including in Canada). Top teams qualify for globals.",
              },
              {
                step: "2",
                title: "Global Round",
                text: "Held in a major international city (Beijing, Amsterdam, Sydney, etc.). Top scholars qualify for the Tournament of Champions.",
              },
              {
                step: "3",
                title: "Tournament of Champions",
                text: "Held at Yale University in New Haven, Connecticut. The pinnacle of WSC.",
              },
            ].map((item) => (
              <article
                key={item.step}
                className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800 p-6"
              >
                <p className="text-gold-500 font-bold text-sm uppercase tracking-wide mb-3">Step {item.step}</p>
                <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-charcoal/70 dark:text-navy-300 font-sans leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>
          <p className="text-center text-base text-charcoal/70 dark:text-navy-300 font-sans mt-8">
            DSDC students have qualified through all three levels with a 100% rate since 2020.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
            World Scholar&apos;s Cup FAQ
          </h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group bg-white dark:bg-navy-800 rounded-xl overflow-hidden shadow-sm border border-warm-200 dark:border-navy-700"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between p-4 sm:p-5 hover:bg-warm-50 dark:hover:bg-navy-700/50 transition-colors">
                  <span className="text-navy-800 dark:text-navy-100 font-semibold pr-4 text-sm sm:text-base font-sans">
                    {item.question}
                  </span>
                  <span className="shrink-0 w-8 h-8 rounded-full bg-navy-800 dark:bg-navy-600 text-white flex items-center justify-center">
                    +
                  </span>
                </summary>
                <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm sm:text-base text-charcoal/70 dark:text-navy-200 leading-relaxed font-sans">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-navy-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
            Ready to start your child&apos;s World Scholar&apos;s Cup journey?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/book"
              className="px-8 py-3.5 bg-gold-400 text-navy-900 font-semibold rounded-lg hover:bg-gold-300 transition-all duration-200 shadow-md text-center"
            >
              Book a Free Consultation
            </Link>
            <Link
              href="/classes"
              className="px-8 py-3.5 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-navy-800 transition-all duration-200 text-center"
            >
              Explore Our Classes
            </Link>
          </div>
          <p className="text-sm sm:text-base text-white/85 font-sans">
            Explore our other{" "}
            <Link href="/online-debate-classes" className="underline underline-offset-4 hover:text-gold-300 transition-colors">
              online debate classes
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
