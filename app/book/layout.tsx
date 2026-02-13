import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Free Consultation",
  description:
    "Schedule a free 15-minute consultation with DSDC to find the right debate or public speaking class for your child. Grades 4–12, online via Zoom.",
  openGraph: {
    title: "Book a Free Consultation | DSDC",
    description:
      "Schedule a free consultation to find the right class for your child.",
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
