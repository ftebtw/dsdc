import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "What age is best for public speaking classes for kids?",
    answer:
      "Many students benefit from starting in Grades 4 through 9, but the right time depends on the child. Students who are shy, thoughtful, or eager to speak more confidently often improve quickly when they start early.",
  },
  {
    question: "What do kids actually do in a public speaking course?",
    answer:
      "Students practice impromptu speaking, persuasive speeches, presentation structure, vocal delivery, and audience awareness. They also receive written feedback after class so they know what to improve next.",
  },
  {
    question: "Is this a good fit if my child is nervous about speaking in front of others?",
    answer:
      "Yes. DSDC&apos;s public speaking classes are designed to help students build confidence gradually in a supportive environment, rather than throwing them into high-pressure performance too quickly.",
  },
  {
    question: "How do public speaking classes connect to debate later on?",
    answer:
      "Public speaking gives students a strong foundation in clarity, confidence, and structure. Many families use it as a bridge into debate once their child is ready for more direct argumentation and rebuttal.",
  },
  {
    question: "How much do classes cost and how do we get started?",
    answer:
      "You can review our pricing online and then book a free consultation. We&apos;ll recommend the best class based on your child&apos;s age, confidence level, and goals.",
  },
  {
    question: "Do online public speaking classes really work?",
    answer:
      "They do when they are interactive and feedback-rich. Students still speak live, practice in small groups, and receive direct coaching, but families avoid commuting and scheduling headaches.",
  },
];

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Public Speaking Classes for Kids", path: "/public-speaking-classes-for-kids" },
]);

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Public Speaking Classes for Kids",
  description:
    "DSDC offers online public speaking classes for kids focused on confidence, leadership, academic communication, and clear speaking skills.",
  provider: {
    "@type": "EducationalOrganization",
    name: "DSDC",
    url: "https://dsdc.ca",
  },
  url: "https://dsdc.ca/public-speaking-classes-for-kids",
};

