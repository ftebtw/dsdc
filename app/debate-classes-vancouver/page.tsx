import type { Metadata } from "next";
import Link from "next/link";

const faqItems = [
  {
    question: "Where is DSDC located?",
    answer:
      "DSDC was founded in Vancouver, BC in 2017. All our classes are online via Zoom, so students anywhere in the Lower Mainland (and beyond) can participate without commuting.",
  },
  {
    question: "Do you prepare students for BC tournaments?",
    answer:
      "Yes. We coach students for BC Provincial Championships, SFU and UBC tournaments, and regional competitions throughout British Columbia, as well as Canadian Nationals and international events.",
  },
  {
    question: "How are you different from other Vancouver debate academies?",
    answer:
      "We deliver the same expert coaching as in-person academies - but online, more affordable, and more convenient. Our coaches include Canadian National Team members and top university debaters. Group classes are $30-50/hr compared to $60-100+/hr at many in-person programs.",
  },
  {
    question: "Can my child try a class first?",
    answer:
      "Yes. Book a free 15-minute consultation and we'll recommend the right class for your child.",
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
  email: "education.dsdc@gmail.com",
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

export const metadata: Metadata = {
  title: "Debate Classes in Vancouver & the Lower Mainland | Online | DSDC",
  description:
    "Vancouver-founded online debate and public speaking classes for kids and teens. Serving Burnaby, Surrey, Richmond, Coquitlam, North Vancouver, and all of BC. Expert coaching from $30/hr. Book a free consultation.",
  alternates: {
    canonical: "https://dsdc.ca/debate-classes-vancouver",
  },
  openGraph: {
    title: "Debate Classes in Vancouver & the Lower Mainland | Online | DSDC",
    description:
      "Vancouver-founded online debate and public speaking classes for kids and teens. Serving Burnaby, Surrey, Richmond, Coquitlam, North Vancouver, and all of BC. Expert coaching from $30/hr. Book a free consultation.",
    url: "https://dsdc.ca/debate-classes-vancouver",
    siteName: "DSDC",
    type: "website",
    images: [{ url: "/images/photos/wsc-group-2.jpg" }],
  },
};

export default function DebateClassesVancouverPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
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
            Debate & Public Speaking Classes in Vancouver
          </h1>
          <p className="text-xl text-white/90 font-sans mb-10 max-w-3xl mx-auto">
            Founded in Vancouver, BC. Serving students across the Lower Mainland and beyond through live online
            coaching.
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
              No commute. No traffic. Just world-class debate coaching from Vancouver's own. New to debate? Explore
              our{" "}
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
            Debate Formats for BC Competitions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: "CNDF (Canadian National Debate Format)",
                text: "The official format for Canadian Nationals. We prepare Vancouver-area students from regionals through to the national stage.",
              },
              {
                title: "British Parliamentary",
                text: "The dominant format at BC Provincials and university-level tournaments at UBC and SFU.",
              },
              {
                title: "World Schools",
                text: "Used for international competition. DSDC alumni have represented Canada at the World Schools Debating Championships.",
              },
              {
                title: "Public Speaking",
                text: "Impromptu, persuasive, and interpretive speaking - preparing students for BC Speech Provincials.",
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
              },
              {
                title: "Junior (Grades 7-9)",
                text: "Build competitive debate skills while accelerating academic growth. Coaches integrate challenging topics like International Relations, Law, Philosophy, and Economics into debate practice. Weekends, 2 hours/week.",
              },
              {
                title: "Senior (Grades 10-12)",
                text: "Rigorous practice in British Parliamentary, CNDF, and World Schools formats with advanced lectures on complex topics. 1-2x per week, 2 hours.",
              },
              {
                title: "Advanced Competitive (Grades 10-12)",
                text: "An elite program led by world-renowned university debaters for students deeply committed to competitive debate. Intensive drills, mock debates, and personalized coaching. 2x per week, 2 hours.",
              },
              {
                title: "Public Speaking (Grades 4-9)",
                text: "Comprehensive training in impromptu, persuasive, interpretive, and parliamentary formats. Designed to prepare students for BC speech provincials.",
              },
              {
                title: "World Scholar's Cup (Grades 4-12)",
                text: "Full WSC preparation with a 100% qualification rate since 2020 - from regionals to the Tournament of Champions at Yale.",
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
                    Learn More
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
        </div>
      </section>

      <section className="py-16 md:py-20 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-8">
            Serving the Entire Lower Mainland
          </h2>
          <p className="text-lg text-charcoal/80 dark:text-navy-200 font-sans leading-relaxed text-center">
            DSDC serves students throughout the Greater Vancouver area and beyond. Whether you're in Vancouver,
            Burnaby, Surrey, Richmond, Coquitlam, Port Coquitlam, New Westminster, North Vancouver, West Vancouver,
            Langley, Delta, White Rock, Abbotsford, Maple Ridge, or anywhere else in British Columbia - our online
            classes mean geography is never a barrier. We also serve students across{" "}
            <Link
              href="/debate-classes-canada"
              className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors"
            >
              Canada
            </Link>{" "}
            and internationally.
          </p>
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

      <section className="py-16 md:py-20 bg-navy-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">Ready to start your debate journey in Vancouver?</h2>
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
