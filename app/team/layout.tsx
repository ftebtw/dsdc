import type { Metadata } from "next";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/team",
    title: "Our Coaching Team | Award-Winning Debate Coaches | DSDC",
    description:
      "Meet DSDC's award-winning debate and public speaking coaches from top universities worldwide. Dedicated to personalized coaching for every student.",
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

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
