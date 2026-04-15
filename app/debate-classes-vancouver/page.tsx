import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import VancouverLandingPageZh from "@/components/VancouverLandingPageZh";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { getRequestLocale } from "@/lib/requestLocale";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";
import { vancouverFaqItems as faqItems } from "@/lib/faqData";

const faqSchema = buildFaqSchema(faqItems);

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "DSDC - Debate & Speech Development Community",
  description:
    "Online debate and public speaking classes for kids, teens, and university students in Vancouver and the Lower Mainland.",
  url: "https://dsdc.ca",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Vancouver",
    addressRegion: "BC",
    addressCountry: "CA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 49.2827,
    longitude: -123.1207,
  },
  email: "education@dsdc.ca",
  foundingDate: "2017",
  areaServed: [
    "Vancouver",
    "Burnaby",
    "Surrey",
    "Richmond",
    "Coquitlam",
    "New Westminster",
    "North Vancouver",
    "West Vancouver",
    "Langley",
    "Delta",
    "White Rock",
    "Abbotsford",
    "Maple Ridge",
  ],
};

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "Course",
      position: 1,
      name: "Vancouver Debate Classes for Kids",
      description:
        "Foundational and competitive debate classes for kids in Vancouver and the Lower Mainland, delivered live online by DSDC.",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
    },
    {
      "@type": "Course",
      position: 2,
      name: "Public Speaking Classes in Vancouver",
      description:
        "Public speaking classes for kids in Vancouver focused on confidence, delivery, and structured speaking practice.",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
    },
    {
      "@type": "Course",
      position: 3,
      name: "World Scholar's Cup Coaching in Vancouver",
      description:
        "Vancouver-founded World Scholar's Cup coaching with a 100% qualification rate since 2020.",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
    },
  ],
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Debate Classes Vancouver", path: "/debate-classes-vancouver" },
]);

const testimonials = [
  {
    name: "Angela M.",
    role: "Student, Grade 8",
    quote:
      "DSDC has been my home for debate ever since I started three years ago. I've seen myself visibly improve in confidence and critical thinking.",
  },
  {
    name: "Ryland C.",
    role: "Student, Grade 9",
    quote:
      "The coaches always provide thoughtful feedback and put real effort into developing lessons with student growth in mind.",
  },
  {
    name: "Daniel W.",
    role: "Student, Grade 9",
    quote:
      "The environment at DSDC is simply wonderful. The teachers are supportive of every individual student and are passionate about developing young minds.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildLocalizedPageMetadata({
    path: "/debate-classes-vancouver",
    title: locale === "zh" ? "温哥华辩论课程 | DSDC 在线辩论与演讲训练" : "Debate Classes Vancouver | DSDC Debate School",
    description:
      locale === "zh"
        ? "DSDC 为温哥华和大温家庭提供可在线参加的辩论与公共演讲课程，帮助孩子提升表达、自信与比赛能力。"
        : "DSDC offers debate classes Vancouver families can join online, with debate coaching, public speaking, and BC tournament prep across the Lower Mainland.",
    images: [{ url: "/images/photos/wsc-group-2.jpg" }],
    hasChineseVersion: true,
  });
}

