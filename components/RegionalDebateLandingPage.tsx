import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import type { RegionalLandingPageData } from "@/lib/regionalLandingPages";
import { getBlogPostHref } from "@/lib/blogPostPaths";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

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

const debateFormats = [
  {
    title: "CNDF (Canadian National Debate Format)",
    text: "CNDF is the flagship high school format used at Canadian Nationals and at provincial tournaments across the country. Students learn structured case-building, Points of Information, and clean summary speeches that reward logic and organization.",
  },
  {
    title: "British Parliamentary",
    text: "British Parliamentary is the dominant senior-level and university-circuit format. It teaches students to think quickly, compare nuanced arguments, and speak persuasively in four-team debates where strategic ranking matters as much as raw content.",
  },
  {
    title: "World Schools",
    text: "World Schools blends prepared and impromptu debating. It is widely used internationally and is the format DSDC alumni have used to represent Canada at the World Schools Debating Championships.",
  },
  {
    title: "Cross-Examination",
    text: "Cross-Examination emphasizes direct engagement, evidence comparison, and quick strategic responses under pressure. Strong for students who want to become more precise researchers and stronger refuters.",
  },
  {
    title: "Public Speaking and Speech Events",
    text: "For families that want communication training without the pressure of a debate round, DSDC also coaches impromptu, persuasive, and interpretive speaking - a common on-ramp into full debate.",
  },
];

const classLevels = [
  {
    title: "Novice (Grades 4-6)",
    text: "An excellent starting point for younger scholars. Build confidence through the fundamentals of speech execution and foundational debate formats - even shy and introverted children thrive.",
  },
  {
    title: "Junior (Grades 7-9)",
    text: "Build competitive debate skills while accelerating academic growth. Coaches integrate challenging topics like International Relations, Law, Philosophy, and Economics into debate practice.",
  },
  {
    title: "Senior (Grades 10-12)",
    text: "Rigorous practice in British Parliamentary, CNDF, and World Schools formats with advanced lectures on complex topics, delivered 1-2 times per week.",
  },
  {
    title: "Advanced Competitive (Grades 10-12)",
    text: "An elite program led by world-renowned university debaters for students deeply committed to competitive debate. Intensive drills, mock debates, and personalized coaching.",
  },
  {
    title: "Public Speaking (Grades 4-9)",
    text: "Comprehensive training in impromptu, persuasive, interpretive, and parliamentary formats. Designed to prepare students for speech provincials and build classroom confidence.",
  },
  {
    title: "World Scholar's Cup (Grades 4-12)",
    text: "Full WSC preparation with a 100% qualification rate since 2020 - from Regional Rounds to Global Rounds to the Tournament of Champions at Yale.",
  },
];

