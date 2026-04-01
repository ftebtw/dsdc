import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "Do you offer debate classes for students in Toronto and the GTA even though DSDC is based in Vancouver?",
    answer:
      "Yes. DSDC is based in Vancouver, but all classes are live online via Zoom, so students in Toronto, Brampton, Mississauga, North York, Scarborough, Vaughan, Markham, Oakville, and Milton can join the same high-level programs.",
  },
  {
    question: "Will my child still get enough speaking time in an online debate club setting?",
    answer:
      "Yes. Our classes are intentionally kept small, usually 8 to 12 students, so every student speaks, debates, and receives personalized written feedback every week.",
  },
  {
    question: "What kinds of debate formats do GTA students learn at DSDC?",
    answer:
      "Students train in major Canadian and international formats, including CNDF, British Parliamentary, World Schools, and Cross-Examination, plus public speaking and World Scholar's Cup preparation when relevant.",
  },
  {
    question: "What do GTA families need to join classes from home?",
    answer:
      "Students only need a computer, a stable internet connection, a webcam, and Zoom. We provide the curriculum, structure, and weekly feedback.",
  },
  {
    question: "Can we talk to someone before registering?",
    answer:
      "Absolutely. The best next step is to book a free consultation so we can recommend the right class based on your child's grade, confidence level, and goals.",
  },
  {
    question: "How much do online debate classes cost?",
    answer:
      "Group class pricing is published clearly on our pricing page. Families can review costs before committing, which makes it easier to compare programs confidently.",
  },
];

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "Course",
      position: 1,
      name: "Debate Classes Toronto & GTA",
      description:
        "Online debate classes for students in Toronto, Brampton, Mississauga, and across the GTA, taught live by DSDC.",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
    },
    {
      "@type": "Course",
      position: 2,
      name: "Public Speaking and Debate Training for GTA Students",
      description:
        "Confidence-building public speaking and debate training for kids and teens in the Greater Toronto Area.",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
    },
  ],
};

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Debate Classes Toronto", path: "/debate-classes-toronto" },
]);

