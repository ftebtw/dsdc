import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "Is this different from the kids public speaking class?",
    answer:
      "Yes. Teen classes focus more on advanced delivery, persuasion, interview preparation, and real-world communication rather than basic speaking comfort alone.",
  },
  {
    question: "Can this help with university interviews?",
    answer:
      "Absolutely. Students practice articulating achievements, answering pressure questions, and projecting calm confidence in high-stakes speaking situations.",
  },
  {
    question: "Does my teen need prior experience?",
    answer:
      "No. We place students by skill level and adjust coaching expectations so beginners and more experienced speakers both have room to grow.",
  },
  {
    question: "How does this connect to debate?",
    answer:
      "Public speaking builds the delivery foundation for debate. Many teens add debate classes later to sharpen argumentation, rebuttal, and competitive experience.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Group classes generally range from $30 to $50 CAD per hour depending on the program. Visit the pricing page for current details.",
  },
];

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Public Speaking Classes for Teens", path: "/public-speaking-classes-for-teens" },
]);

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Public Speaking Classes for Teens",
  description:
    "Online public speaking classes for teens focused on presentation skill, interview readiness, leadership communication, and persuasive speaking.",
  provider: {
    "@type": "EducationalOrganization",
    name: "DSDC",
    url: "https://dsdc.ca",
  },
  url: "https://dsdc.ca/public-speaking-classes-for-teens",
};

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/public-speaking-classes-for-teens",
    title: "Public Speaking Classes for Teens — Online for Grades 9-12 | DSDC",
    description:
      "Online public speaking classes for teens. Build presentation, interview, and leadership communication skills. Expert coaches, small classes. Book a free consultation.",
    images: [{ url: "/images/photos/dsdc-class-photo.jpg" }],
    hasChineseVersion: false,
  });
}