export default function RegionalDebateLandingPage({ data }: { data: RegionalLandingPageData }) {
  const faqSchema = buildFaqSchema(data.faqItems);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: data.breadcrumbName, path: data.path },
  ]);
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "DSDC - Debate & Speech Development Community",
    description: data.metaDescription,
    url: `https://dsdc.ca${data.path}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: data.geo.addressLocality,
      addressRegion: data.geo.addressRegion,
      addressCountry: "CA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: data.geo.latitude,
      longitude: data.geo.longitude,
    },
    email: "education@dsdc.ca",
    foundingDate: "2017",
    areaServed: data.areas,
  };
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: data.offerings.map((item, index) => ({
      "@type": "Course",
      position: index + 1,
      name: item.title,
      description: item.text,
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
    })),
  };

  return (
    <>
      <JsonLd id={`${data.slug}-faq-schema`} data={faqSchema} />
      <JsonLd id={`${data.slug}-breadcrumb-schema`} data={breadcrumbSchema} />
      <JsonLd id={`${data.slug}-local-business-schema`} data={localBusinessSchema} />
      <JsonLd id={`${data.slug}-course-schema`} data={courseSchema} />

      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 pb-20 pt-32 md:pb-28 md:pt-40">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">{data.heroTitle}</h1>
          <p className="mx-auto mb-6 max-w-3xl text-xl font-sans text-white/90">{data.heroSubtitle}</p>
          <p className="mx-auto mb-10 max-w-3xl text-base leading-relaxed text-white/75 font-sans">
            {data.heroDescription}
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

      <KeyFactsBox itemType="https://schema.org/EducationalOrganization" title="At a Glance" facts={data.keyFacts} />

      {/* Stats proof strip */}
      <section className="bg-gold-400 dark:bg-gold-500/90 py-6 md:py-7">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-5 text-center md:grid-cols-4">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-900">1,000+</div>
              <div className="mt-1 text-xs md:text-sm font-semibold text-navy-900/85">Students coached</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-900">2017</div>
              <div className="mt-1 text-xs md:text-sm font-semibold text-navy-900/85">Founded in Vancouver</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-900">100%</div>
              <div className="mt-1 text-xs md:text-sm font-semibold text-navy-900/85">WSC qualification rate since 2020</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-900">20+</div>
              <div className="mt-1 text-xs md:text-sm font-semibold text-navy-900/85">Coaches from top universities</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            {data.whyTitle}
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            {data.whyParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            {data.offeringsTitle}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {data.offerings.map((item) => (
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
                  {item.linkLabel}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            {data.expectationsTitle}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {data.expectations.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 bg-warm-50 p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{item.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            {data.areasTitle}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {data.areas.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-warm-200 bg-white px-4 py-5 text-center text-sm font-medium text-navy-800 shadow-sm dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100"
              >
                {item}
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-4xl text-center text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            {data.areasParagraph}
          </p>
        </div>
      </section>

      {/* Debate formats taught */}
      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Debate Formats Taught at DSDC
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
            Students choose the format that matches their goals, from provincial and national tournaments to
            university and international competition. Every format is taught by coaches who have competed in it at a
            high level.
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {debateFormats.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-warm-200 bg-warm-50 p-5 dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-2 text-lg font-bold text-navy-800 dark:text-white">{item.title}</h3>
                <p className="leading-relaxed text-charcoal/70 dark:text-navy-300 font-sans">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Class levels */}
      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Our Class Levels
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
            A clear progression from beginner to advanced. Students stay with the same program as they grow, instead
            of restarting every year with a new provider.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {classLevels.map((item) => (
              <article
                key={item.title}
                className="flex flex-col rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{item.title}</h3>
                <p className="flex-1 leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/classes"
                    className="rounded-md border border-warm-300 px-4 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-warm-100 dark:border-navy-600 dark:text-navy-100 dark:hover:bg-navy-700"
                  >
                    View Class Details
                  </Link>
                  <Link
                    href="/book"
                    className="rounded-md bg-gold-400 px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-300"
                  >
                    Book a Consultation
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Tournaments */}
      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            {data.tournamentsTitle}
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base md:text-lg text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
            {data.tournamentsIntro}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.tournaments.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-warm-200 bg-warm-50 px-4 py-3 text-sm font-medium text-navy-800 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100 sm:text-base"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            What Families Say About DSDC
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={`${data.slug}-${item.name}`}
                className="rounded-2xl border border-warm-200 bg-warm-50 p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <p className="text-base leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-5 border-t border-warm-200 pt-4 dark:border-navy-700">
                  <p className="font-bold text-navy-800 dark:text-white">{item.name}</p>
                  <p className="text-sm text-charcoal/55 dark:text-navy-300">{item.role}</p>
                </div>
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
            {data.faqItems.map((item) => (
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

      {data.relatedBlogPosts.length > 0 ? (
        <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-4 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
              Further Reading for {data.breadcrumbName.replace(/^Debate Classes /, "")} Families
            </h2>
            <p className="mx-auto mb-10 max-w-3xl text-center text-base leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
              Hand-picked articles from the DSDC blog to help you learn more before booking a consultation.
            </p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {data.relatedBlogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={getBlogPostHref(post.slug)}
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
      ) : null}

      <section className="bg-navy-800 py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-5 text-3xl font-bold text-white md:text-4xl">{data.ctaTitle}</h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">{data.ctaText}</p>
          <div className="mb-6 flex flex-col justify-center gap-4 sm:flex-row">
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
          <div className="flex flex-wrap justify-center gap-3 text-sm font-medium text-white/80">
            {data.relatedLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="underline underline-offset-4 transition-colors hover:text-gold-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
