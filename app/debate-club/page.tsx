import type { Metadata } from "next";
import Link from "next/link";
import DebateClubPageZh from "@/components/DebateClubPageZh";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { getRequestLocale } from "@/lib/requestLocale";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "What is a debate club?",
    answer:
      "A debate club is a structured group where students meet regularly to practice debate, learn speaking skills, and prepare for tournaments. DSDC runs an online debate club that meets over Zoom, so students from anywhere in Canada can join the same weekly sessions.",
  },
  {
    question: "How does an online debate club work?",
    answer:
      "Students log into Zoom at their class time, join a small group of 8 to 12 peers, and spend the session on real debate drills: case-building, speeches, rebuttal, practice rounds, and written feedback after class. No commute, no drop-off, same coaching quality as an in-person club.",
  },
  {
    question: "Is DSDC's debate club better than looking for \"debate clubs near me\"?",
    answer:
      "It depends on where you live. A strong local club is great if there is one. For most Canadian families, though, the best local option is small, inconsistent, or full. An online club like DSDC removes the geography problem and replaces it with a coached, structured program that runs every week.",
  },
  {
    question: "What age is DSDC's debate club for?",
    answer:
      "Students in Grades 4 through 12 are welcome. Novice members (Grades 4-6) learn the fundamentals. Junior and Senior members move into competitive formats. We place each student in the right group based on age, confidence, and experience.",
  },
  {
    question: "How often does the debate club meet?",
    answer:
      "Most DSDC debate club cohorts meet once per week for 1 to 1.5 hours, with optional tournament prep sessions layered in during the Fall and Winter competitive season.",
  },
  {
    question: "How much does DSDC's debate club cost?",
    answer:
      "DSDC's group debate club classes are priced at $30-50 CAD per hour, which is noticeably lower than most in-person debate tutors. Pricing is transparent and published on our pricing page before you book anything.",
  },
  {
    question: "What formats does the debate club teach?",
    answer:
      "CNDF (Canadian National Debate Format), British Parliamentary, World Schools, and Cross-Examination. Students learn the format most relevant to their age and the tournaments they want to compete in.",
  },
  {
    question: "Do members compete in tournaments?",
    answer:
      "Yes, if they want to. Many DSDC debate club members train for Canadian National tournaments, BC and Ontario provincial events, and international competitions. Others stay purely in-club and focus on confidence, communication, and academic skills.",
  },
];

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Debate Club", path: "/debate-club" },
]);

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "DSDC Online Debate Club",
  description:
    "Canada's online debate club for students in Grades 4 to 12. Weekly live Zoom practice, small-group coaching, tournament prep, and a national peer group.",
  provider: {
    "@type": "EducationalOrganization",
    name: "DSDC",
    url: "https://dsdc.ca",
  },
  url: "https://dsdc.ca/debate-club",
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "Online",
    courseWorkload: "PT1H30M",
  },
  offers: {
    "@type": "Offer",
    price: "30",
    priceCurrency: "CAD",
    availability: "https://schema.org/InStock",
    url: "https://dsdc.ca/pricing",
  },
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
    audienceType: "Students in Grades 4-12",
  },
};

const clubTiers = [
  {
    tier: "Novice Club (Grades 4-6)",
    text: "The starting tier of the debate club. Members learn how to structure arguments, speak with confidence, listen to opposing sides, and respond politely. Ideal for younger students and complete beginners - no experience needed.",
  },
  {
    tier: "Junior Club (Grades 7-9)",
    text: "For middle school students moving into competitive formats. Members run practice rounds, study real tournament motions, and begin competing in school and provincial events if they want to.",
  },
  {
    tier: "Senior Club (Grades 10-12)",
    text: "High school members train in CNDF, British Parliamentary, World Schools, and Cross-Examination formats. This tier is where many members prepare for Canadian Nationals and university debate.",
  },
  {
    tier: "Advanced Competitive",
    text: "An invitation-based tier for members who have placed well in tournaments and want serious competition coaching. Smaller groups, harder drills, and direct preparation for national and international events.",
  },
];

const clubCycle = [
  {
    phase: "Term 1: Foundations and Case Building",
    text: "Every cohort starts the year with structured instruction on case-building, constructive speeches, and basic rebuttal. Members practice in small groups so they get speaking time every week.",
  },
  {
    phase: "Term 2: Tournament Season",
    text: "During tournament season, practice rounds mirror real tournament conditions. Members preparing for Nationals or OSDU events get additional drills and strategic briefings.",
  },
  {
    phase: "Term 3: Showcase and Advanced Formats",
    text: "The final term focuses on more advanced formats - British Parliamentary, World Schools - and a showcase debate against other DSDC cohorts. Members leave the year with visible improvement and real competition experience.",
  },
];

