import type { Metadata } from "next";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/book",
    title: "Book a Free Consultation | DSDC Online Debate Classes",
    description:
      "Schedule a free 15-minute consultation to find the right online debate or public speaking class. All ages and experience levels welcome.",
    images: [
      {
        url: "/images/photos/wsc-group-2.jpg",
        width: 1200,
        height: 630,
        alt: "DSDC Online Debate Classes",
      },
    ],
    noIndex: true,
  });
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