export const metadata: Metadata = {
  title: "Public Speaking Classes for Kids | DSDC",
  description:
    "DSDC offers public speaking classes for kids that build confidence, leadership, and academic communication skills through live online coaching.",
  alternates: {
    canonical: "https://dsdc.ca/public-speaking-classes-for-kids",
  },
  openGraph: {
    title: "Public Speaking Classes for Kids | DSDC",
    description:
      "DSDC offers public speaking classes for kids that build confidence, leadership, and academic communication skills through live online coaching.",
    url: "https://dsdc.ca/public-speaking-classes-for-kids",
    siteName: "DSDC",
    type: "website",
    images: [{ url: "/images/photos/dsdc-class-photo.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Public Speaking Classes for Kids | DSDC",
    description:
      "DSDC offers public speaking classes for kids that build confidence, leadership, and academic communication skills through live online coaching.",
    images: ["/images/photos/dsdc-class-photo.jpg"],
  },
};

export default function PublicSpeakingClassesForKidsPage() {
  return (
    <>
      <JsonLd id="public-speaking-course-schema" data={courseSchema} />
      <JsonLd id="public-speaking-faq-schema" data={faqSchema} />
      <JsonLd id="public-speaking-breadcrumb-schema" data={breadcrumbSchema} />

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
            Public Speaking Classes for Kids That Build Confidence for Life
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            A live online kids public speaking course that helps students become clearer thinkers, stronger speakers,
            and more confident leaders at school and beyond.
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
          { label: "Best for", value: "Students who want confidence, presentation skill, and stronger communication" },
          { label: "Typical ages", value: "Grades 4-9" },
          { label: "Class size", value: "Usually 8-12 students" },
          { label: "Feedback", value: "Personalized written feedback after class" },
          { label: "Next step", value: "Can lead into debate classes or competitive speaking opportunities" },
        ]}
      />

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Why Public Speaking for Kids Matters So Much
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              Public speaking for kids is about much more than giving speeches. It teaches students how to organize
              their thoughts, communicate clearly, and trust their own voice. Parents often notice the benefits first
              in school presentations and class participation, but the long-term impact goes further than that. Strong
              speaking skills support leadership, academic confidence, and stronger self-expression in every part of a
              child&apos;s life.
            </p>
            <p>
              For some students, the biggest gain is confidence. A child who once avoided raising a hand in class
              starts answering questions more freely. A student who was nervous about speaking to new people becomes
              more comfortable making eye contact and explaining their ideas. These changes may look small at first,
              but they often transform how a child feels about school and social situations.
            </p>
            <p>
              Public speaking classes also help students become better thinkers. When a child learns how to explain an
              opinion clearly, support it with reasons, and adapt to an audience, they are practicing the same kinds of
              communication skills that help in essays, interviews, leadership roles, and later on in debate. That is
              why many families treat public speaking as foundational training rather than a niche elective.
            </p>
            <p>
              Parents are also often thinking about academic success in very practical terms. They want a child who can
              present a project calmly, contribute in class discussions, interview well, and communicate respectfully
              with adults. A strong kids public speaking course supports all of those goals because it teaches students
              how to organize ideas before they speak, not just how to sound polished once they begin.
            </p>
            <p>
              If you&apos;re comparing public speaking classes for kids with broader communication programs, it can be
              helpful to review our{" "}
              <Link href="/classes" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                full class lineup
              </Link>
              , see our{" "}
              <Link href="/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                pricing
              </Link>
              , and read our article on the{" "}
              <Link
                href="/blog/public-speaking-benefits"
                className="underline underline-offset-4 transition-colors hover:text-gold-500"
              >
                benefits of public speaking
              </Link>
              .
            </p>
            <p>
              Families who want a better sense of the teaching style can also meet our{" "}
              <Link href="/team" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                coaching team
              </Link>
              . That usually helps parents understand how DSDC balances warmth, structure, and clear expectations for
              younger speakers.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            What Kids Learn in DSDC&apos;s Public Speaking Classes
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                title: "Confidence and Presence",
                text: "Students learn how to stand, project, and speak with more assurance. Coaches help them develop posture, pacing, eye contact, and the ability to sound composed even when they feel nervous.",
              },
              {
                title: "Speech Structure and Persuasion",
                text: "Kids learn how to organize an idea into a beginning, middle, and end. They also practice supporting opinions with examples, which strengthens both speaking and writing.",
              },
              {
                title: "Impromptu Thinking",
                text: "A strong kids public speaking course should teach students how to think on their feet. We use quick prompts and short speaking rounds to help students respond calmly under time pressure.",
              },
              {
                title: "Audience Awareness",
                text: "Students learn to adjust tone, wording, and examples based on who is listening. This helps them become better communicators not only on stage, but also in school discussions and group work.",
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
              Parents are often surprised by how quickly these skills transfer into other areas. Students become more
              prepared for oral presentations, interviews, class discussions, and leadership roles in clubs or group
              projects. Clear speaking does not just help on stage; it changes how children participate in everyday
              learning.
            </p>
            <p>
              Public speaking is also one of the best stepping stones into debate. Once students learn how to speak
              clearly, structure a message, and stay calm in front of an audience, it becomes much easier for them to
              move into debate classes later if they want more direct argumentation and rebuttal. Families often pair
              this page with our{" "}
              <Link
                href="/debate-classes-for-beginners"
                className="underline underline-offset-4 transition-colors hover:text-gold-500"
              >
                beginner debate page
              </Link>{" "}
              when deciding which path fits best.
            </p>
            <p>
              Just as importantly, students begin to understand that speaking is a skill they can practice rather than
              a talent they either have or do not have. That mindset shift is often what unlocks lasting confidence,
              because children stop interpreting every nervous moment as a sign that they are bad at public speaking.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Class Structure and Levels
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                title: "Warm-Up and Short Speaking Rounds",
                text: "Classes usually begin with low-pressure speaking prompts to help students get comfortable and start using their voice right away.",
              },
              {
                title: "Focused Skill Instruction",
                text: "Each session teaches a specific communication skill such as speech openings, persuasive organization, vocal delivery, or audience engagement.",
              },
              {
                title: "Feedback and Progress Tracking",
                text: "Students receive direct feedback during class and personalized written notes after class so parents and students can see steady growth over time.",
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
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                title: "Foundation Stage",
                text: "Students focus on comfort, voice projection, and basic structure. This is where shy students learn that they can succeed without being pushed too far too quickly.",
              },
              {
                title: "Growth Stage",
                text: "As confidence rises, students begin handling longer speeches, stronger persuasive organization, and more spontaneous responses to prompts and questions.",
              },
              {
                title: "Bridge to Debate or Leadership",
                text: "For some students, public speaking remains the ideal long-term fit. For others, it becomes the bridge into debate, student leadership, interview preparation, or competition-focused communication.",
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
              DSDC&apos;s public speaking class is especially helpful for students who want a focused communication
              pathway without jumping straight into formal debate. It gives children the chance to practice regularly,
              build confidence gradually, and develop speaking habits that carry into academics and leadership
              opportunities.
            </p>
            <p>
              Families can also use public speaking as a first step before moving into our broader{" "}
              <Link href="/classes" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                debate classes for kids
              </Link>
              . For some students, public speaking remains the right long-term fit. For others, it becomes the bridge
              into debate, World Scholar&apos;s Cup, or more advanced academic communication training. If you want to
              understand who will be teaching your child, you can also meet our{" "}
              <Link href="/team" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                coaching team
              </Link>
              .
            </p>
            <p>
              Over time, parents often see the difference in places far beyond the class itself. Students participate
              more confidently in school, speak with more clarity during interviews or presentations, and begin to take
              more ownership over how they communicate ideas. That is why public speaking for kids is often one of the
              most practical long-term investments a family can make in communication development.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            How Public Speaking Helps at School and Beyond
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            {[
              {
                title: "Class presentations",
                text: "Students who practice regularly tend to speak with more structure and less visible stress when presenting at school.",
              },
              {
                title: "Leadership and participation",
                text: "Clearer communication often helps children contribute more in clubs, group projects, student councils, and classroom discussion.",
              },
              {
                title: "Interviews and real-world speaking",
                text: "Public speaking habits carry into auditions, interviews, introductions, and any situation where a child needs to explain themselves clearly.",
              },
              {
                title: "A foundation for debate",
                text: "Because students learn confidence and structure first, public speaking becomes a natural launch point for later debate classes.",
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
              This is why parents often describe public speaking for kids as one of the most practical enrichment
              choices available. The benefits are visible in everyday life, not only in a performance setting. A child
              who can speak clearly and calmly is usually better equipped for school, friendships, and leadership
              opportunities.
            </p>
            <p>
              For families choosing between a kids public speaking course and a more formal debate class, the question
              is often about readiness rather than quality. If your child needs confidence, fluency, and comfort in
              front of others first, public speaking is often the right place to begin. If you want help choosing, the
              best next step is still to{" "}
              <Link href="/book" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                book a free consultation
              </Link>
              .
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
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-warm-50 dark:hover:bg-navy-700/50 sm:p-5">
                  <span className="pr-4 text-sm font-semibold text-navy-800 dark:text-navy-100 sm:text-base font-sans">
                    {item.question}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:px-5 sm:pb-5 sm:text-base font-sans">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-800 py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-5 text-3xl font-bold text-white md:text-4xl">
            Ready to help your child become a stronger speaker?
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">
            Explore our{" "}
            <Link href="/classes" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              full class options
            </Link>
            , review{" "}
            <Link href="/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              pricing
            </Link>
            , meet our{" "}
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
