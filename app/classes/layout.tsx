import type { Metadata } from "next";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/classes",
    title: "Online Debate Classes for Kids | DSDC",
    description:
      "Compare DSDC online debate classes for kids, debate training, and public speaking courses with clear levels, schedules, and coaching support.",
    images: [
      {
        url: "/images/photos/wsc-group-2.jpg",
        width: 1200,
        height: 630,
        alt: "DSDC Online Debate Classes",
      },
    ],
  });
}

export default function ClassesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
