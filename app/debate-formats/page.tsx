import type { Metadata } from "next";
import Link from "next/link";
import DebateFormatsPageZh from "@/components/DebateFormatsPageZh";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { getRequestLocale } from "@/lib/requestLocale";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "What are the 7 types of debates?",
    answer:
      "The most common debate formats students encounter are: Canadian National Debate Format (CNDF), British Parliamentary (BP), World Schools, Cross-Examination (CX or Policy), Lincoln-Douglas, Public Forum, and Junior World Schools. Each has different speaker counts, time limits, and judging criteria. DSDC teaches the four formats Canadian students face most often at real tournaments.",
  },
  {
    question: "What are the four C's of debate?",
    answer:
      "The four C's usually refer to: Clarity (say what you mean), Consistency (don't contradict yourself), Credibility (back claims with evidence), and Contention (a clear position with reasons). DSDC coaches all four as a baseline before layering format-specific drills on top.",
  },
  {
    question: "What debate format should my child start with?",
    answer:
      "Most Canadian beginners start with CNDF because it is the standard format at Canadian high school tournaments and Canadian Nationals. Younger or shy students sometimes start with public speaking before moving into formal debate. International or World Schools-bound students may start with World Schools format.",
  },
  {
    question: "Does DSDC teach all these debate formats?",
    answer:
      "Yes. DSDC coaches CNDF, British Parliamentary, World Schools, and Cross-Examination formats. Students are placed in the format that matches their goals - Canadian Nationals, OSDU events, international competitions, or Junior WSDC.",
  },
  {
    question: "How long does it take to learn a new debate format?",
    answer:
      "A student with debate experience can pick up the basic rules of a new format in 1 to 2 weeks. Competing effectively in a new format usually takes a full term of coached practice because the speaker roles, time limits, and judging criteria all need reps to internalize.",
  },
];

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Debate Formats", path: "/debate-formats" },
]);

const formats = [
  {
    name: "Canadian National Debate Format (CNDF)",
    href: "/blog/cndf-debate-format-explained",
    summary:
      "The standard format at Canadian high school tournaments and Canadian National qualifiers. Two teams of two students debate a proposition with constructive speeches, rebuttals, and Points of Information.",
    bestFor: "Canadian students aiming for provincial tournaments or CSDF Nationals.",
  },
  {
    name: "British Parliamentary (BP)",
    href: "/blog/british-parliamentary-debate-guide",
    summary:
      "Four teams of two debate a motion under strict time limits. BP rewards quick thinking, case extension, and strategic positioning between the four speaking benches. The standard format at World University Debating Championships.",
    bestFor: "Older students and university-bound debaters. BP is the main global university format.",
  },
  {
    name: "World Schools Debate",
    href: "/blog/world-schools-debate-format",
    summary:
      "A blended format used at the World Schools Debating Championships and many international high school events. Three speakers per side, motions announced in advance or impromptu, and strong emphasis on teamwork and style.",
    bestFor: "Students preparing for World Schools, international tournaments, or Junior WSDC.",
  },
  {
    name: "Cross-Examination (CX / Policy)",
    href: "/blog/cross-examination-debate-guide",
    summary:
      "Two teams of two debate a resolution with direct cross-examination periods between speeches. Heavier on evidence, research, and policy analysis than other formats. Common in North American circuits.",
    bestFor: "Students who love research, evidence-based argumentation, and policy topics.",
  },
  {
    name: "Junior World Schools (Junior WSDC)",
    href: "/blog/junior-wsdc-explained",
    summary:
      "The younger sibling of World Schools format, built for middle school and junior high students. Same core structure with age-appropriate expectations and judging criteria.",
    bestFor: "Middle school students who want an international-style format without jumping straight to World Schools.",
  },
];

const comparisonRows = [
  { format: "CNDF", speakers: "2 per team", time: "~8-10 min speeches", motions: "Announced in advance", prep: "Full case prep" },
  { format: "British Parliamentary", speakers: "2 per team, 4 teams", time: "7 min speeches", motions: "15 min prep, impromptu", prep: "Light prep" },
  { format: "World Schools", speakers: "3 per team", time: "8 min speeches", motions: "Mix of prepared and impromptu", prep: "Both" },
  { format: "Cross-Examination", speakers: "2 per team", time: "Longer speeches + cross-ex", motions: "Year-long resolution", prep: "Heavy evidence prep" },
  { format: "Junior WSDC", speakers: "3 per team", time: "Shorter speeches", motions: "Mix", prep: "Age-appropriate prep" },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildLocalizedPageMetadata({
    path: "/debate-formats",
    title:
      locale === "zh"
        ? "辩论赛制指南 | CNDF、BP、World Schools、CX | DSDC"
        : "Debate Formats Guide | CNDF, BP, World Schools, CX | DSDC",
    description:
      locale === "zh"
        ? "写给加拿大学生的辩论赛制总览：CNDF、British Parliamentary、World Schools、Cross-Examination 和 Junior WSDC。告诉你孩子应该从哪个赛制开始，以及 DSDC 如何教每一种赛制。"
        : "A pillar guide to the main debate formats Canadian students need to know: CNDF, British Parliamentary, World Schools, Cross-Examination, and Junior WSDC. Learn which format to start with and how DSDC coaches each one.",
    keywords: [
      "debate formats",
      "types of debate",
      "CNDF debate format",
      "British Parliamentary debate",
      "World Schools debate",
      "Cross-Examination debate",
      "Junior WSDC",
    ],
    images: [{ url: "/images/photos/wsc-group-2.jpg" }],
    hasChineseVersion: true,
  });
}

