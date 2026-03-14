import type { Metadata } from "next";
import CourseComparison from "@/components/CourseComparison";

export const metadata: Metadata = {
  title: "Compare Debate Classes | DSDC",
  description:
    "Compare DSDC's debate and public speaking class levels to find the right fit for your child.",
  alternates: {
    canonical: "https://dsdc.ca/compare",
  },
  openGraph: {
    title: "Compare Debate Classes | DSDC",
    description:
      "Compare DSDC's debate and public speaking class levels to find the right fit for your child.",
    url: "https://dsdc.ca/compare",
    siteName: "DSDC",
    type: "website",
  },
};

export default function ComparePage() {
  return <CourseComparison />;
}
