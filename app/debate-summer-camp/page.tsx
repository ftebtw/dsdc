import type { Metadata } from "next";
import Link from "next/link";
import DebateSummerCampPageZh from "@/components/DebateSummerCampPageZh";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { getRequestLocale } from "@/lib/requestLocale";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "What is DSDC's online debate summer camp?",
    answer:
      "DSDC's online debate summer camp is a live Zoom program that runs during July and August. Students train in debate fundamentals, practice rounds, and speaking skills across 1 to 2 week intensives. It is a faster-paced version of our regular online debate classes, designed for summer.",
  },
  {
    question: "What age group is the camp for?",
    answer:
      "Students in Grades 4 to 12 can join. We split campers by grade band: Elementary (Grades 4-6), Junior (Grades 7-9), and Senior (Grades 10-12). Each cohort has age-appropriate pacing and content.",
  },
  {
    question: "Do students need debate experience?",
    answer:
      "No. Summer camp is a great starting point for first-time debaters. Our Novice track is built for complete beginners, and coaches adapt to each student's experience level.",
  },
  {
    question: "How much does the debate summer camp cost?",
    answer:
      "Summer camp pricing is in line with our regular group class pricing of $30-50 CAD per hour. Full 1-week and 2-week intensives include a fixed number of sessions. See our pricing page for the current summer rate.",
  },
  {
    question: "When does debate summer camp run?",
    answer:
      "Camps run from early July through late August. Multiple cohorts are offered across the summer so families can pick a week that works with their vacation plans.",
  },
  {
    question: "How is summer camp different from a regular debate class?",
    answer:
      "A regular class runs once a week during the school year. Summer camp is compressed: students attend multiple sessions per week, work through a curriculum at a faster pace, and finish with a showcase debate or final practice round. It is a quick way to build confidence and skills without a full-year commitment.",
  },
  {
    question: "Is the camp fully online?",
    answer:
      "Yes. All camp sessions are live over Zoom, just like our regular classes. Students can attend from anywhere in Canada or internationally.",
  },
];

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Debate Summer Camp", path: "/debate-summer-camp" },
]);

const eventSchema = {
  "@context": "https://schema.org",
  "@type": "EducationEvent",
  name: "DSDC Online Debate Summer Camp",
  description:
    "Live online debate summer camp for students in Grades 4 to 12. Multi-session intensives that run across July and August, delivered over Zoom by coaches from Canada's National Debate Team.",
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  startDate: "2026-07-06",
  endDate: "2026-08-28",
  location: {
    "@type": "VirtualLocation",
    url: "https://dsdc.ca/debate-summer-camp",
  },
  organizer: {
    "@type": "EducationalOrganization",
    name: "DSDC",
    url: "https://dsdc.ca",
  },
  offers: {
    "@type": "Offer",
    price: "300",
    priceCurrency: "CAD",
    availability: "https://schema.org/InStock",
    url: "https://dsdc.ca/book",
  },
  image: "https://dsdc.ca/images/photos/wsc-group-2.jpg",
};

const weekSchedule = [
  {
    day: "Day 1",
    text: "Welcome and warm-up speaking games. Intro to debate structure. Campers give a short practice speech so coaches can baseline each student.",
  },
  {
    day: "Day 2",
    text: "Case-building: how to turn an opinion into a structured argument with claims, reasons, and evidence. Partner drills and feedback.",
  },
  {
    day: "Day 3",
    text: "Rebuttal and response. Campers learn how to listen to the other side, attack weak arguments, and defend their own.",
  },
  {
    day: "Day 4",
    text: "Mini practice round. A low-pressure debate in small groups, with coach notes and constructive written feedback afterward.",
  },
  {
    day: "Day 5",
    text: "Showcase debate. A full practice round at the end of the week, with improvement visible compared to Day 1. Final feedback and next-step recommendations.",
  },
];

const ageGroups = [
  {
    title: "Elementary Camp (Grades 4-6)",
    text: "The starting point for younger campers. Playful warm-ups, short speeches, and beginner-friendly debate motions. Perfect for first-time speakers and shy kids who need a gentle introduction.",
  },
  {
    title: "Junior Camp (Grades 7-9)",
    text: "Middle school students move faster. Real case structures, rebuttal drills, and introductory tournament-format debates. A great week for students thinking about joining a school debate team in the fall.",
  },
  {
    title: "Senior Camp (Grades 10-12)",
    text: "High school students train in CNDF or British Parliamentary format, run full practice rounds, and get direct preparation for fall tournaments. A strong summer option for students applying to university.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildLocalizedPageMetadata({
    path: "/debate-summer-camp",
    title:
      locale === "zh"
        ? "线上辩论夏令营 | 4-12 年级 | DSDC"
        : "Online Debate Summer Camp for Kids | Grades 4-12 | DSDC",
    description:
      locale === "zh"
        ? "DSDC 为 4-12 年级学生开办线上辩论夏令营。Zoom 直播、小班教学、经验丰富的教练，用一整周的结构化发言、辩论和反馈帮助孩子快速进步。7 月至 8 月多个集中班可选。"
        : "DSDC runs an online debate summer camp for kids in Grades 4 to 12. Live Zoom sessions, small groups, experienced coaches, and a full week of speaking, debating, and feedback. Intensives run through July and August.",
    keywords: [
      "debate summer camp",
      "debate camp",
      "online debate camp",
      "summer debate program",
      "kids debate camp",
      "debate camp for kids",
    ],
    images: [{ url: "/images/photos/wsc-group-2.jpg" }],
    hasChineseVersion: true,
  });
}

