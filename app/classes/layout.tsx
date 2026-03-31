import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DSDC | Online Debate & Public Speaking Classes",
  description:
    "Explore DSDC online debate classes for kids, public speaking courses, and competitive training. Compare levels, schedules, and coaching online.",
  alternates: {
    canonical: "https://dsdc.ca/classes",
  },
  openGraph: {
    title: "DSDC | Online Debate & Public Speaking Classes",
    description:
      "Explore DSDC online debate classes for kids, public speaking courses, and competitive training. Compare levels, schedules, and coaching online.",
    url: "https://dsdc.ca/classes",
    siteName: "DSDC",
    type: "website",
    images: [
      {
        url: "https://dsdc.ca/images/photos/wsc-group-2.jpg",
        width: 1200,
        height: 630,
        alt: "DSDC Online Debate Classes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DSDC | Online Debate & Public Speaking Classes",
    description:
      "Explore DSDC online debate classes for kids, public speaking courses, and competitive training. Compare levels, schedules, and coaching online.",
    images: ["https://dsdc.ca/images/photos/wsc-group-2.jpg"],
  },
};

export default function ClassesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
