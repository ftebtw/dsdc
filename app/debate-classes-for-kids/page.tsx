import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "What age should kids start debate?",
    answer:
      "Many students start in Grades 4 through 6. DSDC places students by age, confidence, and experience so beginners can start in the right group.",
  },
  {
    question: "Does my child need experience?",
    answer:
      "No. Our novice classes are designed for complete beginners, including shy students who are still building confidence in speaking up.",
  },
  {
    question: "What debate formats do kids learn?",
    answer:
      "Students learn CNDF, British Parliamentary, World Schools, and Cross-Examination depending on age and level.",
  },
  {
    question: "How is this different from public speaking classes?",
    answer:
      "Debate adds direct argumentation, rebuttal, and strategic clash. Public speaking focuses more on delivery, confidence, and speech structure. Many families start with one and later add the other.",
  },
  {
    question: "How much do classes cost?",
    answer:
      "Group classes generally range from $30 to $50 CAD per hour depending on the program. Visit the pricing page for current details.",
  },
  {
    question: "How do online debate classes work?",
    answer:
      "Classes are live on Zoom in small groups, with direct instruction, breakout practice, structured rounds, and coach feedback every session.",
  },
];

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Debate Classes for Kids", path: "/debate-classes-for-kids" },
]);

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Novice Debate Classes for Kids (Grades 4-6)",
  description:
    "Beginner-level online debate classes for elementary-age kids in Grades 4 through 6. Small Zoom groups, gentle first-speaker coaching, and written feedback after every session.",
  provider: {
    "@type": "EducationalOrganization",
    name: "DSDC",
    url: "https://dsdc.ca",
  },
  url: "https://dsdc.ca/debate-classes-for-kids",
};

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/debate-classes-for-kids",
    title: "Novice Debate Classes for Kids (Grades 4-6) | DSDC",
    description:
      "Beginner-friendly online debate classes for kids in Grades 4-6. Small Zoom groups, gentle on-ramp for shy first-time speakers, no experience required. Novice level only.",
    images: [{ url: "/images/photos/dsdc-class-photo.jpg" }],
    hasChineseVersion: false,
  });
}

