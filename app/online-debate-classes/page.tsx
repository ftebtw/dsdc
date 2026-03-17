import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import KeyFactsBox from "@/components/KeyFactsBox";

const faqItems = [
  {
    question: "What ages and grades do you teach?",
    answer:
      "We offer classes for students in Grades 4 through 12, with programs tailored to each age group — Novice (Grades 4–6), Junior (Grades 7–9), Senior (Grades 10–12), and Advanced Competitive (Grades 10–12).",
  },
  {
    question: "Does my child need prior debate experience?",
    answer:
      "Not at all. Our Novice program is designed for complete beginners. Even shy and introverted children thrive in our supportive environment.",
  },
  {
    question: "How are online classes conducted?",
    answer:
      "All classes are live via Zoom. Each 2-hour session includes warm-up activities, a topical lesson, practice debates, and personalized written feedback from your coach.",
  },
  {
    question: "What makes DSDC different from other online debate programs?",
    answer:
      "We combine expert coaching from top university debaters, small class sizes of 8–12 students, personalized feedback every session, and semester report cards. Our students compete and win at national and international tournaments.",
  },
  {
    question: "Can my child try a class before committing?",
    answer:
      "Yes! Book a free 15-minute consultation and we'll help find the right class. Trial classes may be available depending on the program.",
  },
  {
    question: "Do you offer private coaching?",
    answer:
      "Yes. Private coaching is customizable with a 1-hour minimum. Contact us for details.",
  },
];

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Online Debate Classes for Kids & Teens",
  description:
    "Join DSDC's online debate classes for students in Grades 4–12. Live Zoom sessions with award-winning coaches, personalized feedback every class, and proven results at national and international tournaments.",
  provider: {
    "@type": "Organization",
    name: "Debate & Speech Development Community (DSDC)",
    sameAs: "https://dsdc.ca",
  },
  url: "https://dsdc.ca/online-debate-classes",
};

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
  title: "Online Debate Classes for Kids & Teens | Grades 4–12 | DSDC",
  description:
    "Join DSDC's online debate classes for students in Grades 4–12. Live Zoom sessions with award-winning coaches, personalized feedback every class, and proven results at national and international tournaments. Book a free consultation.",
  alternates: {
    canonical: "https://dsdc.ca/online-debate-classes",
  },
  openGraph: {
    title: "Online Debate Classes for Kids & Teens | Grades 4–12 | DSDC",
    description:
      "Join DSDC's online debate classes for students in Grades 4–12. Live Zoom sessions with award-winning coaches, personalized feedback every class, and proven results at national and international tournaments. Book a free consultation.",
    url: "https://dsdc.ca/online-debate-classes",
    siteName: "DSDC",
    type: "website",
    images: [
      {
        url: "/images/photos/wsc-group-2.jpg",
      },
    ],
  },
};

