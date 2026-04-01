import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Debate Classes for Kids | DSDC",
  description:
    "Compare DSDC online debate classes for kids, debate training, and public speaking courses with clear levels, schedules, and coaching support.",
  alternates: {
    canonical: "https://dsdc.ca/classes",
  },
  openGraph: {
    title: "Online Debate Classes for Kids | DSDC",
    description:
      "Compare DSDC online debate classes for kids, debate training, and public speaking courses with clear levels, schedules, and coaching support.",
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
    title: "Online Debate Classes for Kids | DSDC",
    description:
      "Compare DSDC online debate classes for kids, debate training, and public speaking courses with clear levels, schedules, and coaching support.",
    images: ["https://dsdc.ca/images/photos/wsc-group-2.jpg"],
  },
};

export default function ClassesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
