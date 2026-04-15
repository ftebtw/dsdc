import type { Metadata } from "next";
import Link from "next/link";
import KeyFactsBox from "@/components/KeyFactsBox";
import WorldScholarsCupCoachingPageZh from "@/components/WorldScholarsCupCoachingPageZh";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { getRequestLocale } from "@/lib/requestLocale";

const faqItems = [
  {
    question: "How do you qualify for the World Scholar's Cup?",
    answer:
      "You qualify by competing in a Regional Round and placing high enough in the team or individual rankings to earn a Global Round invitation. Top Global Round scholars then qualify for the Tournament of Champions at Yale. DSDC coaches students through each stage - our students have a 100% regional-qualification rate since 2020.",
  },
  {
    question: "What is the theme for the Scholar's Cup 2026?",
    answer:
      "The World Scholar's Cup releases a new curriculum theme each year that is shared across all six subject areas. DSDC updates its coaching plan as soon as the 2026 theme is announced, and families enrolled in our WSC cohort get a theme-mapped reading list, curriculum outline, and term-by-term preparation schedule before the first class.",
  },
  {
    question: "Is the World Scholar's Cup expensive?",
    answer:
      "Competition costs depend on which round your child attends. Regional Rounds typically cost around $100-200 USD in registration fees. Global Rounds and the Tournament of Champions at Yale cost more because families travel to host cities. DSDC's own coaching is priced at $30-50 CAD per hour for group classes, which is much lower than most WSC tutoring programs.",
  },
  {
    question: "What age and grade is the World Scholar's Cup for?",
    answer:
      "Students in Grades 4-12 can participate. There are two divisions: Junior (roughly Grades 4-7) and Senior (roughly Grades 8-12). DSDC coaches students across both divisions and places them into classes alongside peers of similar age and experience.",
  },
  {
    question: "Does my child need prior debate experience to join WSC coaching?",
    answer:
      "No. WSC includes debate as one of four events, but it is not a debate-only competition. Many students start with no formal debate background and still thrive. Our coaching prepares students for all four events - Team Debate, Collaborative Writing, Scholar's Challenge, and Scholar's Bowl - from scratch.",
  },
  {
    question: "When do WSC classes run during the year?",
    answer:
      "WSC classes are seasonal and align with the competition calendar. Most families start preparation several months before their regional round, with additional intensive sessions before the Global Round and the Tournament of Champions at Yale. Contact us for the current schedule and cohort timing.",
  },
  {
    question: "How much does WSC coaching cost?",
    answer:
      "WSC classes follow our standard group pricing of $30-50 CAD per hour. Private and semi-private coaching is also available for students preparing for Global Rounds or Yale. See our pricing page for full details.",
  },
  {
    question: "Where are WSC competitions held?",
    answer:
      "Regional Rounds happen in cities worldwide, including several locations across Canada. Global Rounds rotate between major international cities - past hosts include Beijing, Bangkok, Sydney, Dubai, Amsterdam, and Durban. The Tournament of Champions is held every year at Yale University in New Haven, Connecticut.",
  },
  {
    question: "What is DSDC's World Scholar's Cup qualification rate?",
    answer:
      "Every DSDC student who has entered a World Scholar's Cup regional round since 2020 has qualified to advance. That is a 100% qualification rate from regionals through globals and all the way to the Tournament of Champions at Yale - a record we are extremely proud of.",
  },
  {
    question: "What is the difference between WSC and a traditional debate tournament?",
    answer:
      "Traditional debate tournaments focus almost entirely on speaking and argumentation. The World Scholar's Cup is an interdisciplinary academic competition that blends debate with creative writing, a multiple-choice exam, and a team-based multimedia quiz. It rewards curiosity and breadth of knowledge as much as raw debating skill.",
  },
  {
    question: "How much time should my child spend preparing for WSC each week?",
    answer:
      "A typical DSDC WSC student trains once per week in a live class (usually two hours) plus short reading or practice assignments between sessions. Students preparing for Global Rounds or the Tournament of Champions usually increase to twice-weekly sessions closer to the competition.",
  },
  {
    question: "Can my child join WSC coaching from outside Canada?",
    answer:
      "Yes. DSDC runs classes live online via Zoom, so students from anywhere in the world can join, as long as they can attend at a reasonable local time. We have coached WSC students from across North America, Asia, and beyond.",
  },
  {
    question: "Is WSC worth it for university applications?",
    answer:
      "Yes. WSC gives students measurable accomplishments (regional qualification, global qualification, Tournament of Champions invitations), interdisciplinary knowledge across six subject areas, and interview-ready stories about teamwork, writing, and public speaking. Admissions committees consistently value structured, progression-based extracurriculars like WSC.",
  },
];