export const metadata: Metadata = {
  title: "Debate Classes Toronto & GTA | DSDC",
  description:
    "DSDC offers online debate classes Toronto and GTA families can join from home, including students in Brampton, Mississauga, Scarborough, and North York.",
  alternates: {
    canonical: "https://dsdc.ca/debate-classes-toronto",
  },
  openGraph: {
    title: "Debate Classes Toronto & GTA | DSDC",
    description:
      "DSDC offers online debate classes Toronto and GTA families can join from home, including students in Brampton, Mississauga, Scarborough, and North York.",
    url: "https://dsdc.ca/debate-classes-toronto",
    siteName: "DSDC",
    type: "website",
    images: [{ url: "/images/photos/wsc-group-2.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Debate Classes Toronto & GTA | DSDC",
    description:
      "DSDC offers online debate classes Toronto and GTA families can join from home, including students in Brampton, Mississauga, Scarborough, and North York.",
    images: ["/images/photos/wsc-group-2.jpg"],
  },
};

export default function DebateClassesTorontoPage() {
  return (
    <>
      <JsonLd id="toronto-course-schema" data={courseSchema} />
      <JsonLd id="toronto-faq-schema" data={faqSchema} />
      <JsonLd id="toronto-breadcrumb-schema" data={breadcrumbSchema} />

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
            Debate Classes Toronto Families Can Join from Anywhere in the GTA
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            Live online debate classes for students in Toronto, Brampton, Mississauga, Scarborough, North York,
            Vaughan, Markham, Etobicoke, Oakville, Milton, and beyond.
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
        itemType="https://schema.org/EducationalOrganization"
        title="At a Glance"
        facts={[
          { label: "Format", value: "Live online via Zoom" },
          { label: "Students served", value: "Grades 4-12 and beyond" },
          { label: "Class size", value: "Usually 8-12 students" },
          { label: "Service area", value: "Toronto, Brampton, Mississauga, Scarborough, North York, Vaughan, Markham, Oakville, Milton, and all of Canada" },
          { label: "Pricing", value: "Transparent group pricing published online" },
          { label: "Focus", value: "Debate, public speaking, competitive formats, and confidence building" },
        ]}
      />

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Why Toronto and GTA Families Choose Online Debate Classes
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              Families searching for debate classes Toronto options often run into the same challenge: the city is
              huge, the traffic is unpredictable, and the best-fit schedule for one child rarely lines up perfectly
              with the rest of a family&apos;s week. Online debate solves that logistics problem without sacrificing the
              things parents actually care about most, like strong coaching, meaningful speaking time, and consistent
              progress.
            </p>
            <p>
              At DSDC, students join live Zoom classes from wherever they live in the GTA. That means a student in
              downtown Toronto can learn alongside classmates from Brampton, Mississauga, Markham, Vaughan, North
              York, Scarborough, or Etobicoke without anyone spending their evening commuting across the city. Parents
              still get structure, accountability, and personalized feedback, but without the friction of travel.
            </p>
            <p>
              This matters especially for families who have searched terms like &quot;debate classes near me&quot; or
              &quot;debate club GTA&quot; and discovered that distance does not always equal quality. A nearby club can
              be convenient, but convenience alone is not enough if class sizes are too big, feedback is inconsistent,
              or the teaching does not match your child&apos;s level. DSDC was built to combine convenience with serious
              academic coaching.
            </p>
            <p>
              If you want to compare all current programs, you can start with our{" "}
              <Link href="/classes" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                classes page
              </Link>
              , review our{" "}
              <Link href="/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                pricing
              </Link>
              , and meet the people behind the instruction on our{" "}
              <Link href="/team" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                team page
              </Link>
              .
            </p>
            <p>
              Families also appreciate that a consultation at DSDC is focused on fit rather than pressure. We look at
              grade level, prior experience, confidence, scheduling realities, and whether a child would benefit more
              from beginner-friendly debate, public speaking, or a more competitive pathway. That usually leads to a
              much better decision than simply choosing the closest debate club GTA families can find on a map.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            DSDC Class Offerings for Toronto and GTA Students
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                title: "Novice and Junior Debate",
                text: "These programs are ideal for students who are just starting out with debate training for kids. Students learn how to structure arguments, speak with confidence, respond to opposing ideas, and think clearly under pressure. Parents often choose these classes when they want a child to become more articulate in school, more confident socially, and better prepared for academic enrichment.",
                href: "/classes",
              },
              {
                title: "Senior and Advanced Competitive Debate",
                text: "Older students who want more challenging debate classes Toronto families can access online often need something beyond basic speaking drills. Our senior and advanced levels focus on high-level formats like CNDF, British Parliamentary, World Schools, and Cross-Examination, with more rigorous coaching and tournament-oriented preparation.",
                href: "/classes",
              },
              {
                title: "Public Speaking and Confidence Building",
                text: "Not every family begins with formal debate. Some start with public speaking because a child needs confidence, voice projection, or presentation skills first. Our public speaking pathway is a strong option for students who need a gentler on-ramp before moving into full debate.",
                href: "/public-speaking-classes-for-kids",
              },
              {
                title: "Specialized Academic Programs",
                text: "For students who want broader academic enrichment, DSDC also offers focused pathways like World Scholar's Cup preparation. Families who want a bigger picture view of how competitive debate works in Canada often also read our guide to debate in Canada before deciding what class best fits their child.",
                href: "/guide-to-debate-in-canada",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="flex flex-col rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{item.title}</h3>
                <p className="flex-1 leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
                <Link
                  href={item.href}
                  className="mt-5 inline-flex text-sm font-semibold text-gold-600 underline underline-offset-4 transition-colors hover:text-gold-500"
                >
                  Learn more
                </Link>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-4xl text-center text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            Parents who are also comparing programs beyond Vancouver often find our article on{" "}
            <Link
              href="/blog/best-debate-programs-vancouver"
              className="underline underline-offset-4 transition-colors hover:text-gold-500"
            >
              what makes a strong debate program
            </Link>{" "}
            helpful because the same criteria apply whether you&apos;re searching in Toronto, Brampton, Mississauga, or
            anywhere else in Canada.
          </p>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            How Online Debate Works for GTA Students
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                title: "Step 1: Book a Consultation",
                text: "We start by learning about your child&apos;s age, experience, confidence level, and goals. That helps us recommend the right class instead of guessing.",
              },
              {
                title: "Step 2: Join Live Classes",
                text: "Students log into Zoom from home. Classes are live and interactive, with speaking practice, breakout work, structured debates, and direct teacher guidance.",
              },
              {
                title: "Step 3: Review Feedback and Homework",
                text: "After class, students receive written feedback and short assignments so improvement continues between sessions instead of stopping when the call ends.",
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
              One of the biggest advantages for GTA families is consistency. A student in Mississauga or Milton can
              still join class on time even when traffic, weather, or a packed school week would make commuting to an
              in-person program difficult. That consistency often matters more than parents expect. Students who attend
              regularly, practice weekly, and review feedback steadily usually improve much faster than students who
              attend a less consistent in-person program.
            </p>
            <p>
              Parents also appreciate that online classes fit naturally into family routines. Students can finish
              dinner at home, log into class, and return immediately to homework or downtime afterward. There is no
              lost evening spent traveling between Scarborough and downtown Toronto or between Oakville and the city.
              The time savings are real, especially over a full semester.
            </p>
            <p>
              If you want a fuller overview of how the competitive pathway works beyond the GTA, our{" "}
              <Link href="/guide-to-debate-in-canada" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                guide to debate in Canada
              </Link>{" "}
              is a helpful next read. If you already know you want to explore options seriously, the fastest next step
              is still to{" "}
              <Link href="/book" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                book a free consultation
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            What GTA Parents Should Expect Week to Week
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                title: "A predictable class rhythm",
                text: "Students usually follow a consistent cycle of lesson, practice, feedback, and follow-up work. That predictability is helpful for busy families because children know what to expect and can build stronger habits over time.",
              },
              {
                title: "Manageable homework",
                text: "Homework is usually short and practical rather than overwhelming. Students may prepare a speech outline, research examples, or revise a case so that the next class feels connected to the last one.",
              },
              {
                title: "Visible progress",
                text: "Parents often want to know whether an online program is actually working. Written feedback and regular speaking practice make progress much easier to notice, both in class and in school settings outside debate.",
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
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              For many GTA families, the key benefit is sustainability. Debate works best when students attend
              regularly, speak often, and receive correction over time. A strong weekly routine is usually more useful
              than a scattered schedule built around occasional in-person sessions that are harder to reach.
            </p>
            <p>
              If you are comparing multiple options, it helps to think about which format your family can maintain over
              a full semester. That is one of the reasons parents who start by searching debate classes Toronto often
              end up choosing a live online program: not because it is easier in a superficial way, but because it is
              easier to stay consistent with high-quality coaching.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Where GTA Families Join DSDC From
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              "Downtown Toronto and the waterfront",
              "Scarborough and North York",
              "Etobicoke, Vaughan, and Markham",
              "Brampton and Mississauga",
              "Oakville, Milton, and the wider GTA",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-warm-200 bg-white px-4 py-5 text-center text-sm font-medium text-navy-800 shadow-sm dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-5 text-center text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              One benefit of an online model is that students from different parts of the GTA can learn together
              without anyone being punished by traffic. A family in Scarborough does not need to choose a weaker local
              option just to avoid a long drive downtown, and a student in Milton can still access strong coaching
              without turning debate into a major commuting commitment every week.
            </p>
            <p>
              That same flexibility is why families often compare our{" "}
              <Link href="/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                pricing
              </Link>
              , review our{" "}
              <Link href="/team" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                coaching team
              </Link>
              , and then{" "}
              <Link href="/book" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                book a free consultation
              </Link>
              {" "}once they realize that the best debate classes Toronto families can access do not need to be limited
              by geography.
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
            Ready to find the right debate class for your child?
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">
            Explore our{" "}
            <Link href="/classes" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              class options
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
              Compare Classes
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