export default async function DebateClassesVancouverPage() {
  const locale = await getRequestLocale();

  if (locale === "zh") {
    return <VancouverLandingPageZh />;
  }

  return (
    <>
      <JsonLd id="vancouver-faq-schema" data={faqSchema} />
      <JsonLd id="vancouver-local-business-schema" data={localBusinessSchema} />
      <JsonLd id="vancouver-course-schema" data={courseSchema} />
      <JsonLd id="vancouver-breadcrumb-schema" data={breadcrumbSchema} />

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
            Debate Classes Vancouver Families Can Join Online
          </h1>
          <p className="text-xl text-white/90 font-sans mb-10 max-w-3xl mx-auto">
            A Vancouver-founded debate school offering live online debate classes, public speaking, and debate club
            style training for students across the Lower Mainland.
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
              View Our Classes
            </Link>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/EducationalOrganization"
        title="Key Facts"
        facts={[
          { label: "Founded", value: "2017, Vancouver, Canada" },
          { label: "Format", value: "Live online via Zoom" },
          { label: "Class size", value: "8-12 students" },
          { label: "Ages", value: "Grades 4-12 and university students" },
          { label: "Pricing", value: "$30-50 CAD/hr (group classes)" },
          { label: "Formats taught", value: "CNDF, British Parliamentary, World Schools, Cross-Examination" },
          { label: "Notable result", value: "100% World Scholar's Cup qualification rate since 2020" },
          { label: "Coaches", value: "20+ coaches from UBC, SFU, and the Canadian National Team" },
          { label: "Location", value: "Vancouver, BC, Canada" },
          { label: "Service area", value: "Vancouver, Burnaby, Richmond, Coquitlam, Surrey, North Vancouver, West Vancouver, New Westminster, Langley, Delta" },
        ]}
      />

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 dark:text-white mb-8 text-center">
            Vancouver's Online Debate Academy
          </h2>
          <div className="space-y-5 text-charcoal/80 dark:text-navy-200 text-lg leading-relaxed font-sans">
            <p>
              DSDC was founded in Vancouver in 2017 and has been coaching students in debate and public speaking for
              more than seven years. Our mission started in BC and has grown into a program trusted by families who
              want serious communication training, strong academic thinking, and tournament-level results.
            </p>
            <p>
              While many Vancouver debate academies require families to drive across town for in-person classes, DSDC
              delivers the same quality of coaching online via Zoom. Students in Burnaby, Surrey, Richmond, Coquitlam,
              New Westminster, North Vancouver, West Vancouver, Langley, Delta, White Rock, and across the Lower
              Mainland can access expert coaching without leaving home.
            </p>
            <p>
              Our coaches include competitors from the Canadian National Debate Team, World University Debating
              Championships, UBC, SFU, and other top universities. We prepare students for BC Provincial
              Championships, Canadian Nationals, and international tournaments including the World Scholar's Cup at
              Yale.
            </p>
            <p>
              Families searching for speech and debate classes in Vancouver usually want more than one format. They
              want debate classes, public speaking classes, and public speaking for kids that can grow into advanced
              debate coaching over time. DSDC offers that full pathway, starting with beginner-friendly programs and
              continuing into high-level competitive training.
            </p>
            <p>
              Parents comparing the best fit often review our{" "}
              <Link
                href="/pricing"
                className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors"
              >
                pricing
              </Link>{" "}
              first, then meet our{" "}
              <Link
                href="/team"
                className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors"
              >
                coaching team
              </Link>{" "}
              and read our{" "}
              <Link
                href="/blog/best-debate-programs-vancouver"
                className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors"
              >
                guide to choosing a debate program
              </Link>
              . No commute. No traffic. Just world-class debate coaching from Vancouver's own debate academy. New to
              debate? Explore our{" "}
              <Link
                href="/debate-classes-for-beginners"
                className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors"
              >
                beginner-friendly classes
              </Link>
              , or view all{" "}
              <Link
                href="/online-debate-classes"
                className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors"
              >
                online debate class levels
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            Debate Formats Vancouver Students Learn at DSDC
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: "CNDF (Canadian National Debate Format)",
                text: "CNDF is the flagship high school format used at Canadian Nationals and many BC tournaments. Students learn how to build structured cases, field Points of Information, and deliver sharp summary speeches that reward logic, organization, and calm rebuttal.",
              },
              {
                title: "British Parliamentary",
                text: "British Parliamentary is the dominant format at many senior-level tournaments in BC and at university circuits like UBC and SFU. It teaches students to think quickly, compare nuanced arguments, and speak persuasively in four-team debates where strategic ranking matters as much as raw content.",
              },
              {
                title: "World Schools",
                text: "World Schools combines prepared and impromptu debating, making it excellent for students who want a balance of research, teamwork, and flexible speaking. It is widely used for international competition, and DSDC alumni have gone on to represent Canada at the World Schools Debating Championships.",
              },
              {
                title: "Cross-Examination",
                text: "Cross-Examination debate emphasizes direct engagement, evidence comparison, and quick strategic responses under pressure. It is especially useful for students who want to become more precise researchers and stronger refuters rather than only polished speech-givers.",
              },
              {
                title: "Public Speaking and Speech Events",
                text: "Many Vancouver families want a program that blends debate with core speaking skills, so we also coach impromptu, persuasive, and interpretive speaking. That helps students who are preparing for BC speech competitions or who want stronger confidence before moving into full debate rounds.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-5"
              >
                <h3 className="text-lg font-bold text-navy-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-charcoal/70 dark:text-navy-300 font-sans leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            Our Class Levels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Novice (Grades 4-6)",
                text: "An excellent starting point for younger scholars eager to develop public speaking and debate skills. Build confidence through the fundamentals of speech execution and foundational debate formats - even shy and introverted children thrive. Saturdays, 2 hours/week.",
                learnMoreLabel: "View Novice Debate Classes",
              },
              {
                title: "Junior (Grades 7-9)",
                text: "Build competitive debate skills while accelerating academic growth. Coaches integrate challenging topics like International Relations, Law, Philosophy, and Economics into debate practice. Weekends, 2 hours/week.",
                learnMoreLabel: "View Junior Debate Classes",
              },
              {
                title: "Senior (Grades 10-12)",
                text: "Rigorous practice in British Parliamentary, CNDF, and World Schools formats with advanced lectures on complex topics. 1-2x per week, 2 hours.",
                learnMoreLabel: "View Senior Debate Classes",
              },
              {
                title: "Advanced Competitive (Grades 10-12)",
                text: "An elite program led by world-renowned university debaters for students deeply committed to competitive debate. Intensive drills, mock debates, and personalized coaching. 2x per week, 2 hours.",
                learnMoreLabel: "View Advanced Competitive Classes",
              },
              {
                title: "Public Speaking (Grades 4-9)",
                text: "Comprehensive training in impromptu, persuasive, interpretive, and parliamentary formats. Designed to prepare students for BC speech provincials.",
                learnMoreLabel: "View Public Speaking Classes",
              },
              {
                title: "World Scholar's Cup (Grades 4-12)",
                text: "Full WSC preparation with a 100% qualification rate since 2020 - from regionals to the Tournament of Champions at Yale.",
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
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            What Parents Should Know Before Joining
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              {
                title: "Weekly Schedule",
                text: "Most classes run once or twice per week in two-hour blocks, which gives students enough time for instruction, speaking practice, and feedback. Families usually find that the weekly rhythm is structured enough to build momentum without overloading the school week.",
              },
              {
                title: "Zoom Setup",
                text: "Students join from home on Zoom with a camera and microphone. Coaches use live instruction, breakout rooms, shared documents, and speaking drills, so the experience feels interactive rather than passive.",
              },
              {
                title: "Homework and Preparation",
                text: "Homework is designed to be manageable and relevant: short research tasks, case outlines, speech prep, or reflection on coach feedback. It supports growth between classes without turning debate into an extra full-time subject.",
              },
              {
                title: "Placement and Progress",
                text: "Students are placed based on age, prior experience, and confidence level rather than a one-size-fits-all model. If a student grows quickly or needs a different level, we help families adjust into the right class pathway.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6"
              >
                <h3 className="text-lg font-bold text-navy-800 dark:text-white mb-3">{item.title}</h3>
                <p className="text-charcoal/75 dark:text-navy-200 font-sans leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 text-center text-lg text-charcoal/80 dark:text-navy-200 font-sans leading-relaxed">
            Families who want to understand the full weekly commitment can compare class options on our{" "}
            <Link
              href="/classes"
              className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors"
            >
              classes page
            </Link>
            , review{" "}
            <Link
              href="/pricing"
              className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors"
            >
              pricing
            </Link>
            , or{" "}
            <Link
              href="/book"
              className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors"
            >
              book a free consultation
            </Link>{" "}
            to talk through placement.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            Where Vancouver Students Compete
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {[
              "BC Provincial Championships",
              "SFU World Schools Championships",
              "UBC Debate Tournaments",
              "Vancouver Regional Championships",
              "Canadian National Debate Championships",
              "World Scholar's Cup - Tournament of Champions at Yale",
              "Stanford, Princeton, Oxford Invitationals",
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
            1,000+ Students Coached / Founded in Vancouver, 2017 / 100% WSC Qualification Rate
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            Why Vancouver Families Choose Online Debate Classes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: "No Commute Required",
                text: "Skip the drive across Vancouver. Your child logs into Zoom from home and gets the same interactive experience - live practice debates, coach feedback, and small group attention.",
              },
              {
                title: "Founded Here, Not Flown In",
                text: "Unlike some academies expanding into Vancouver from other cities, DSDC was born in Vancouver. We know the BC debate scene because we've been part of it since 2017.",
              },
              {
                title: "Coaches from UBC, SFU & Beyond",
                text: "Our team includes debaters from Vancouver's top universities and Canadian National Team alumni.",
              },
              {
                title: "More Affordable Than In-Person",
                text: "Group classes from $30-50/hr - often significantly less than in-person Vancouver debate academies charging $60-100+/hr.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800 p-5"
              >
                <h3 className="text-lg font-bold text-navy-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-charcoal/70 dark:text-navy-300 font-sans leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 text-center text-lg text-charcoal/80 dark:text-navy-200 font-sans leading-relaxed">
            Families often begin by searching terms like &quot;debate classes near me&quot; or &quot;debate club
            Vancouver,&quot; but what matters most is not the postal code of the classroom. It is the quality of the
            coaching, the amount of speaking time, and whether the program can move with your child from beginner
            practice to competitive debate.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-8">
            How DSDC Compares to In-Person Debate Programs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: "Convenience Without Giving Up Quality",
                text: "In-person programs can be valuable, but many Vancouver families lose hours every month to traffic, parking, and long drives across the Lower Mainland. DSDC keeps the live coaching and small-group interaction while removing the commute.",
              },
              {
                title: "Stronger Price Transparency",
                text: "Some in-person academies ask families to book calls before they can even see pricing. DSDC publishes clear group pricing online so parents can compare options honestly before making a decision.",
              },
              {
                title: "Access to More Specialized Coaches",
                text: "Because classes are online, students are not limited to whichever instructor happens to live nearby. DSDC can match Vancouver-area students with coaches from top university and national debate backgrounds across our network.",
              },
              {
                title: "A Better Fit for Busy Families",
                text: "Families balancing school, music, sports, and sibling schedules often find online debate far easier to sustain over an entire term. That consistency matters because steady attendance is one of the biggest drivers of improvement.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6"
              >
                <h3 className="text-lg font-bold text-navy-800 dark:text-white mb-3">{item.title}</h3>
                <p className="text-charcoal/75 dark:text-navy-200 font-sans leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-8">
            Neighborhoods We Serve Across Vancouver and the Lower Mainland
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              "Vancouver West Side and Downtown",
              "East Vancouver and South Vancouver",
              "Burnaby and New Westminster",
              "Richmond",
              "Surrey and White Rock",
              "Coquitlam, Port Coquitlam, and Port Moody",
              "North Vancouver and West Vancouver",
              "Langley, Delta, Maple Ridge, and the Fraser Valley",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800 px-4 py-4 text-sm sm:text-base text-navy-800 dark:text-navy-100 font-medium"
              >
                {item}
              </div>
            ))}
          </div>
          <p className="text-lg text-charcoal/80 dark:text-navy-200 font-sans leading-relaxed text-center">
            DSDC serves students throughout the Greater Vancouver area and beyond. Whether you live in Burnaby,
            Richmond, Surrey, Coquitlam, North Vancouver, West Vancouver, New Westminster, Langley, Delta, White
            Rock, Abbotsford, Maple Ridge, or anywhere else in British Columbia, our online classes make expert debate
            coaching accessible from home. We also work with families across{" "}
            <Link
              href="/debate-classes-canada"
              className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors"
            >
              Canada
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            Testimonials from Vancouver Families
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 shadow-sm"
              >
                <p className="text-base leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-5 border-t border-warm-200 dark:border-navy-700 pt-4">
                  <p className="font-bold text-navy-800 dark:text-white">{item.name}</p>
                  <p className="text-sm text-charcoal/55 dark:text-navy-300">{item.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
            Frequently Asked Questions
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

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-4">
            Further Reading for Vancouver Families
          </h2>
          <p className="text-center text-base text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed max-w-3xl mx-auto mb-10">
            Hand-picked articles from the DSDC blog to help you compare programs and understand how BC debate works.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                href: "/blog/best-debate-programs-vancouver",
                title: "The Best Debate Programs in Vancouver",
                description:
                  "A candid look at how Vancouver debate programs compare on coaching, class size, and results.",
              },
              {
                href: "/blog/parents-guide-competitive-debate-bc",
                title: "A Parent's Guide to Competitive Debate in BC",
                description:
                  "How competitive debate works in British Columbia, written for parents new to the scene.",
              },
              {
                href: "/blog/start-debate-club-school-bc",
                title: "How to Start a Debate Club at Your BC School",
                description:
                  "A step-by-step guide for students who want to launch a debate club at their school.",
              },
              {
                href: "/guide-to-debate-in-canada",
                title: "The Complete Guide to High School Debate in Canada",
                description:
                  "National associations, formats, and the path to nationals - the single best overview for BC families.",
              },
            ].map((post) => (
              <Link
                key={post.href}
                href={post.href}
                className="group block rounded-2xl border border-warm-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-md dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-2 text-lg font-bold text-navy-800 transition-colors group-hover:text-gold-500 dark:text-white dark:group-hover:text-gold-300">
                  {post.title}
                </h3>
                <p className="text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-navy-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">Ready to start your debate journey in Vancouver?</h2>
          <p className="text-lg text-white/75 font-sans leading-relaxed max-w-3xl mx-auto mb-8">
            Explore our{" "}
            <Link href="/classes" className="underline underline-offset-4 hover:text-gold-300 transition-colors">
              class lineup
            </Link>
            , review{" "}
            <Link href="/pricing" className="underline underline-offset-4 hover:text-gold-300 transition-colors">
              pricing
            </Link>
            , meet the{" "}
            <Link href="/team" className="underline underline-offset-4 hover:text-gold-300 transition-colors">
              DSDC team
            </Link>
            , and then{" "}
            <Link href="/book" className="underline underline-offset-4 hover:text-gold-300 transition-colors">
              book a free consultation
            </Link>
            . If you are still comparing options, our{" "}
            <Link
              href="/blog/best-debate-programs-vancouver"
              className="underline underline-offset-4 hover:text-gold-300 transition-colors"
            >
              Vancouver program guide
            </Link>{" "}
            is a helpful next read.
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
              View Our Classes
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