const prepareForWsc = [
  {
    title: "Step 1: Understand the format",
    text: "Learn the rules for each of the four events - Team Debate, Collaborative Writing, Scholar's Challenge, and Scholar's Bowl - before your child starts preparing. Knowing the format first prevents wasted practice.",
  },
  {
    title: "Step 2: Read the year's curriculum",
    text: "Each WSC season has a themed curriculum covering Science, History, Art & Music, Literature, Social Studies, and a Special Area. Start with the official outline and build a reading list from there.",
  },
  {
    title: "Step 3: Join a coached cohort",
    text: "Self-study is hard to sustain. A coached cohort gives your child a schedule, accountability, written feedback, and a team of peers to practice with every week - the biggest single factor in whether students qualify.",
  },
  {
    title: "Step 4: Do weekly mock rounds",
    text: "Mock debates, timed writing, and practice Scholar's Challenge exams reveal weak spots months before regionals. DSDC mock rounds mirror the real competition conditions so students show up calm.",
  },
  {
    title: "Step 5: Prioritize Team Debate and Collaborative Writing",
    text: "These two events are the most coachable and most often decide whether a team qualifies. Spend the most preparation time here - Scholar's Bowl rhythm and Scholar's Challenge content review can stack on top once the speaking and writing fundamentals are in place.",
  },
  {
    title: "Step 6: Plan travel early if you qualify",
    text: "Regional Round qualifiers need to plan Global Round travel weeks in advance. DSDC helps families figure out which Global Round city fits their schedule and what the workload looks like after qualifying.",
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
    "Prepare for the World Scholar's Cup with DSDC's expert coaching. 100% qualification rate from regionals to the Tournament of Champions at Yale since 2020. Online classes for Grades 4-12 covering all four WSC events.",
  provider: {
    "@type": "EducationalOrganization",
    name: "Debate & Speech Development Community (DSDC)",
    sameAs: "https://dsdc.ca",
  },
  url: "https://dsdc.ca/world-scholars-cup-coaching",
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "Online",
    courseWorkload: "PT2H",
    instructor: {
      "@type": "Organization",
      name: "DSDC",
    },
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildLocalizedPageMetadata({
    path: "/world-scholars-cup-coaching",
    title:
      locale === "zh"
        ? "World Scholar's Cup 教学 2026 | 如何晋级 | DSDC"
        : "World Scholar's Cup Coaching 2026 | How to Qualify | DSDC",
    description:
      locale === "zh"
        ? "如何为 World Scholar's Cup 2026 做准备并成功晋级。DSDC 是加拿大顶级的 WSC 教学项目，自 2020 年起保持 100% 晋级率。4-12 年级的在线直播课，覆盖全部四个 WSC 项目：Team Debate、Collaborative Writing、Scholar's Challenge、Scholar's Bowl。"
        : "How to prepare for and qualify for the World Scholar's Cup 2026. DSDC is Canada's top-rated WSC coaching program with a 100% qualification rate since 2020. Live online classes for Grades 4-12 covering all four WSC events: Team Debate, Collaborative Writing, Scholar's Challenge, and Scholar's Bowl.",
    keywords: [
      "World Scholar's Cup coaching",
      "World Scholar's Cup 2026",
      "how to qualify for World Scholar's Cup",
      "World Scholar's Cup theme",
      "Scholar's Cup preparation",
      "WSC coaching Canada",
      "WSC Tournament of Champions",
    ],
    images: [
      {
        url: "/images/photos/wsc-students-1.jpg",
      },
    ],
    hasChineseVersion: true,
  });
}

const wscEvents = [
  {
    title: "Team Debate",
    subtitle: "The speaking event",
    text: "Teams of three debate curriculum-linked motions in a British Parliamentary-influenced format. Each student delivers a constructive speech, faces Points of Information, and has to weave together arguments from history, science, literature, and current events. DSDC coaches Team Debate exactly like our core debate classes - with structured case-building, rebuttal drills, and live practice rounds against other DSDC teams - so students walk into regionals already comfortable with the format.",
    preparesFor: "Team Debate is where debate-trained students often score highest, which is why DSDC's debate-first approach translates so well into WSC results.",
  },
  {
    title: "Collaborative Writing",
    subtitle: "The team essay event",
    text: "Students write a single collaborative essay in response to one of several prompts drawn from the year's curriculum. Teams have a fixed amount of time to plan, draft, and polish together, which means writing fluency, topic knowledge, and teamwork all matter. DSDC coaches writing structure, prompt analysis, and time-management habits that let teams submit a strong finished piece under pressure.",
    preparesFor: "Strong Collaborative Writing scores are one of the most common differentiators between teams that advance and teams that stall at regionals.",
  },
  {
    title: "Scholar's Challenge",
    subtitle: "The individual academic exam",
    text: "A 120-question multiple-choice test covering all six subject areas of the year's curriculum. Unlike a standard exam, Scholar's Challenge questions often have more than one defensible answer, so students learn to weigh options and reason under time pressure. DSDC uses curriculum mapping, active-recall review, and timed mock tests so students walk in with a real strategy instead of just hoping they have read enough.",
    preparesFor: "Scholar's Challenge is the event where individual preparation matters most - and the one most self-studying WSC students underestimate.",
  },
  {
    title: "Scholar's Bowl",
    subtitle: "The team multimedia quiz",
    text: "A fast-paced, team-based quiz show that mixes images, audio, video, and text. Teams answer together under strict time limits, so students need to communicate quickly and trust each other's instincts. DSDC coaches Scholar's Bowl through live practice rounds, team-response drills, and content reviews across the curriculum so students build both knowledge and rhythm.",
    preparesFor: "Scholar's Bowl rewards teams that have practiced answering together - not just individuals who have studied hard alone.",
  },
];

const wscSubjects = [
  {
    title: "Science",
    text: "Every year's curriculum rotates through a themed science area - astronomy, neuroscience, genetics, environmental science, and more. Students learn not just facts but how scientists think about uncertainty and evidence.",
  },
  {
    title: "History",
    text: "The history track picks an era, region, or theme that ties back into the year's overall curriculum. Students read across primary sources, compare historians, and develop the kind of interpretive thinking that also powers strong debate.",
  },
  {
    title: "Art & Music",
    text: "WSC takes Art & Music seriously - students study specific works, movements, and composers chosen for the year's theme. This is often the event where less traditional students shine because it rewards aesthetic reasoning and comparison.",
  },
  {
    title: "Literature",
    text: "Literature covers assigned novels, short stories, and poems from the curriculum. Students practice close reading, theme analysis, and character argumentation - skills that feed directly into both Team Debate and Collaborative Writing.",
  },
  {
    title: "Social Studies",
    text: "Social Studies covers economics, political theory, sociology, psychology, and culture. It is often the subject that shows up most directly in Team Debate motions, so strong preparation here has a double payoff.",
  },
  {
    title: "Special Area",
    text: "Every year the Special Area is a brand-new theme unique to that season - sometimes a mashup subject, sometimes a concept-driven topic. It rewards curiosity, cross-disciplinary thinking, and students who can connect ideas quickly.",
  },
];

const preparationTimeline = [
  {
    phase: "Foundation (Months 1-2)",
    title: "Build the base",
    text: "Students start with the year's curriculum overview, introductory reading, and debate fundamentals. Early classes focus on understanding the six subject areas, learning the format of each event, and practicing short speeches in a low-pressure environment.",
  },
  {
    phase: "Skill Building (Months 3-4)",
    title: "Train each event separately",
    text: "Weekly classes shift to targeted practice in Team Debate, Collaborative Writing, Scholar's Challenge, and Scholar's Bowl. Students work in pairs and small teams, receive written feedback, and begin timed drills so they are ready for real-round pressure.",
  },
  {
    phase: "Regional Prep (Month 5)",
    title: "Dress rehearsal before regionals",
    text: "Mock rounds mirror regional conditions: full-length debates, timed writing sessions, practice Scholar's Challenge exams, and live Bowl rounds. Coaches diagnose specific weaknesses and give each student a personalized final-week plan.",
  },
  {
    phase: "Global Rounds & Beyond",
    title: "Scale up to globals and Yale",
    text: "Students who advance to Global Rounds move into an intensive cohort with expanded content review, advanced writing practice, and higher-stakes mock rounds. Students heading to the Tournament of Champions at Yale get additional one-on-one coaching.",
  },
];

const whyDsdcForWsc = [
  {
    title: "100% qualification rate since 2020",
    text: "Every DSDC student who has entered a regional round since 2020 has advanced through the next level. That record is unusual for a reason - most WSC programs cannot say it because most programs are not built debate-first.",
  },
  {
    title: "Debate-first coaching staff",
    text: "Our coaches come from the Canadian National Debate Team, UBC, SFU, and major international debate circuits. That directly benefits Team Debate scores and also strengthens the argumentation inside Collaborative Writing.",
  },
  {
    title: "Interdisciplinary curriculum support",
    text: "Because DSDC also teaches general debate, students are already used to discussing history, science, and philosophy in class. That familiarity makes WSC subject review feel less like cramming and more like deepening.",
  },
  {
    title: "Real Yale-level track record",
    text: "Our students have traveled to Beijing, Amsterdam, Sydney, and New Haven (Yale) to compete. We know what the later rounds actually demand, and we coach toward that standard from the first class.",
  },
];

export default async function WorldScholarsCupCoachingPage() {
  const locale = await getRequestLocale();
  if (locale === "zh") {
    return <WorldScholarsCupCoachingPageZh />;
  }

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
          <p className="mb-4 text-sm sm:text-base font-bold uppercase tracking-[0.25em] text-gold-300">
            Canada&apos;s Top-Rated WSC Coaching Program
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            World Scholar&apos;s Cup Coaching in Canada
          </h1>
          <p className="text-xl text-white/90 font-sans mb-10 max-w-4xl mx-auto">
            Live online coaching for all four World Scholar&apos;s Cup events - Team Debate, Collaborative Writing,
            Scholar&apos;s Challenge, and Scholar&apos;s Bowl. 100% qualification rate from regionals to the Tournament of
            Champions at Yale, every year since 2020.
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

      {/* Proof strip above the fold */}
      <section className="bg-gold-400 dark:bg-gold-500/90 py-6 md:py-7">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-900">100%</div>
              <div className="text-xs md:text-sm font-semibold text-navy-900/85 mt-1">WSC qualification rate since 2020</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-900">4</div>
              <div className="text-xs md:text-sm font-semibold text-navy-900/85 mt-1">WSC events fully covered</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-900">Yale</div>
              <div className="text-xs md:text-sm font-semibold text-navy-900/85 mt-1">Tournament of Champions alumni</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-900">2017</div>
              <div className="text-xs md:text-sm font-semibold text-navy-900/85 mt-1">Coaching since</div>
            </div>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/Course"
        title="Key Facts"
        facts={[
          { label: "Program", value: "World Scholar's Cup preparation" },
          { label: "Qualification rate", value: "100% since 2020, regionals through Tournament of Champions at Yale" },
          { label: "Format", value: "Live online via Zoom" },
          { label: "Schedule", value: "Seasonal classes, 1-2x per week, 2 hours each" },
          { label: "Ages", value: "Grades 4-12 (Junior and Senior divisions)" },
          { label: "Pricing", value: "$30-50 CAD/hr (group classes); private coaching available" },
          { label: "Competition destinations", value: "Beijing, Amsterdam, Sydney, Dubai, Durban, and Yale University" },
          { label: "Events covered", value: "Team Debate, Collaborative Writing, Scholar's Challenge, Scholar's Bowl" },
          { label: "Subject coverage", value: "Science, History, Art & Music, Literature, Social Studies, Special Area" },
          { label: "Coaches", value: "Debate-first staff from UBC, SFU, and Canada's National Debate Team" },
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
              120-question multiple-choice test), and Scholar&apos;s Bowl (a team-based multimedia quiz). For many
              families, WSC is the first major international competition that blends speaking, writing, critical
              thinking, and teamwork in one program.
            </p>
            <p>
              Students compete in Regional Rounds held in cities worldwide, advance to Global Rounds (hosted in
              locations like Beijing, Amsterdam, Sydney, Dubai, and Durban), and the top scholars qualify for the
              Tournament of Champions held annually at Yale University. This three-stage progression gives students a
              clear pathway from local participation to world-level achievement - and a story that stands out on
              university applications.
            </p>
            <p>
              WSC is known for its interdisciplinary approach. Each year&apos;s curriculum spans six subjects -
              Science, History, Art &amp; Music, Literature, Social Studies, and a Special Area - and the themes are
              deliberately thought-provoking. WSC rewards curiosity, perspective, and intellectual flexibility rather
              than memorization alone, which is why so many DSDC students who start with debate end up loving WSC.
            </p>
            <p>
              For students in Grades 4-12, it is one of the most rewarding academic journeys available. Beyond medals
              and rankings, WSC builds confidence, communication skills, and a lasting global community of peers who
              share a love of learning. DSDC is Canada&apos;s top-rated WSC coaching program, helping students from
              Vancouver, Toronto, Calgary, Ottawa, and across Canada prepare for every stage of the competition.
            </p>
          </div>
        </div>
      </section>

      {/* NEW: Four WSC events explained */}
      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-4">
            The Four World Scholar&apos;s Cup Events Explained
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
            WSC is not a single test. It is four separate events that each reward a different kind of thinking - and
            strong scholars need real preparation in all of them. Here is what each event actually looks like and how
            DSDC coaches it.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wscEvents.map((event) => (
              <article
                key={event.title}
                className="flex flex-col rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 shadow-sm"
              >
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300 font-sans">
                  {event.subtitle}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-navy-800 dark:text-white mb-3 font-serif">
                  {event.title}
                </h3>
                <p className="text-charcoal/75 dark:text-navy-200 font-sans leading-relaxed mb-4">{event.text}</p>
                <p className="mt-auto text-sm text-navy-700 dark:text-gold-300 font-sans italic leading-relaxed">
                  {event.preparesFor}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Six subject areas */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-4">
            The Six WSC Subject Areas
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
            Every WSC season comes with a freshly themed curriculum that covers six subject areas. Questions in every
            event - Team Debate, Collaborative Writing, Scholar&apos;s Challenge, and Scholar&apos;s Bowl - pull from
            these subjects, so preparation has to be interdisciplinary from day one.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {wscSubjects.map((subject) => (
              <article
                key={subject.title}
                className="rounded-xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800 p-5"
              >
                <h3 className="text-lg font-bold text-navy-800 dark:text-white mb-2">{subject.title}</h3>
                <p className="text-charcoal/70 dark:text-navy-300 font-sans leading-relaxed text-sm">{subject.text}</p>
              </article>
            ))}
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
            incredibly proud of, and it is what students and families get access to when they train with us.
          </p>
          <p className="text-base text-charcoal/70 dark:text-navy-300 font-sans text-center mt-4">
            Our students have traveled to compete in Beijing, Amsterdam, Sydney, Durban, Dubai, and New Haven (Yale).
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-10">
            How DSDC Prepares Students for the World Scholar&apos;s Cup
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              "Seasonal classes (1-2x per week, 2 hours each) aligned with the WSC competition calendar",
              "Full curriculum coverage across all six WSC subject areas",
              "Dedicated drilling for Team Debate, Collaborative Writing, Scholar's Challenge, and Scholar's Bowl",
              "Mock competitions and timed practice rounds to build confidence under real pressure",
              "Personalized feedback and targeted prep based on each student's strengths and weaknesses",
              "Team-based writing workshops that replicate the Collaborative Writing event format",
              "Scholar's Bowl practice sessions with multimedia question banks",
              "Fully online via Zoom, so students can join from anywhere in Canada or around the world",
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

      {/* NEW: WSC preparation timeline */}
      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-4">
            A Typical WSC Preparation Season at DSDC
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
            Strong WSC results come from a real training arc, not from last-minute cramming. Here is what a typical
            DSDC preparation season looks like from first class to the Tournament of Champions.
          </p>
          <div className="space-y-5">
            {preparationTimeline.map((phase, index) => (
              <article
                key={phase.title}
                className="flex flex-col gap-2 rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 md:flex-row md:items-start md:gap-6 shadow-sm"
              >
                <div className="flex shrink-0 items-center gap-3 md:w-56">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400 font-bold text-navy-900">
                    {index + 1}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300 font-sans">
                    {phase.phase}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-2 font-serif">{phase.title}</h3>
                  <p className="text-charcoal/75 dark:text-navy-200 font-sans leading-relaxed">{phase.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: How to Prepare for WSC - targets PAA */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-4">
            How to Prepare for the World Scholar&apos;s Cup
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
            Strong WSC preparation is sequenced, not improvised. This is the practical preparation path DSDC
            uses with every student - whether they are training for a first Regional Round or a Tournament of
            Champions run at Yale.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {prepareForWsc.map((step) => (
              <article
                key={step.title}
                className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800 p-6 shadow-sm"
              >
                <h3 className="text-lg md:text-xl font-bold text-navy-800 dark:text-white mb-2">{step.title}</h3>
                <p className="text-charcoal/75 dark:text-navy-200 font-sans leading-relaxed">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: WSC 2026 theme and curriculum */}
      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-6">
            The World Scholar&apos;s Cup 2026 Theme and Curriculum
          </h2>
          <div className="space-y-5 text-charcoal/80 dark:text-navy-200 text-lg leading-relaxed font-sans">
            <p>
              Every World Scholar&apos;s Cup season is built around a fresh theme that runs through all six
              subject areas and all four events. The 2026 theme shapes everything from the reading list in
              Literature to the case studies in Social Studies to the debate motions in Team Debate - which
              is why students who prepare with a theme-aware curriculum do so much better than students
              cramming from last year&apos;s outline.
            </p>
            <p>
              DSDC rebuilds its WSC cohort syllabus as soon as the 2026 theme is released. Our coaches map
              the official curriculum outline to weekly lessons, assign a theme-specific reading list,
              and run practice rounds on motions drawn directly from the year&apos;s topics. Students walk
              into regionals already familiar with the subject connections WSC judges reward most.
            </p>
            <p>
              If you want to see the current theme, the latest curriculum announcements, and how we are
              adapting our cohort for the coming season, the fastest way to get specifics is to{" "}
              <Link href="/book" className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                book a free consultation
              </Link>
              . We will share the current theme, explain how it maps to each event, and recommend the right
              starting cohort for your child&apos;s grade and experience level.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-8">
            Is the World Scholar&apos;s Cup Right for Your Child?
          </h2>
          <div className="space-y-5 text-lg text-charcoal/80 dark:text-navy-200 leading-relaxed font-sans">
            <p>
              WSC is ideal for curious, academically motivated students who love learning across subjects. You
              don&apos;t need debate experience to start - many DSDC WSC students are trying competitive academics for
              the first time and still qualify on their first attempt.
            </p>
            <p>
              Students in Grades 4-12 can participate. Younger students compete in the Junior division, while older
              students compete in the Senior division. Both divisions share the same curriculum, just with
              age-appropriate expectations.
            </p>
            <p>
              If your child loves reading, trivia, writing, or intellectual discussion, WSC is a natural fit. If your
              child is already in our{" "}
              <Link
                href="/online-debate-classes"
                className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors"
              >
                online debate classes
              </Link>
              , adding WSC is one of the most rewarding next steps available.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            The World Scholar&apos;s Cup Competition Pathway
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Regional Round",
                text: "Held in cities worldwide, including several locations across Canada. Top teams qualify for Global Rounds.",
              },
              {
                step: "2",
                title: "Global Round",
                text: "Held in a major international city (Beijing, Amsterdam, Sydney, Durban, Dubai, and others). Top scholars qualify for the Tournament of Champions.",
              },
              {
                step: "3",
                title: "Tournament of Champions",
                text: "Held every year at Yale University in New Haven, Connecticut. The pinnacle of WSC and the most rewarding week of the year for qualifying scholars.",
              },
            ].map((item) => (
              <article
                key={item.step}
                className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6"
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

      {/* NEW: Why DSDC for WSC */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-4">
            Why Families Choose DSDC for World Scholar&apos;s Cup Coaching
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
            There are several WSC coaching options out there. Here is what makes DSDC different - and why we have the
            qualification record we do.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {whyDsdcForWsc.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800 p-6 shadow-sm"
              >
                <h3 className="text-lg md:text-xl font-bold text-navy-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-charcoal/75 dark:text-navy-200 font-sans leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>
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

      {/* NEW: Related reading */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-4">
            Explore More From DSDC
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
            WSC pairs naturally with our debate and public speaking classes. Browse these pages to see how families
            build a full training plan for their child.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                href: "/online-debate-classes",
                title: "Online Debate Classes",
                description:
                  "Our core debate program, which feeds directly into stronger Team Debate performance at WSC.",
              },
              {
                href: "/classes",
                title: "All DSDC Class Levels",
                description:
                  "Compare our full class lineup from novice debate to advanced competitive training.",
              },
              {
                href: "/debate-classes-canada",
                title: "Debate Classes Across Canada",
                description:
                  "How DSDC serves students across every Canadian province through live online classes.",
              },
              {
                href: "/pricing",
                title: "Pricing and Packages",
                description:
                  "Transparent group pricing for WSC and all other DSDC programs.",
              },
              {
                href: "/team",
                title: "Meet the DSDC Coaches",
                description:
                  "The debate-first coaching team behind DSDC's 100% WSC qualification record.",
              },
              {
                href: "/blog/world-scholars-cup",
                title: "WSC Blog Overview",
                description:
                  "A deeper look at why WSC is worth pursuing and what students gain from participating.",
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group block rounded-2xl border border-warm-200 bg-warm-50 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-md dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-2 text-lg font-bold text-navy-800 transition-colors group-hover:text-gold-500 dark:text-white dark:group-hover:text-gold-300">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-navy-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
            Ready to start your child&apos;s World Scholar&apos;s Cup journey?
          </h2>
          <p className="text-lg text-white/80 font-sans leading-relaxed max-w-3xl mx-auto mb-8">
            The best way to start is a free 15-minute consultation. We will talk through your child&apos;s grade,
            confidence level, and goals, and recommend the right DSDC WSC cohort for this season.
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
        </div>
      </section>
    </>
  );
}
