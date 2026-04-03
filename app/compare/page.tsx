import type { Metadata } from "next";
import CourseComparison from "@/components/CourseComparison";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/compare",
    title: "Compare Debate Classes | DSDC",
    description:
      "Compare DSDC's debate and public speaking class levels to find the right fit for your child.",
    noIndex: true,
  });
}

export default function ComparePage() {
  return <CourseComparison />;
}
