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

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
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