export default function OnlineDebateClassesPage() {
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
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/photos/wsc-group-2.jpg"
            alt="Students participating in an online debate class"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-navy-900/55" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Online Debate Classes for Kids & Teens
          </h1>
          <p className="text-xl text-white/90 font-sans mb-10 max-w-3xl mx-auto">
            Live coaching via Zoom for students in Grades 4–12 — from complete beginners to competitive debaters
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
              View Class Schedule
            </Link>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/EducationalOrganization"
        title="At a Glance"
        facts={[
          { label: "Founded", value: "2017, Vancouver, Canada" },
          { label: "Format", value: "Live online via Zoom" },
          { label: "Class size", value: "8-12 students" },
          { label: "Ages", value: "Grades 4-12 and university students" },
          { label: "Pricing", value: "$30-50 CAD/hr (group classes)" },
          { label: "Formats taught", value: "CNDF, British Parliamentary, World Schools, Cross-Examination" },
          { label: "Notable result", value: "100% World Scholar's Cup qualification rate since 2020" },
          { label: "Coaches", value: "20+ coaches from UBC, SFU, and the Canadian National Team" },
        ]}
      />

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 dark:text-white mb-8 text-center">
            Why Online Debate Classes Work
          </h2>
          <div className="space-y-5 text-charcoal/80 dark:text-navy-200 text-lg leading-relaxed font-sans">
            <p>
              Online debate classes make high-level coaching accessible for families with busy schedules. Students
              can join from home, avoid commuting time, and still get a structured, live learning experience every
              week. For many families, this convenience is the reason students can stay consistent and improve faster.
            </p>
            <p>
              Virtual debate classes also remove geography as a barrier. Instead of being limited to local programs,
              students can work with experienced coaches from top universities and competitive circuits. DSDC students
              join from across Canada and around the world, creating richer discussions and broader perspectives in
              every class.
            </p>
            <p>
              Debate classes from home are fully interactive, not passive lectures. Students engage in Zoom breakout
              rooms, live practice debates, impromptu speaking drills, and real-time feedback. The classroom energy
              stays high because each session is designed for participation and performance, not just note-taking.
            </p>
            <p>
              Flexible scheduling across multiple levels helps students start where they are and progress at the right
              pace. Whether your child is new to debate or already competing, our online debate classes offer a clear
              pathway to stronger confidence, communication, and critical thinking.
            </p>
          </div>
          <p className="mt-8 text-base text-charcoal/70 dark:text-navy-300 font-sans">
            New to debate? See our{" "}
            <Link href="/debate-classes-for-beginners" className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors">
              beginner&apos;s guide
            </Link>
            . Serving students{" "}
            <Link href="/debate-classes-canada" className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors">
              across Canada
            </Link>
            . Explore our{" "}
            <Link href="/world-scholars-cup-coaching" className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors">
              World Scholar&apos;s Cup coaching
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            How Our Online Debate Classes Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6">
              <p className="text-gold-500 font-bold text-sm uppercase tracking-wide mb-3">Step 1</p>
              <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-3">Book a Free Call</h3>
              <p className="text-charcoal/70 dark:text-navy-300 font-sans leading-relaxed">
                Start with a free 15-minute consultation. We learn about your child's grade level, confidence level,
                and goals in debate or public speaking.
              </p>
            </article>
            <article className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6">
              <p className="text-gold-500 font-bold text-sm uppercase tracking-wide mb-3">Step 2</p>
              <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-3">Get a Recommendation</h3>
              <p className="text-charcoal/70 dark:text-navy-300 font-sans leading-relaxed">
                We recommend the best class level and schedule for your child, from beginner-friendly foundations to
                advanced competitive training.
              </p>
            </article>
            <article className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6">
              <p className="text-gold-500 font-bold text-sm uppercase tracking-wide mb-3">Step 3</p>
              <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-3">Start Learning</h3>
              <p className="text-charcoal/70 dark:text-navy-300 font-sans leading-relaxed">
                Your child joins live Zoom sessions with expert coaching, consistent practice, and clear feedback that
                supports measurable weekly progress.
              </p>
            </article>
          </div>
          <p className="mt-10 text-lg text-charcoal/80 dark:text-navy-200 leading-relaxed font-sans">
            Every class is a 2-hour live session via Zoom with 8–12 students. Classes include a warm-up activity, a
            topical lesson, structured practice debates, and personalized written feedback from your coach. Students
            also receive homework assignments to reinforce skills between sessions, plus semester report cards so
            parents can track progress.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            Online Debate Classes for Every Level
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Novice (Grades 4–6)",
                text: "An excellent starting point for younger scholars eager to develop public speaking and debate skills. Build confidence through the fundamentals of speech execution and foundational debate formats — even shy and introverted children thrive. Saturdays, 2 hours/week.",
                learnMoreLabel: "View Novice Debate Classes",
              },
              {
                title: "Junior (Grades 7–9)",
                text: "Build competitive debate skills while accelerating academic growth. Coaches integrate challenging topics like International Relations, Law, Philosophy, and Economics into debate practice. Weekends, 2 hours/week.",
                learnMoreLabel: "View Junior Debate Classes",
              },
              {
                title: "Senior (Grades 10–12)",
                text: "Rigorous practice in British Parliamentary, CNDF, and World Schools formats with advanced lectures on complex topics. 1–2x per week, 2 hours.",
                learnMoreLabel: "View Senior Debate Classes",
              },
              {
                title: "Advanced Competitive (Grades 10–12)",
                text: "An elite program led by world-renowned university debaters for students deeply committed to competitive debate. Intensive drills, mock debates, and personalized coaching. 2x per week, 2 hours.",
                learnMoreLabel: "View Advanced Competitive Classes",
              },
              {
                title: "Public Speaking (Grades 4–9)",
                text: "Comprehensive training in impromptu, persuasive, interpretive, and parliamentary formats. Designed to prepare students for BC speech provincials.",
                learnMoreLabel: "View Public Speaking Classes",
              },
              {
                title: "World Scholar's Cup (Grades 4–12)",
                text: "Full WSC preparation with a 100% qualification rate since 2020 — from regionals to the Tournament of Champions at Yale.",
                learnMoreLabel: "View WSC Coaching",
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
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-6">
            Debate Formats We Teach
          </h2>
          <p className="text-center text-charcoal/75 dark:text-navy-200 text-lg max-w-3xl mx-auto mb-12 font-sans">
            DSDC offers training across all major competitive debate formats, preparing students for tournaments at
            every level.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              ["World Schools Debate", "Team-based format emphasizing argument structure, strategy, and persuasive delivery."],
              ["British Parliamentary (BP)", "University-style format focused on quick analysis, rebuttal, and comparative framing."],
              ["Canadian National Debate Format (CNDF)", "Structured Canadian format that builds clarity, evidence use, and refutation skills."],
              ["Cross-Examination (CX)", "High-intensity debate format featuring direct questioning, case construction, and defense."],
              ["Impromptu & Persuasive Speaking", "Speech formats that train confident thinking on your feet and audience-focused messaging."],
              ["Interpretive Speaking", "Performance-based speaking that develops expression, storytelling, and stage presence."],
            ].map(([title, text]) => (
              <article
                key={title}
                className="rounded-xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-5"
              >
                <h3 className="text-lg font-bold text-navy-800 dark:text-white mb-2">{title}</h3>
                <p className="text-charcoal/70 dark:text-navy-300 font-sans leading-relaxed">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 dark:text-white mb-8">
            Learn from Award-Winning Debate Coaches
          </h2>
          <div className="space-y-5 text-lg text-charcoal/80 dark:text-navy-200 leading-relaxed font-sans text-left md:text-center">
            <p>
              DSDC's coaching team includes award-winning debaters from top universities worldwide, including
              competitors at the World University Debating Championships, Canadian National Championships, and US
              National Championships. Every coach is dedicated to providing individualized attention and personalized
              feedback every single class.
            </p>
            <p>
              Our coaches don't just teach — they mentor. Students have the opportunity to grow into leadership roles
              themselves, volunteering at tournaments and advancing to teaching positions that build standout university
              applications.
            </p>
          </div>
          <Link
            href="/team"
            className="inline-block mt-8 px-8 py-3.5 bg-navy-800 text-white font-semibold rounded-lg hover:bg-navy-700 transition-all duration-200 shadow-md"
          >
            Meet Our Team
          </Link>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            Proven Results at Top Tournaments Worldwide
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {[
              "Canadian National Debate Championships",
              "US National Debate Championships",
              "World Scholar's Cup — Tournament of Champions at Yale",
              "Stanford Invitational",
              "Princeton Invitational",
              "Oxford Schools Championships",
              "BC Provincial Championships",
              "And others",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 px-4 py-3 text-sm sm:text-base text-navy-800 dark:text-navy-100 font-medium"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-navy-800 text-white px-6 py-5 text-center text-sm sm:text-base font-semibold">
            1,000+ Students Coached · 7+ Years of Experience · 100% WSC Qualification Rate · 20+ Expert Coaches
          </div>
          <div className="text-center mt-8">
            <Link
              href="/awards"
              className="inline-block px-8 py-3.5 bg-gold-400 text-navy-900 font-semibold rounded-lg hover:bg-gold-300 transition-all duration-200 shadow-md"
            >
              See Student Awards
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            What Our Students Say About DSDC&apos;s Online Classes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "Angela M.",
                role: "Student, Grade 8",
                quote:
                  "DSDC has been my home for debate ever since I started three years ago. Under the guidance of Tim, Archie, and Rebecca, I've seen myself visibly improve in confidence and critical thinking. The lessons on social issues have helped broaden my horizons tremendously.",
              },
              {
                name: "Ryland C.",
                role: "Student, Grade 9",
                quote:
                  "The coaches always provide thoughtful feedback and put real effort into developing lessons with student growth in mind. The skills I've developed have been invaluable for school presentations, writing, and logical reasoning.",
              },
              {
                name: "Daniel W.",
                role: "Student, Grade 9",
                quote:
                  "The environment at DSDC is simply wonderful. The teachers are supportive of every individual student and are passionate about developing young minds. You would not believe how much I've learned over the years.",
              },
            ].map((item) => (
              <article
                key={item.name}
                className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800 p-6"
              >
                <p className="text-charcoal/75 dark:text-navy-200 leading-relaxed font-sans mb-4">&ldquo;{item.quote}&rdquo;</p>
                <p className="font-bold text-navy-800 dark:text-white">{item.name}</p>
                <p className="text-sm text-charcoal/60 dark:text-navy-400">{item.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 dark:text-white mb-6">
            Online Debate Class Pricing
          </h2>
          <p className="text-lg text-charcoal/75 dark:text-navy-200 mb-8 font-sans leading-relaxed">
            Group classes range from $30–50/hr plus applicable taxes depending on program. All group classes are 2
            hours each. Private coaching is customizable with a 1-hour minimum.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-8 py-3.5 bg-navy-800 text-white font-semibold rounded-lg hover:bg-navy-700 transition-all duration-200 shadow-md"
          >
            View Full Pricing
          </Link>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
            Frequently Asked Questions About Online Debate Classes
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">Ready to Get Started?</h2>
          <p className="text-white/85 text-lg mb-8 font-sans max-w-3xl mx-auto">
            Join over 1,000 students who have built confidence, critical thinking, and communication skills through
            DSDC&apos;s online debate classes.
          </p>
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
          <a href="mailto:education@dsdc.ca" className="text-gold-300 hover:text-gold-200 transition-colors">
            education@dsdc.ca
          </a>
        </div>
      </section>
    </>
  );
}
