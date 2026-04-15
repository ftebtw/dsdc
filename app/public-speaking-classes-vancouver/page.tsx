import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import PublicSpeakingVancouverPageZh from "@/components/PublicSpeakingVancouverPageZh";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { getRequestLocale } from "@/lib/requestLocale";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "Where in Vancouver does DSDC teach public speaking?",
    answer:
      "DSDC is based in Vancouver, BC but all public speaking classes are delivered live over Zoom. That means students from Vancouver proper, Burnaby, Richmond, Surrey, Coquitlam, North Vancouver, West Vancouver, and the rest of the Lower Mainland can join the same class without commuting.",
  },
  {
    question: "What age group is this class for?",
    answer:
      "DSDC teaches public speaking to students in Grades 1 to 12, split into age-appropriate cohorts. Younger elementary students, middle schoolers, and high schoolers each have their own group so coaching matches grade level.",
  },
  {
    question: "Is this a public speaking class or a debate class?",
    answer:
      "This is a public speaking class. Students learn how to speak clearly, structure a message, handle impromptu prompts, and present with confidence. Families who want formal debate should look at our online debate classes page, which builds on public speaking fundamentals.",
  },
  {
    question: "How is DSDC different from other Vancouver public speaking classes?",
    answer:
      "DSDC is an online program run by coaches from the Canadian National Debate Team and top universities, not a drop-in enrichment class. Every session is live, small (8-12 students), and includes personalized written feedback after class. Group classes are priced at $30-50 CAD per hour, which is noticeably lower than most in-person Vancouver programs.",
  },
  {
    question: "Can my child try a class first?",
    answer:
      "Yes. Book a free 15-minute consultation and we will recommend the right class for your child's age, confidence level, and goals. Trial classes may be available depending on the cohort.",
  },
  {
    question: "Do you serve families outside Vancouver proper?",
    answer:
      "Yes. We work with students across Burnaby, Richmond, Surrey, Coquitlam, North Vancouver, West Vancouver, New Westminster, Langley, Delta, White Rock, and the rest of BC.",
  },
  {
    question: "How much does a public speaking class cost?",
    answer:
      "DSDC group public speaking classes are priced at $30-50 CAD per hour. See our pricing page for transparent rates before booking.",
  },
];

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Public Speaking Classes Vancouver", path: "/public-speaking-classes-vancouver" },
]);

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "DSDC - Public Speaking Classes Vancouver",
  description:
    "Online public speaking classes for students across Vancouver, Burnaby, Richmond, Surrey, and the Lower Mainland, delivered live by DSDC.",
  url: "https://dsdc.ca/public-speaking-classes-vancouver",
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
    "Richmond",
    "Surrey",
    "Coquitlam",
    "North Vancouver",
    "West Vancouver",
    "New Westminster",
    "Langley",
    "Delta",
    "White Rock",
  ],
};

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Public Speaking Classes Vancouver",
  description:
    "Live online public speaking classes for students across Vancouver and the Lower Mainland. Grades 1 to 12 welcome.",
  provider: {
    "@type": "EducationalOrganization",
    name: "DSDC",
    url: "https://dsdc.ca",
  },
  url: "https://dsdc.ca/public-speaking-classes-vancouver",
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
    audienceType: "Students in Grades 1-12",
  },
};

const valueProps = [
  {
    title: "Live Zoom Classes",
    text: "Every class is real-time and interactive. No commute, no drop-off, same live coaching as an in-person studio.",
  },
  {
    title: "Small Group Sizes",
    text: "Classes are capped around 8 to 12 students so every child speaks every week and gets direct coach attention.",
  },
  {
    title: "Experienced Coaches",
    text: "DSDC coaches come from Canada's National Debate Team, UBC, SFU, and international competition circuits.",
  },
];

const whatKidsLearn = [
  {
    title: "Confidence and Presence",
    text: "Posture, vocal projection, pacing, and the ability to look comfortable even when nervous. Confidence is a trained skill, not a personality trait.",
  },
  {
    title: "Speech Structure",
    text: "How to organize an idea with a clear opening, middle, and close. How to support opinions with examples and evidence.",
  },
  {
    title: "Impromptu Speaking",
    text: "Fast prompts, short speaking rounds, and calm thinking under time pressure. The core skill kids need for class discussions and interviews.",
  },
  {
    title: "Audience Awareness",
    text: "How to read a room, adjust tone and wording, and connect with whoever is listening - peers, teachers, parents, or judges.",
  },
];