export default async function DebateSummerCampPage() {
  const locale = await getRequestLocale();

  if (locale === "zh") {
    return <DebateSummerCampPageZh />;
  }

  return (
    <>
      <JsonLd id="debate-camp-event-schema" data={eventSchema} />
      <JsonLd id="debate-camp-faq-schema" data={faqSchema} />
      <JsonLd id="debate-camp-breadcrumb-schema" data={breadcrumbSchema} />

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
            Summer 2026
          </p>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Online Debate Summer Camp for Kids in Grades 4-12
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            A live online debate camp delivered over Zoom. Small groups, expert coaches, and a full
            week of structured speaking, debating, and feedback - without sending your child across town.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/book"
              className="rounded-lg bg-gold-400 px-8 py-3.5 text-center font-semibold text-navy-900 shadow-md transition-all duration-200 hover:bg-gold-300"
            >
              Reserve a Summer Spot
            </Link>
            <Link
              href="/classes"
              className="rounded-lg border-2 border-white px-8 py-3.5 text-center font-semibold text-white transition-all duration-200 hover:bg-white hover:text-navy-800"
            >
              See All Classes
            </Link>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/Course"
        title="Summer Camp at a Glance"
        facts={[
          { label: "When", value: "July and August 2026" },
          { label: "Format", value: "Live online via Zoom" },
          { label: "Ages", value: "Grades 4 through 12" },
          { label: "Length", value: "1-week and 2-week intensives" },
          { label: "Daily time", value: "About 1.5 hours per day" },
          { label: "Group size", value: "Usually 8-12 campers" },
          { label: "Pricing", value: "$30-50 CAD/hr group rate" },
          { label: "Good for", value: "First-time debaters and returning DSDC students" },
        ]}
      />

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            What Makes an Online Debate Camp Work
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              A good debate summer camp is about speaking time, coaching quality, and momentum. DSDC&apos;s
              online camp is designed around those three things. Campers are grouped by grade, each session
              is led by a real coach, and every day builds on the last so kids leave the week noticeably
              more confident than they started.
            </p>
            <p>
              Running the camp online is an advantage, not a compromise. Families avoid the commute and
              drop-off logistics. Students from Vancouver train alongside peers in Toronto and Calgary.
              Small groups of 8 to 12 campers get more speaking time than a large in-person program because
              every student is visible on screen and every student speaks every round.
            </p>
            <p>
              Parents comparing a debate summer camp against a more generic summer enrichment program
              usually decide based on what their child actually takes home: a measurable speaking skill, a
              real debate format, and confidence in front of an audience. DSDC focuses on exactly those
              outcomes.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            A Typical Camp Week at DSDC
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
            Here is what a standard 5-day DSDC debate camp looks like. 2-week intensives follow the same
            arc but with deeper drills, more formal rounds, and a longer showcase at the end.
          </p>
          <div className="space-y-5">
            {weekSchedule.map((day, index) => (
              <article
                key={day.day}
                className="flex flex-col gap-2 rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800 md:flex-row md:items-start md:gap-6"
              >
                <div className="flex shrink-0 items-center gap-3 md:w-32">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400 font-bold text-navy-900">
                    {index + 1}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300 font-sans">
                    {day.day}
                  </div>
                </div>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{day.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Age Groups and Camp Tracks
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ageGroups.map((group) => (
              <article
                key={group.title}
                className="rounded-2xl border border-warm-200 bg-warm-50 p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{group.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{group.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Pricing and Registration
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              DSDC summer camps follow our standard group rate of $30-50 CAD per hour. Because camps are
              multi-session intensives, families usually register for a full 1-week or 2-week block at
              once. The exact rate depends on the camp track and length - all pricing is published
              transparently before you commit.
            </p>
            <p>
              Spots in each cohort are limited to around 8 to 12 campers so every student gets speaking
              time and coach attention. Popular weeks fill quickly, especially the mid-July and early
              August sessions, so reserving early is the best way to lock in the age band you want.
            </p>
            <p>
              See our{" "}
              <Link href="/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                pricing page
              </Link>{" "}
              for current rates, or{" "}
              <Link href="/book" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                book a free consultation
              </Link>{" "}
              to check which camp weeks still have space for your child&apos;s grade level.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Debate Summer Camp FAQ
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
            Ready to book a summer camp week?
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">
            Reserve a spot before the summer cohort fills. Free 15-minute consultation to confirm the
            right age group and week for your child.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/book"
              className="rounded-lg bg-gold-400 px-8 py-3.5 text-center font-semibold text-navy-900 shadow-md transition-all duration-200 hover:bg-gold-300"
            >
              Reserve a Summer Spot
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
