import type { Metadata } from "next";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/classes",
    title: "Online Debate Classes for Kids & Teens Across Canada | DSDC",
    description:
      "Browse DSDC's online debate and public speaking classes for Grades 4-12. Live Zoom sessions with small class sizes of 8-12 students. Available Canada-wide - Vancouver, Toronto, Brampton, Mississauga, and beyond. From $30/hr.",
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