export default function PublicSpeakingClassesForTeensPage() {
  return (
    <>
      <JsonLd id="public-speaking-teens-course-schema" data={courseSchema} />
      <JsonLd id="public-speaking-teens-faq-schema" data={faqSchema} />
      <JsonLd id="public-speaking-teens-breadcrumb-schema" data={breadcrumbSchema} />

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
            Public Speaking Classes for Teens That Prepare Them for What&apos;s Next
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            Live online coaching for high school students who want stronger presentations, better interview skills,
            and more confidence in leadership, academic, and professional settings.
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
          { label: "Best for", value: "High school students preparing for presentations, interviews, and leadership" },
          { label: "Typical ages", value: "Grades 9-12" },
          { label: "Class size", value: "Usually 8-12 students" },
          { label: "Feedback", value: "Personalized written feedback after class" },
          { label: "Next step", value: "Can lead into competitive debate, university debate, or continued speaking development" },
        ]}
      />

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Why Public Speaking Matters for Teens
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              High school is when communication becomes visibly consequential. Teens need to present in class, answer
              questions on the spot, interview for scholarships or university opportunities, and represent themselves
              clearly in increasingly adult settings. Public speaking stops being a nice extra and starts becoming a
              practical advantage.
            </p>
            <p>
              Teen students benefit from more than simple comfort on stage. They need stronger delivery, better
              audience awareness, and the ability to adjust tone depending on whether they are answering an interview
              question, leading a club discussion, or giving a formal presentation. That is why teen speaking training
              should move past basics and into persuasion, adaptability, and higher-stakes communication.
            </p>
            <p>
              These are also the years when students begin building a profile for what comes next. University
              applications, scholarship interviews, student leadership positions, Model UN, and job interviews all
              reward teenagers who can think on their feet and communicate with maturity. Public speaking gives them a
              repeatable framework for doing that well.
            </p>
            <p>
              Families with younger siblings often compare this path with our{" "}
              <Link
                href="/public-speaking-classes-for-kids"
                className="underline underline-offset-4 transition-colors hover:text-gold-500"
              >
                public speaking classes for kids
              </Link>
              . Families who want to understand the coaching style behind these programs can also meet the{" "}
              <Link href="/team" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                DSDC team
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            What Teens Learn
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                title: "Presentation Mastery",
                text: "Students learn how to structure, deliver, and pace presentations with more control so they can speak clearly without relying on slides as a crutch.",
              },
              {
                title: "Interview & Application Skills",
                text: "Teens practice articulating achievements, answering pressure questions, and projecting confidence in scholarship, university, and leadership interviews.",
              },
              {
                title: "Persuasion & Influence",
                text: "Students learn how to adapt language to different audiences, choose stronger examples, and use rhetorical strategy more intentionally.",
              },
              {
                title: "Impromptu & Adaptive Speaking",
                text: "Teens practice thinking on their feet, handling Q&A, and speaking effectively even when they have little or no preparation time.",
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
              These skills also bridge naturally into debate. Students who already speak with confidence often find it
              much easier to add argumentation, rebuttal, and strategic comparison later through{" "}
              <Link
                href="/online-debate-classes"
                className="underline underline-offset-4 transition-colors hover:text-gold-500"
              >
                online debate classes
              </Link>{" "}
              or a gentler entry through{" "}
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
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Class Levels
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                title: "Senior Debate",
                text: "Senior-level students work on more mature analysis, stronger structure, and higher-level strategic thinking. This is a strong fit for teens who want communication training that also feels academically rigorous.",
              },
              {
                title: "Advanced Competitive",
                text: "Advanced students complete more intense practice, more detailed debriefs, and higher expectations around preparation. It suits teens aiming for serious tournament-level communication development.",
              },
              {
                title: "Public Speaking Program",
                text: "The teen public speaking pathway focuses on presentations, interviews, persuasion, and adaptive speaking for real academic and professional contexts. It is ideal for students who want direct communication growth without needing a full debate focus right away.",
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
              If you want to compare these pathways in more detail, browse the broader{" "}
              <Link href="/classes" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                classes page
              </Link>
              , review{" "}
              <Link href="/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                pricing
              </Link>
              , compare this teen-focused path with the more debate-centered options used by families through our{" "}
              <Link
                href="/debate-classes-vancouver"
                className="underline underline-offset-4 transition-colors hover:text-gold-500"
              >
                debate classes in Vancouver
              </Link>
              , and then decide whether to add debate later.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            How Public Speaking Helps Teens
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            {[
              {
                title: "University and scholarship applications",
                text: "Teens learn how to present achievements, answer difficult questions, and communicate maturity under pressure.",
              },
              {
                title: "Class presentations and oral exams",
                text: "Students become calmer, clearer, and more structured in the kinds of presentations that affect high school performance directly.",
              },
              {
                title: "Student leadership and Model UN",
                text: "Stronger speaking makes it easier to lead clubs, participate in conferences, and represent ideas with authority.",
              },
              {
                title: "Job interviews and career readiness",
                text: "Public speaking habits carry into internships, customer-facing roles, and the professional communication skills teens will need after graduation.",
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
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              For many families, this is the most practical communication investment a teen can make. It helps with
              current school demands while also laying the groundwork for what comes next, whether that means
              university applications, student leadership, or more competitive academic speaking.
            </p>
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
                  Is this different from the kids public speaking class?
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                  +
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:px-5 sm:pb-5 sm:text-base font-sans">
                Yes. Teen classes focus more on advanced delivery, persuasion, interview preparation, and real-world
                application than the younger-student foundation track. Families with younger siblings can compare it
                with our{" "}
                <Link
                  href="/public-speaking-classes-for-kids"
                  className="underline underline-offset-4 transition-colors hover:text-gold-500"
                >
                  kids public speaking page
                </Link>
                .
              </p>
            </details>
            <details className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-warm-50 dark:hover:bg-navy-700/50 sm:p-5">
                <span className="pr-4 text-sm font-semibold text-navy-800 dark:text-navy-100 sm:text-base font-sans">
                  Can this help with university interviews?
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                  +
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:px-5 sm:pb-5 sm:text-base font-sans">
                Absolutely. Students practice explaining achievements, answering difficult questions, and sounding more
                confident in high-pressure situations.
              </p>
            </details>
            <details className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-warm-50 dark:hover:bg-navy-700/50 sm:p-5">
                <span className="pr-4 text-sm font-semibold text-navy-800 dark:text-navy-100 sm:text-base font-sans">
                  Does my teen need prior experience?
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                  +
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:px-5 sm:pb-5 sm:text-base font-sans">
                No. We place students by skill level and adjust coaching expectations accordingly.
              </p>
            </details>
            <details className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-warm-50 dark:hover:bg-navy-700/50 sm:p-5">
                <span className="pr-4 text-sm font-semibold text-navy-800 dark:text-navy-100 sm:text-base font-sans">
                  How does this connect to debate?
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                  +
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:px-5 sm:pb-5 sm:text-base font-sans">
                Public speaking builds the delivery foundation for debate. Many teens later add{" "}
                <Link
                  href="/online-debate-classes"
                  className="underline underline-offset-4 transition-colors hover:text-gold-500"
                >
                  online debate classes
                </Link>{" "}
                when they want more argumentation, rebuttal, and competitive experience.
              </p>
            </details>
            <details className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-warm-50 dark:hover:bg-navy-700/50 sm:p-5">
                <span className="pr-4 text-sm font-semibold text-navy-800 dark:text-navy-100 sm:text-base font-sans">
                  How much does it cost?
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                  +
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:px-5 sm:pb-5 sm:text-base font-sans">
                Group classes generally range from $30-50 CAD per hour. See{" "}
                <Link href="/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                  pricing
                </Link>{" "}
                for the current details.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="bg-navy-800 py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-5 text-3xl font-bold text-white md:text-4xl">
            Ready to help your teen communicate with more confidence?
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">
            Compare our{" "}
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
            , and then{" "}
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