export default function DebateClassesForKidsPage() {
  return (
    <>
      <JsonLd id="debate-kids-course-schema" data={courseSchema} />
      <JsonLd id="debate-kids-faq-schema" data={faqSchema} />
      <JsonLd id="debate-kids-breadcrumb-schema" data={breadcrumbSchema} />

      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 pb-20 pt-32 md:pb-28 md:pt-40">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Novice Debate Classes for Kids in Grades 4-6
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            A beginner-friendly online debate class built specifically for elementary-age first-timers.
            Small Zoom groups, patient coaching, and a gentle on-ramp for shy or cautious young speakers —
            no experience required.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/book"
              className="rounded-lg bg-gold-400 px-8 py-3.5 text-center font-semibold text-navy-900 shadow-md transition-all duration-200 hover:bg-gold-300"
            >
              Book a Free Consultation
            </Link>
            <Link
              href="/classes"
              className="rounded-lg border-2 border-white px-8 py-3.5 text-center font-semibold text-white transition-all duration-200 hover:bg-white hover:text-navy-800"
            >
              View Our Classes
            </Link>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/Course"
        title="At a Glance"
        facts={[
          { label: "Format", value: "Live online via Zoom" },
          { label: "Best for", value: "First-time debaters in Grades 4-6 — including shy or cautious kids" },
          { label: "Level", value: "Novice only (no experience required)" },
          { label: "Class size", value: "Usually 8-12 students" },
          { label: "Feedback", value: "Personalized written feedback after class" },
          { label: "Next step", value: "Progress into Junior (Grades 7-9) once fundamentals are solid" },
        ]}
      />

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Why Grade 4-6 Is the Right Age to Start
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              Ages 9 to 12 are a sweet spot for starting debate. Kids at this age can already hold a short
              conversation, follow a simple argument, and begin to form opinions — but they haven&apos;t yet
              developed the self-consciousness that can make middle school students reluctant to speak up. Starting
              in Grades 4-6 means your child builds the confidence habit before it becomes hard to build.
            </p>
            <p>
              Our novice curriculum keeps the fundamentals front and center: how to give a short speech, how to
              listen to someone who disagrees, and how to respond calmly with a reason instead of a reaction. We
              deliberately keep the pace gentle. Shy kids get time to warm up, and outgoing kids learn to slow
              down and structure their thoughts rather than just talking fast.
            </p>
            <p>
              Because this class is novice-only, every student in the room is also a first-time debater. That
              matters. Kids don&apos;t compare themselves to experienced classmates on day one — they progress
              together. When students are ready to move up, they graduate into our Junior program (Grades 7-9) or
              Public Speaking path, both of which assume the groundwork is already in place.
            </p>
            <p>
              Unlike a pure{" "}
              <Link
                href="/public-speaking-classes-for-kids"
                className="underline underline-offset-4 transition-colors hover:text-gold-500"
              >
                public speaking path
              </Link>
              , debate adds direct clash, rebuttal, and strategy. Families who want a broader comparison can also read
              our article on{" "}
              <Link
                href="/blog/public-speaking-benefits"
                className="underline underline-offset-4 transition-colors hover:text-gold-500"
              >
                public speaking benefits
              </Link>
              , meet the{" "}
              <Link href="/team" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                DSDC coaches
              </Link>
              , and compare how our Vancouver-founded program serves families through both{" "}
              <Link
                href="/debate-classes-vancouver"
                className="underline underline-offset-4 transition-colors hover:text-gold-500"
              >
                local BC classes
              </Link>{" "}
              and broader{" "}
              <Link
                href="/debate-classes-canada"
                className="underline underline-offset-4 transition-colors hover:text-gold-500"
              >
                debate classes across Canada
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            What Kids Learn in DSDC&apos;s Debate Classes
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                title: "Argumentation & Case Building",
                text: "Students learn how to structure a case with clear claims, evidence, and reasoning so their ideas sound organized and persuasive rather than scattered.",
              },
              {
                title: "Rebuttal & Critical Listening",
                text: "Kids practice listening carefully to opposing arguments and then responding with logic, precision, and calm under pressure.",
              },
              {
                title: "Research & Evidence Use",
                text: "Students learn how to find, evaluate, and present evidence from credible sources instead of relying on unsupported opinions alone.",
              },
              {
                title: "Teamwork & Strategy",
                text: "Debaters learn how to coordinate with partners, divide arguments, manage time, and adapt their strategy as a round unfolds.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{item.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              These skills carry directly into school essays, class participation, interviews, student leadership, and
              more advanced enrichment opportunities. Families who want a softer on-ramp before a full debate pathway
              often compare this page with our{" "}
              <Link
                href="/debate-classes-for-beginners"
                className="underline underline-offset-4 transition-colors hover:text-gold-500"
              >
                debate classes for beginners
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Where Novice Fits in the DSDC Pathway
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base text-charcoal/70 dark:text-navy-200 font-sans">
            This page covers the Novice level (Grades 4-6). The other levels below show the path forward as
            your child grows out of novice and into Junior, Senior, and Advanced Competitive debate.
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[
              {
                title: "Novice",
                text: "Novice classes focus on confidence, speech structure, first rebuttals, and the basic habits that help younger students enjoy debate from the beginning. This is often the right first step for Grade 4-6 students or any beginner who needs a supportive entry point.",
              },
              {
                title: "Junior",
                text: "Junior classes raise the pace and analytical depth. Students start working with stronger comparisons, more challenging motions, and more active rebuttal, which makes this level a strong fit for middle school students ready for more structure and intensity.",
              },
              {
                title: "Senior",
                text: "Senior classes emphasize deeper research, more mature case construction, and stronger strategic judgment. This level is ideal for high school students who want a more academically rigorous debate environment.",
              },
              {
                title: "Advanced Competitive",
                text: "Advanced students complete more demanding practice rounds, detailed debriefs, and higher-level competitive preparation. This path is designed for students who want serious tournament training and a clear progression into stronger competitive results.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 bg-warm-50 p-6 dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{item.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              Families comparing long-term options can browse the full{" "}
              <Link href="/classes" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                class pathway
              </Link>
              , review{" "}
              <Link href="/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                pricing
              </Link>
              , and see how DSDC moves students from novice confidence-building into higher-level competition.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            How Debate Helps at School and Beyond
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            {[
              {
                title: "Academic performance",
                text: "Structured argumentation improves essays, oral responses, and the way students handle complex exam questions.",
              },
              {
                title: "Leadership and participation",
                text: "Students who debate often contribute more confidently in class, clubs, student council, and team projects.",
              },
              {
                title: "University applications",
                text: "Debate remains one of the strongest extracurriculars for students who want evidence of communication, discipline, and intellectual curiosity.",
              },
              {
                title: "A foundation for future programs",
                text: "Debate creates a natural bridge into advanced competitive debate, leadership opportunities, and even Model UN-style academic environments.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{item.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            <details className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-warm-50 dark:hover:bg-navy-700/50 sm:p-5">
                <span className="pr-4 text-sm font-semibold text-navy-800 dark:text-navy-100 sm:text-base font-sans">
                  What age should kids start debate?
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                  +
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:px-5 sm:pb-5 sm:text-base font-sans">
                Many students start in Grades 4-6. DSDC places students by age, confidence, and experience so they
                begin at the right level.
              </p>
            </details>
            <details className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-warm-50 dark:hover:bg-navy-700/50 sm:p-5">
                <span className="pr-4 text-sm font-semibold text-navy-800 dark:text-navy-100 sm:text-base font-sans">
                  Does my child need experience?
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                  +
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:px-5 sm:pb-5 sm:text-base font-sans">
                No. Our novice classes are designed for complete beginners, including students who are still shy about
                speaking in front of others.
              </p>
            </details>
            <details className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-warm-50 dark:hover:bg-navy-700/50 sm:p-5">
                <span className="pr-4 text-sm font-semibold text-navy-800 dark:text-navy-100 sm:text-base font-sans">
                  What debate formats do kids learn?
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                  +
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:px-5 sm:pb-5 sm:text-base font-sans">
                Students learn CNDF, British Parliamentary, World Schools, and Cross-Examination depending on age and
                level. For a fuller explanation, see our{" "}
                <Link
                  href="/blog/canadian-debate-formats"
                  className="underline underline-offset-4 transition-colors hover:text-gold-500"
                >
                  guide to Canadian debate formats
                </Link>
                .
              </p>
            </details>
            <details className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-warm-50 dark:hover:bg-navy-700/50 sm:p-5">
                <span className="pr-4 text-sm font-semibold text-navy-800 dark:text-navy-100 sm:text-base font-sans">
                  How is this different from public speaking classes?
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                  +
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:px-5 sm:pb-5 sm:text-base font-sans">
                Debate adds direct argumentation, rebuttal, and strategic clash. Public speaking focuses more on
                delivery and speech structure. Many families compare both paths on our{" "}
                <Link
                  href="/public-speaking-classes-for-kids"
                  className="underline underline-offset-4 transition-colors hover:text-gold-500"
                >
                  public speaking classes for kids
                </Link>{" "}
                page.
              </p>
            </details>
            <details className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-warm-50 dark:hover:bg-navy-700/50 sm:p-5">
                <span className="pr-4 text-sm font-semibold text-navy-800 dark:text-navy-100 sm:text-base font-sans">
                  How much do classes cost?
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                  +
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:px-5 sm:pb-5 sm:text-base font-sans">
                Group classes generally range from $30-50 CAD per hour. Visit{" "}
                <Link href="/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                  pricing
                </Link>{" "}
                for the current breakdown.
              </p>
            </details>
            <details className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-warm-50 dark:hover:bg-navy-700/50 sm:p-5">
                <span className="pr-4 text-sm font-semibold text-navy-800 dark:text-navy-100 sm:text-base font-sans">
                  How do online debate classes work?
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                  +
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:px-5 sm:pb-5 sm:text-base font-sans">
                Classes are live on Zoom with small groups, breakout-room practice, structured rounds, and coach
                feedback every session.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="bg-navy-800 py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-5 text-3xl font-bold text-white md:text-4xl">
            Ready to help your child become a stronger thinker and speaker?
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">
            Explore our{" "}
            <Link href="/classes" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              classes
            </Link>
            , review{" "}
            <Link href="/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              pricing
            </Link>
            , meet the{" "}
            <Link href="/team" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              coaching team
            </Link>
            , and{" "}
            <Link href="/book" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              book a free consultation
            </Link>
            .
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/book"
              className="rounded-lg bg-gold-400 px-8 py-3.5 text-center font-semibold text-navy-900 shadow-md transition-all duration-200 hover:bg-gold-300"
            >
              Book a Free Consultation
            </Link>
            <Link
              href="/classes"
              className="rounded-lg border-2 border-white px-8 py-3.5 text-center font-semibold text-white transition-all duration-200 hover:bg-white hover:text-navy-800"
            >
              Explore Classes
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
