import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";
import {
  faqEntries,
  getAllFaqSlugs,
  getFaqEntry,
  type FaqBodySection,
} from "@/lib/faqEntries";

export function generateStaticParams() {
  return getAllFaqSlugs().map((slug) => ({ slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getFaqEntry(slug);
  if (!entry) {
    return buildLocalizedPageMetadata({
      path: `/faq/${slug}`,
      title: "FAQ | DSDC",
      description: "DSDC frequently asked questions.",
    });
  }
  return buildLocalizedPageMetadata({
    path: `/faq/${entry.slug}`,
    title: entry.metaTitle,
    description: entry.metaDescription,
  });
}

// Render a paragraph body, converting basic [label](url) markdown links to Next Link elements.
function renderParagraph(content: string, key: string | number) {
  const parts: Array<string | { label: string; href: string }> = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push({ label: match[1], href: match[2] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return (
    <p key={key} className="text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <span key={i}>{part}</span>
        ) : (
          <Link
            key={i}
            href={part.href}
            className="underline underline-offset-4 text-navy-800 dark:text-gold-300 hover:text-gold-500 dark:hover:text-gold-200 transition-colors"
          >
            {part.label}
          </Link>
        ),
      )}
    </p>
  );
}

function renderBody(body: FaqBodySection[]) {
  return body.map((section, index) => {
    if (section.type === "heading") {
      return (
        <h2
          key={index}
          className="mt-10 mb-4 text-2xl md:text-3xl font-bold text-navy-800 dark:text-white font-serif"
        >
          {section.content}
        </h2>
      );
    }
    if (section.type === "list") {
      return (
        <ul
          key={index}
          className="my-4 list-disc space-y-2 pl-6 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans marker:text-gold-500"
        >
          {section.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }
    return renderParagraph(section.content, index);
  });
}

export default async function FaqSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getFaqEntry(slug);
  if (!entry) {
    notFound();
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "FAQ", path: "/faq" },
    { name: entry.question, path: `/faq/${entry.slug}` },
  ]);

  // Per-page FAQPage schema with just this one question, so Google can rank
  // this specific URL for its own long-tail query.
  const singleFaqSchema = buildFaqSchema([
    { question: entry.question, answer: entry.answer },
  ]);

  const relatedEntries = entry.relatedFaqSlugs
    .map((relatedSlug) => faqEntries.find((e) => e.slug === relatedSlug))
    .filter((e): e is (typeof faqEntries)[number] => Boolean(e));

  return (
    <>
      <JsonLd id={`faq-${entry.slug}-schema`} data={singleFaqSchema} />
      <JsonLd id={`faq-${entry.slug}-breadcrumb`} data={breadcrumbSchema} />

      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 pt-32 pb-16 md:pt-40 md:pb-20">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 text-sm text-white/70 font-sans" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
          </nav>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {entry.question}
          </h1>
          <p className="text-lg md:text-xl text-white/85 font-sans leading-relaxed max-w-3xl">
            {entry.answer}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <article className="space-y-5">{renderBody(entry.body)}</article>

          <div className="mt-12 flex flex-wrap gap-3 border-t border-warm-200 pt-8 dark:border-navy-700">
            {entry.relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg bg-navy-800 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-700 dark:bg-gold-300 dark:text-navy-950 dark:hover:bg-gold-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {relatedEntries.length > 0 ? (
        <section className="py-16 md:py-20 bg-warm-100 dark:bg-navy-900/50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-center text-2xl md:text-3xl font-bold text-navy-800 dark:text-white">
              Related Questions
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {relatedEntries.map((related) => (
                <Link
                  key={related.slug}
                  href={`/faq/${related.slug}`}
                  className="group block rounded-2xl border border-warm-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-md dark:border-navy-700 dark:bg-navy-800"
                >
                  <h3 className="mb-3 text-base font-bold text-navy-800 transition-colors group-hover:text-gold-500 dark:text-white dark:group-hover:text-gold-300">
                    {related.question}
                  </h3>
                  <p className="text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans line-clamp-3">
                    {related.answer}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 text-sm font-semibold text-navy-800 underline underline-offset-4 hover:text-gold-500 dark:text-gold-300"
              >
                Browse every DSDC FAQ →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-navy-800 py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-5 text-2xl md:text-3xl font-bold text-white">
            Still have questions? We&apos;re happy to help.
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-white/80 font-sans leading-relaxed">
            Book a free 15-minute consultation and we&apos;ll answer everything specific to your child&apos;s grade,
            goals, and schedule.
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
    </>
  );
}