const clubBenefits = [
  {
    title: "Weekly structure",
    text: "A debate club only works if it meets consistently. DSDC runs every cohort on a fixed weekly schedule - not occasional drop-ins - so members build real habits.",
  },
  {
    title: "Direct coaching",
    text: "Every session is led by a coach, not a peer-run meeting. Our coaches come from Canada's National Debate Team, UBC, SFU, and international university circuits.",
  },
  {
    title: "National peer group",
    text: "Members practice alongside peers from Vancouver, Toronto, Calgary, Ottawa, and more. Bigger peer pools mean better practice partners and more varied perspectives.",
  },
  {
    title: "Written feedback",
    text: "Every member gets personalized written feedback after each session. Progress is visible to both students and parents.",
  },
  {
    title: "Tournament support",
    text: "Members who want to compete get help choosing tournaments, drilling motions, and handling logistics. Members who don't want to compete are never pressured to.",
  },
  {
    title: "Transparent pricing",
    text: "Group classes are $30-50 CAD per hour with pricing published on the site. No hidden onboarding or package commitments.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildLocalizedPageMetadata({
    path: "/debate-club",
    title:
      locale === "zh"
        ? "加入 DSDC 辩论俱乐部 | 每周线上会员制 4-12 年级 | DSDC"
        : "Join the DSDC Debate Club — Weekly Online Membership (Grades 4-12) | DSDC",
    description:
      locale === "zh"
        ? "DSDC 辩论俱乐部是一种会员制的每周线上社群，而不是一次性课程。分班晋升、学期制比赛周期、展示赛，以及全国同龄伙伴社群。适合 4-12 年级学生。"
        : "The DSDC Debate Club is a membership-based weekly community, not a one-off class. Cohort progression, a term-by-term tournament cycle, showcase debates, and a national peer group — for members in Grades 4 to 12.",
    keywords: [
      "debate club",
      "debate club near me",
      "debate clubs",
      "debate clubs near me",
      "online debate club",
      "Canada debate club",
      "kids debate club",
    ],
    images: [{ url: "/images/photos/wsc-group-2.jpg" }],
    hasChineseVersion: true,
  });
}

export default async function DebateClubPage() {
  const locale = await getRequestLocale();

  if (locale === "zh") {
    return <DebateClubPageZh />;
  }

  return (
    <>
      <JsonLd id="debate-club-course-schema" data={courseSchema} />
      <JsonLd id="debate-club-faq-schema" data={faqSchema} />
      <JsonLd id="debate-club-breadcrumb-schema" data={breadcrumbSchema} />

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
            Weekly Membership Community
          </p>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Join the DSDC Debate Club — a Weekly Online Community for Grades 4-12
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            Membership in a structured weekly club — not a one-off class. Cohort-based progression, a
            term-by-term tournament cycle, showcase debates, and a national peer group that meets over Zoom
            all year long.
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
              See All Class Levels
            </Link>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/Course"
        title="Debate Club at a Glance"
        facts={[
          { label: "Format", value: "Live online via Zoom" },
          { label: "Grades", value: "4 through 12" },
          { label: "Group size", value: "Usually 8-12 students" },
          { label: "Schedule", value: "Weekly, 1-1.5 hours per session" },
          { label: "Coaches", value: "Canadian National Debate Team alumni and top university debaters" },
          { label: "Formats taught", value: "CNDF, British Parliamentary, World Schools, Cross-Examination" },
          { label: "Pricing", value: "$30-50 CAD/hr group rate" },
          { label: "Next step", value: "Free 15-minute consultation" },
        ]}
      />

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            What Makes This a Club, Not Just a Class
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              A class is a fixed curriculum you complete. A club is an ongoing community you belong to.
              DSDC members join a cohort in the Fall, stay with that cohort through the year, and progress
              together through a three-term arc — foundations, tournament season, and a Spring showcase.
              Members build real friendships with peers they&apos;ve practiced alongside for months.
            </p>
            <p>
              Membership includes more than weekly sessions. Club members get access to internal practice
              rounds between cohorts, invitations to showcase and demo debates, priority signups for
              tournament prep intensives, and a shared national peer pool that&apos;s bigger and more varied
              than any single school club. A student in Ottawa practices regularly with peers from
              Vancouver, Calgary, Toronto, and Halifax.
            </p>
            <p>
              Because the club is cohort-based, members don&apos;t compete against rotating drop-in
              strangers each week — they grow into the same group. That continuity is the reason parents
              see visible progression by term two, rather than repeating the same basics every session. For
              a single-class experience instead, families usually prefer our{" "}
              <Link href="/online-debate-classes" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                online debate classes
              </Link>
              .
            </p>
            <p>
              For families who want a closer look at how DSDC structures its programs, the{" "}
              <Link href="/classes" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                classes page
              </Link>{" "}
              lists every cohort and level, and the{" "}
              <Link href="/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                pricing page
              </Link>{" "}
              publishes every rate before you book.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Debate Club Tiers
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
            Members are placed into the right club tier based on grade, experience, and goals.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {clubTiers.map((tier) => (
              <article
                key={tier.tier}
                className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{tier.tier}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{tier.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            A Term-by-Term Tournament Prep Cycle
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
            DSDC&apos;s debate club follows a three-term arc each year so members build momentum instead of
            starting over every few weeks.
          </p>
          <div className="space-y-5">
            {clubCycle.map((phase, index) => (
              <article
                key={phase.phase}
                className="flex flex-col gap-2 rounded-2xl border border-warm-200 bg-warm-50 p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800 md:flex-row md:items-start md:gap-6"
              >
                <div className="flex shrink-0 items-center gap-3 md:w-48">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400 font-bold text-navy-900">
                    {index + 1}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300 font-sans">
                    Term {index + 1}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-navy-800 dark:text-white font-serif">{phase.phase}</h3>
                  <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{phase.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            What DSDC Debate Club Members Get
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {clubBenefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-2 text-lg font-bold text-navy-800 dark:text-white">{benefit.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{benefit.text}</p>
              </article>
            ))}
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
            Ready to join Canada&apos;s online debate club?
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">
            Book a free 15-minute consultation and we will recommend the right club tier for your
            child&apos;s grade, confidence level, and goals.
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