const vancouverAreas = [
  "Downtown Vancouver",
  "Kitsilano and West Side",
  "Burnaby and East Vancouver",
  "Richmond",
  "Surrey and White Rock",
  "Coquitlam and Port Moody",
  "North and West Vancouver",
  "Langley and Delta",
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildLocalizedPageMetadata({
    path: "/public-speaking-classes-vancouver",
    title:
      locale === "zh"
        ? "温哥华公共演讲课 | 在线小班直播 | DSDC"
        : "Public Speaking Classes Vancouver | Online for Kids | DSDC",
    description:
      locale === "zh"
        ? "面向温哥华及 Lower Mainland 1-12 年级孩子的在线公共演讲课。小班教学、资深教练、Zoom 直播。DSDC 服务温哥华、Burnaby、Richmond、Surrey 及 BC 省其他地区。"
        : "Live online public speaking classes for kids in Vancouver and the Lower Mainland. Small groups, expert coaches, Grades 1 to 12 welcome. DSDC serves Vancouver, Burnaby, Richmond, Surrey, and the rest of BC from live Zoom classrooms.",
    keywords: [
      "public speaking classes Vancouver",
      "public speaking for kids Vancouver",
      "Vancouver public speaking course",
      "kids public speaking BC",
      "online public speaking Vancouver",
    ],
    images: [{ url: "/images/photos/dsdc-class-photo.jpg" }],
    hasChineseVersion: true,
  });
}

export default async function PublicSpeakingClassesVancouverPage() {
  const locale = await getRequestLocale();

  if (locale === "zh") {
    return <PublicSpeakingVancouverPageZh />;
  }

  return (
    <>
      <JsonLd id="ps-vancouver-course-schema" data={courseSchema} />
      <JsonLd id="ps-vancouver-faq-schema" data={faqSchema} />
      <JsonLd id="ps-vancouver-local-business-schema" data={localBusinessSchema} />
      <JsonLd id="ps-vancouver-breadcrumb-schema" data={breadcrumbSchema} />

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
            Public Speaking Classes Vancouver Families Join Online
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            Live online public speaking classes for kids in Grades 1 to 12, delivered from Vancouver to
            the whole Lower Mainland over Zoom. Small groups, experienced coaches, and a confidence-first
            curriculum.
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
              See All Classes
            </Link>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/EducationalOrganization"
        title="At a Glance"
        facts={[
          { label: "Based in", value: "Vancouver, BC" },
          { label: "Format", value: "Live online via Zoom" },
          { label: "Grades", value: "1 through 12" },
          { label: "Class size", value: "Usually 8-12 students" },
          { label: "Coaches", value: "Canadian National Debate Team and top BC universities" },
          { label: "Service area", value: "Vancouver, Burnaby, Richmond, Surrey, Coquitlam, North Vancouver, and the rest of BC" },
          { label: "Pricing", value: "$30-50 CAD/hr group rate" },
          { label: "Next step", value: "Free 15-minute consultation" },
        ]}
      />

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Why Vancouver Parents Choose DSDC Public Speaking Classes
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base md:text-lg leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
            Three things matter most to Lower Mainland families comparing public speaking programs. Here
            is how DSDC handles each.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {valueProps.map((prop) => (
              <article
                key={prop.title}
                className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{prop.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{prop.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Public Speaking for Vancouver Students
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              Vancouver families have a lot of enrichment options. What sets DSDC apart is that every
              session is taught live by a coach who has actually competed at a high level in public
              speaking and debate. That experience changes the coaching dramatically - students get
              specific feedback about posture, vocal projection, pacing, and structure, not general
              encouragement.
            </p>
            <p>
              Because classes are online, a student in Kitsilano learns alongside peers in Burnaby,
              Richmond, North Vancouver, and Surrey. The Lower Mainland is spread out enough that in-person
              enrichment often means long commutes or dropping kids off during rush hour. DSDC removes
              that friction so families can stay consistent across a full term - and consistency is what
              actually drives progress.
            </p>
            <p>
              Parents also appreciate that DSDC public speaking classes are age-appropriate. Elementary
              students don&apos;t get pushed into high-pressure performance. High school students don&apos;t
              get stuck on beginner exercises. Every child is placed into a group that matches their grade
              and confidence level.
            </p>
            <p>
              If you want to compare public speaking with DSDC&apos;s other programs, the{" "}
              <Link href="/public-speaking-classes-for-kids" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                main public speaking page
              </Link>{" "}
              covers curriculum details, and our{" "}
              <Link href="/debate-classes-vancouver" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                Vancouver debate classes page
              </Link>{" "}
              covers the formal debate pathway for students who are ready for argumentation.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            What Students Learn in DSDC Public Speaking Classes
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {whatKidsLearn.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{item.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Where Lower Mainland Families Join From
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {vancouverAreas.map((area) => (
              <div
                key={area}
                className="rounded-2xl border border-warm-200 bg-warm-50 px-4 py-5 text-center text-sm font-medium text-navy-800 shadow-sm dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100"
              >
                {area}
              </div>
            ))}
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
            Ready to book a Vancouver public speaking class?
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">
            Free 15-minute consultation. We will recommend the right cohort for your child&apos;s grade,
            confidence level, and goals.
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
