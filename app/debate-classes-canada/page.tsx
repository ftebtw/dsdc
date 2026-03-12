import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Debate Classes in Canada | Online Programs for Grades 4-12 | DSDC",
  description:
    "DSDC offers online debate and public speaking classes for students across Canada in Grades 4-12. Learn with award-winning coaches from anywhere.",
  alternates: {
    canonical: "https://dsdc.ca/debate-classes-canada",
  },
  openGraph: {
    title: "Debate Classes in Canada | Online Programs for Grades 4-12 | DSDC",
    description:
      "DSDC offers online debate and public speaking classes for students across Canada in Grades 4-12. Learn with award-winning coaches from anywhere.",
    url: "https://dsdc.ca/debate-classes-canada",
    siteName: "DSDC",
    type: "website",
    images: [{ url: "/images/photos/wsc-students-2.jpg" }],
  },
};

export default function DebateClassesCanadaPage() {
  return (
    <>
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Debate Classes in Canada</h1>
          <p className="text-xl text-white/90 font-sans mb-8 max-w-3xl mx-auto">
            Online coaching for students across Canada in Grades 4-12.
          </p>
          <p className="text-sm sm:text-base text-white/85 font-sans">
            View all{" "}
            <Link href="/online-debate-classes" className="underline underline-offset-4 hover:text-gold-300 transition-colors">
              online debate classes
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
