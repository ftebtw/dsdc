import type { Metadata } from "next";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/awards",
    title: "Student Awards & Tournament Results | DSDC",
    description:
      "See where DSDC students compete and win - Canadian Nationals, BC Provincials, World Scholar's Cup at Yale, Stanford, Princeton, Oxford, and more.",
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

export default function AwardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