export default async function DebateFormatsPage() {
  const locale = await getRequestLocale();

  if (locale === "zh") {
    return <DebateFormatsPageZh />;
  }

  return (
    <>
      <JsonLd id="debate-formats-faq-schema" data={faqSchema} />
      <JsonLd id="debate-formats-breadcrumb-schema" data={breadcrumbSchema} />

      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 pb-20 pt-32 md:pb-28 md:pt-40">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-4 text-sm sm:text-base font-bold uppercase tracking-[0.25em] text-gold-300">
            Pillar Guide
          </p>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Debate Formats Explained for Canadian Students
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            A practical guide to the main debate formats DSDC teaches: CNDF, British Parliamentary, World
            Schools, Cross-Examination, and Junior WSDC. Pick the right starting point, then dive into
            the detailed guide for the format you care about.
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
              Explore DSDC Classes
            </Link>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/EducationalOrganization"
        title="Debate Formats at a Glance"
        facts={[
          { label: "Formats covered", value: "CNDF, British Parliamentary, World Schools, Cross-Examination, Junior WSDC" },
          { label: "Canadian standard", value: "CNDF - the format used at most Canadian high school tournaments" },
          { label: "University standard", value: "British Parliamentary - the format used at World University Debating Championships" },
          { label: "International standard", value: "World Schools - used at the World Schools Debating Championships" },
          { label: "Best for beginners", value: "CNDF or public speaking first" },
          { label: "DSDC coaching", value: "All major formats taught by Canadian National Debate Team alumni" },
        ]}
      />

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Why Debate Formats Matter
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              A debate format is the set of rules that shapes every round: how many speakers per team,
              how long each speech runs, whether motions are prepared or impromptu, and what judges
              actually reward. Two students with identical speaking skill can do very differently in two
              different formats because the strategic demands are not the same.
            </p>
            <p>
              Choosing the right format is less about which is &quot;best&quot; and more about matching
              your child&apos;s goals. A Canadian student aiming for CSDF Nationals should start with
              CNDF. A university-bound student interested in World University Debating Championships
              should learn British Parliamentary. An internationally-minded middle school student might
              start with Junior WSDC.
            </p>
            <p>
              Below are the five formats DSDC teaches most often. Each section links to a full written
              guide so you can understand the rules, scoring, and strategy in detail. If you want help
              picking a format for your child, the fastest path is a free consultation.
            </p>
          </div>
        </div>
      </section>

      {/* Format cards linking to detailed guides */}
      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Five Debate Formats DSDC Teaches
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {formats.map((format) => (
              <article
                key={format.name}
                className="flex flex-col rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white font-serif">{format.name}</h3>
                <p className="mb-4 flex-1 leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{format.summary}</p>
                <p className="mb-4 text-sm italic text-navy-700 dark:text-gold-300 font-sans">
                  Best for: {format.bestFor}
                </p>
                <Link
                  href={format.href}
                  className="inline-flex text-sm font-semibold text-gold-600 underline underline-offset-4 transition-colors hover:text-gold-500"
                >
                  Read the full guide
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Quick Comparison of Debate Formats
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base md:text-lg leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
            A side-by-side view of the formats most Canadian students run into. Use this to decide where
            your child should start.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-warm-200 bg-warm-50 dark:border-navy-700 dark:bg-navy-800">
            <table className="min-w-full divide-y divide-warm-200 dark:divide-navy-700 text-left text-sm">
              <thead className="bg-navy-800 text-white">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Format</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Speakers</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Speech Time</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Motions</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Prep</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-200 dark:divide-navy-700">
                {comparisonRows.map((row) => (
                  <tr key={row.format}>
                    <td className="px-4 py-3 font-semibold text-navy-800 dark:text-navy-100">{row.format}</td>
                    <td className="px-4 py-3 text-charcoal/75 dark:text-navy-200">{row.speakers}</td>
                    <td className="px-4 py-3 text-charcoal/75 dark:text-navy-200">{row.time}</td>
                    <td className="px-4 py-3 text-charcoal/75 dark:text-navy-200">{row.motions}</td>
                    <td className="px-4 py-3 text-charcoal/75 dark:text-navy-200">{row.prep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            How to Pick a Starting Format
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              <strong>Complete beginner, Canadian student:</strong> Start with CNDF. It is the format
              used at most Canadian school and provincial tournaments. Students who learn CNDF first
              have an easy path into provincial qualifiers and CSDF Nationals. If your child is very
              young or very shy, public speaking is an even gentler on-ramp.
            </p>
            <p>
              <strong>University-bound student interested in debate clubs at UBC, U of T, McGill, or
              SFU:</strong> Learn British Parliamentary. University debate clubs almost universally run
              BP, so high school students who train in BP have a much easier transition to university
              debate.
            </p>
            <p>
              <strong>Internationally-minded student or WSDC aspirant:</strong> Train in World Schools
              format. It is the format used at the World Schools Debating Championships and many
              international high school tournaments. Junior WSDC is the equivalent for younger students.
            </p>
            <p>
              <strong>Student who loves research and evidence:</strong> Consider Cross-Examination
              (policy-style debate). It rewards heavy preparation and factual argumentation more than
              impromptu speaking skill.
            </p>
            <p>
              Unsure which one fits?{" "}
              <Link href="/book" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                Book a free consultation
              </Link>{" "}
              and we will recommend a starting format based on your child&apos;s grade, goals, and
              personality.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
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
            Ready to train in a real debate format?
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">
            DSDC teaches every format on this page. Book a free consultation and we will recommend the
            right starting cohort for your child&apos;s grade and goals.
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
              Compare All Classes
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
