import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema } from "@/lib/structuredData";
import {
  glossaryEntries,
  getGlossaryCategories,
  type GlossaryCategory,
} from "@/lib/glossaryEntries";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/glossary",
    title: "Debate Glossary | 40+ Terms Explained | DSDC",
    description:
      "The complete DSDC debate glossary - 40+ debate terms explained in plain English for students, parents, and new debaters. Covers speech structure, case construction, arguments, strategy, and more.",
  });
}

const CATEGORY_DESCRIPTIONS: Record<GlossaryCategory, string> = {
  "Speech Structure": "How debate speeches are organized, from constructive speeches to reply and whip speeches.",
  "Case Construction": "How debaters build their arguments, including cases, contentions, frameworks, and burdens.",
  "Arguments & Logic": "The building blocks of real arguments - warrants, impacts, links, turns, and more.",
  "Strategy & Judging": "Advanced concepts that shape how rounds are won, from weighing to kritiks.",
  "Format Roles": "Who plays what role in parliamentary and American debate formats.",
  "Round Mechanics": "The procedural parts of a debate round - motions, POIs, prep time, flowing, ballots.",
};

export default function GlossaryIndexPage() {
  const categories = getGlossaryCategories();
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Debate Glossary", path: "/glossary" },
  ]);

  // Emit a DefinedTermSet at the index level so Google understands this is a
  // structured glossary containing every term below.
  const definedTermSetSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "DSDC Debate Glossary",
    description:
      "A complete glossary of debate terminology used across CNDF, British Parliamentary, World Schools, Cross-Examination, and Junior WSDC formats.",
    url: "https://dsdc.ca/glossary",
    hasDefinedTerm: glossaryEntries.map((entry) => ({
      "@type": "DefinedTerm",
      name: entry.term,
      description: entry.shortDefinition,
      url: `https://dsdc.ca/glossary/${entry.slug}`,
    })),
  };

  return (
    <>
      <JsonLd id="glossary-defined-term-set" data={definedTermSetSchema} />
      <JsonLd id="glossary-breadcrumb-schema" data={breadcrumbSchema} />

      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 pb-16 pt-32 md:pb-20 md:pt-40">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-5 text-4xl font-bold text-white md:text-5xl lg:text-6xl font-serif">
            The DSDC Debate Glossary
          </h1>
          <p className="mx-auto max-w-3xl text-lg font-sans leading-relaxed text-white/85">
            {glossaryEntries.length}+ debate terms explained in plain English, organized by category. From
            constructive speeches to kritiks, from Points of Information to weighing mechanisms - every word your
            child will hear in a debate round, defined by DSDC coaches.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-warm-100 dark:bg-navy-900/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <a
                key={category}
                href={`#${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="rounded-full border border-warm-300 bg-white px-4 py-2 text-sm font-semibold text-navy-800 transition-colors hover:border-gold-400 hover:text-gold-600 dark:border-navy-600 dark:bg-navy-800 dark:text-navy-100 dark:hover:text-gold-300"
              >
                {category}
              </a>
            ))}
          </div>
        </div>
      </section>

      {categories.map((category) => {
        const termsInCategory = glossaryEntries.filter((entry) => entry.category === category);
        const anchorId = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return (
          <section
            key={category}
            id={anchorId}
            className="py-16 md:py-20 odd:bg-white even:bg-warm-100 dark:odd:bg-navy-900/30 dark:even:bg-navy-900/50"
          >
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 text-center">
                <h2 className="mb-3 text-3xl md:text-4xl font-bold text-navy-800 dark:text-white font-serif">
                  {category}
                </h2>
                <p className="mx-auto max-w-2xl text-base text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
                  {CATEGORY_DESCRIPTIONS[category]}
                </p>
              </div>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {termsInCategory.map((entry) => (
                  <li key={entry.slug}>
                    <Link
                      href={`/glossary/${entry.slug}`}
                      className="group block h-full rounded-2xl border border-warm-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-md dark:border-navy-700 dark:bg-navy-800"
                    >
                      <h3 className="mb-2 text-lg font-bold text-navy-800 dark:text-white font-serif transition-colors group-hover:text-gold-500 dark:group-hover:text-gold-300">
                        {entry.term}
                      </h3>
                      <p className="text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans line-clamp-3">
                        {entry.shortDefinition}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      <section className="bg-navy-800 py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-5 text-2xl md:text-3xl font-bold text-white">
            Know the words. Now learn to use them.
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-white/80 font-sans leading-relaxed">
            Every concept in this glossary is taught live at DSDC by coaches from the Canadian National Debate Team
            and top Canadian universities. Book a free consultation to find the right class for your child.
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
