import type { Metadata } from "next";
import Link from "next/link";

const faqItems = [
  {
    question: "What if my child is shy or introverted?",
    answer:
      "Many of our students start out shy - and that's completely fine. Our coaches create a supportive, low-pressure environment where every student can grow at their own pace. Debate actually helps introverted thinkers shine because it rewards preparation and logical thinking, not just being loud.",
  },
  {
    question: "What age should kids start debate?",
    answer:
      "We recommend starting as early as Grade 4. Our Novice program is specifically designed for younger students. The earlier they start, the more time they have to develop confidence and skills.",
  },
  {
    question: "How quickly will my child improve?",
    answer:
      "Most parents notice a difference in confidence within the first month. By the end of a semester, students are structuring arguments, speaking in front of peers, and thinking critically about complex topics.",
  },
  {
    question: "Does my child need any materials or preparation?",
    answer:
      "No. Just a computer with Zoom, a webcam, and a willingness to try. We provide all materials and curriculum.",
  },
  {
    question: "Can we try before committing?",
    answer:
      "Yes - book a free 15-minute consultation and we'll recommend the right class. Trial classes may be available.",
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

export const metadata: Metadata = {
  title: "Debate Classes for Beginners | No Experience Needed | DSDC",
  description:
    "DSDC's beginner debate classes are perfect for kids with no experience - even shy and introverted children thrive. Online classes for Grades 4-12 with personalized coaching. Try a free consultation.",
  alternates: {
    canonical: "https://dsdc.ca/debate-classes-for-beginners",
  },
  openGraph: {
    title: "Debate Classes for Beginners | No Experience Needed | DSDC",
    description:
      "DSDC's beginner debate classes are perfect for kids with no experience - even shy and introverted children thrive. Online classes for Grades 4-12 with personalized coaching. Try a free consultation.",
    url: "https://dsdc.ca/debate-classes-for-beginners",
    siteName: "DSDC",
    type: "website",
    images: [
      {
        url: "/images/photos/dsdc-class-photo.jpg",
      },
    ],
  },
};

export default function DebateClassesForBeginnersPage() {
  return (
    <>
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
            Debate Classes for Beginners - No Experience Needed
          </h1>
          <p className="text-xl text-white/90 font-sans mb-10 max-w-3xl mx-auto">
            Even shy and introverted kids thrive in our supportive online classes
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
              See Our Beginner Classes
            </Link>
          </div>
          <p className="mt-6 text-sm sm:text-base text-white/85 font-sans">
            See all{" "}
            <Link href="/online-debate-classes" className="underline underline-offset-4 hover:text-gold-300 transition-colors">
              class levels
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 dark:text-white mb-8 text-center">
            Your Child Doesn&apos;t Need to Be a Natural Speaker
          </h2>
          <div className="space-y-5 text-charcoal/80 dark:text-navy-200 text-lg leading-relaxed font-sans">
            <p>
              Many parents worry their child is too shy, too quiet, or not the &quot;debate type.&quot; We hear this
              all the time - and it is exactly why our Novice program exists. Beginner debate classes should build
              confidence first, not pressure students to perform before they are ready.
            </p>
            <p>
              Our coaches are trained to nurture confidence gradually. We begin with low-pressure speaking activities,
              guided practice, and clear structure. As students feel safer and more prepared, we build toward stronger
              argumentation, rebuttal, and formal debate rounds.
            </p>
            <p>
              Students learn at their own pace in small groups of 8-12, with personalized feedback every session. That
              individual attention helps beginners improve quickly while still feeling supported. Some of our most
              successful competitive debaters started as the quietest students in class.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            What Your Child&apos;s First Debate Class Looks Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                title: "Warm-Up Activity (15 min)",
                text: "A fun, low-pressure speaking exercise - like a quick opinion round or a storytelling game - so everyone gets comfortable.",
              },
              {
                title: "Lesson (30 min)",
                text: "The coach introduces a topic and teaches a foundational skill, like how to structure an argument or how to support a claim with evidence.",
              },
              {
                title: "Practice (45 min)",
                text: "Students try it themselves in pairs or small groups. The coach guides and encourages throughout.",
              },
              {
                title: "Feedback (15 min)",
                text: "Every student receives personalized written feedback on what they did well and what to work on.",
              },
              {
                title: "Homework",
                text: "A short assignment to practice the skill before next class.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-4"
              >
                <h3 className="text-base font-bold text-navy-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-charcoal/70 dark:text-navy-300 font-sans leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 text-lg text-charcoal/80 dark:text-navy-200 font-sans leading-relaxed">
            By the end of the first class, most students are surprised by how much they enjoyed it - and how much they
            had to say.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            Beginner-Friendly Debate Classes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Novice Debate (Grades 4-6)",
                text: "An excellent starting point for younger scholars eager to develop public speaking and debate skills. Perfect for students with zero debate experience. Build confidence through speech fundamentals and introductory debate formats.",
                learnMoreLabel: "View Novice Debate Classes",
              },
              {
                title: "Junior Debate (Grades 7-9)",
                text: "Also welcoming to beginners. Coaches adapt to each student's experience level, so new debaters can start here and progress quickly.",
                learnMoreLabel: "View Junior Debate Classes",
              },
              {
                title: "Public Speaking (Grades 4-9)",
                text: "If your child is not ready for debate yet, our Public Speaking class focuses on confidence, voice projection, and presentation skills - a great stepping stone.",
                learnMoreLabel: "View Public Speaking Classes",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800 p-6 flex flex-col"
              >
                <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-3">{item.title}</h3>
                <p className="text-charcoal/75 dark:text-navy-200 font-sans leading-relaxed flex-1">{item.text}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/classes"
                    className="px-4 py-2 rounded-md border border-warm-300 dark:border-navy-600 text-sm font-medium text-navy-800 dark:text-navy-100 hover:bg-warm-100 dark:hover:bg-navy-700 transition-colors"
                  >
                    {item.learnMoreLabel}
                  </Link>
                  <Link
                    href="/book"
                    className="px-4 py-2 rounded-md bg-gold-400 text-navy-900 text-sm font-semibold hover:bg-gold-300 transition-colors"
                  >
                    Book a Consultation
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            Skills Your Child Will Build in Debate
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              "Confidence in public speaking",
              "Critical thinking and logical reasoning",
              "Persuasive communication",
              "Research and evidence analysis",
              "Active listening and respectful disagreement",
              "Leadership and teamwork",
            ].map((skill) => (
              <div
                key={skill}
                className="rounded-xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 px-5 py-4 text-navy-800 dark:text-navy-100 font-medium"
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-8">
            The Path from Beginner to Competitive Debater
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center mb-8">
            {["Novice", "Junior", "Senior", "Advanced Competitive", "Tournaments"].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800 px-3 py-3 text-sm font-semibold text-navy-800 dark:text-navy-100"
              >
                {item}
              </div>
            ))}
          </div>
          <p className="text-lg text-charcoal/80 dark:text-navy-200 font-sans leading-relaxed text-center">
            Many of our students who started with zero experience now compete at Canadian Nationals, BC Provincials,
            the World Scholar&apos;s Cup at Yale, and international championships. The journey starts with a single
            class.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            What Our Students Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "Angela M.",
                role: "Student, Grade 8",
                quote:
                  "DSDC has been my home for debate ever since I started three years ago. Under the guidance of Tim, Archie, and Rebecca, I've seen myself visibly improve in confidence and critical thinking.",
              },
              {
                name: "Daniel W.",
                role: "Student, Grade 9",
                quote:
                  "The environment at DSDC is simply wonderful. The teachers are supportive of every individual student and are passionate about developing young minds.",
              },
              {
                name: "Zoe L.",
                role: "Junior Coach",
                quote:
                  "As a former DSDC student, I've experienced firsthand how debate changes you. Every challenge I overcame built my confidence.",
              },
            ].map((item) => (
              <article
                key={item.name}
                className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6"
              >
                <p className="text-charcoal/75 dark:text-navy-200 leading-relaxed font-sans mb-4">&ldquo;{item.quote}&rdquo;</p>
                <p className="font-bold text-navy-800 dark:text-white">{item.name}</p>
                <p className="text-sm text-charcoal/60 dark:text-navy-400">{item.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
            Beginner Debate Class FAQ
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">Every great debater started as a beginner.</h2>
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
              Explore Our Classes
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
