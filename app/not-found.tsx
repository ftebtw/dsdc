import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found | DSDC",
  description:
    "We couldn't find the page you were looking for. Browse DSDC's online debate and public speaking classes, or return to the homepage.",
  robots: {
    index: false,
    follow: true,
  },
};

const helpfulLinks: Array<{ label: string; href: string; description: string }> = [
  {
    label: "Classes",
    href: "/classes",
    description: "Browse our online debate and public speaking programs for Grades 4-12.",
  },
  {
    label: "Pricing",
    href: "/pricing",
    description: "See tuition, class sizes, and what's included in each DSDC program.",
  },
  {
    label: "Blog",
    href: "/blog",
    description: "Read coaching advice, competition guides, and tournament recaps.",
  },
  {
    label: "Book a Free Consultation",
    href: "/book",
    description: "Talk to a DSDC coach about the right class for your child.",
  },
];

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 px-6 py-24 text-white"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">Error 404</p>
        <h1 className="mt-4 font-serif text-4xl font-bold md:text-5xl">
          We couldn&apos;t find that page.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-navy-100">
          The page you&apos;re looking for may have moved, been renamed, or never existed. Try one of the links
          below, or head back to the DSDC homepage.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-block rounded-lg bg-gold-300 px-8 py-3.5 font-bold text-navy-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-200 hover:shadow-xl"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="inline-block rounded-lg border border-white/40 px-8 py-3.5 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
          >
            Contact Us
          </Link>
        </div>

        <section className="mt-14 grid gap-4 text-left sm:grid-cols-2">
          {helpfulLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-white/15 bg-white/5 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-300/60 hover:bg-white/10"
            >
              <p className="font-serif text-lg font-bold text-white group-hover:text-gold-200">
                {link.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-navy-100">{link.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
