import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debate & Public Speaking Classes Online | Novice to Advanced | DSDC",
  description:
    "Explore DSDC's online debate classes from Novice to Advanced Competitive. World Scholar's Cup prep with 100% qualification rate since 2020. Personalized coaching via Zoom.",
  alternates: {
    canonical: "https://dsdc.ca/classes",
  },
  openGraph: {
    title: "Debate & Public Speaking Classes Online | Novice to Advanced | DSDC",
    description:
      "Explore DSDC's online debate classes from Novice to Advanced Competitive. World Scholar's Cup prep with 100% qualification rate since 2020. Personalized coaching via Zoom.",
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
    title: "Debate & Public Speaking Classes Online | Novice to Advanced | DSDC",
    description:
      "Explore DSDC's online debate classes from Novice to Advanced Competitive. World Scholar's Cup prep with 100% qualification rate since 2020. Personalized coaching via Zoom.",
    images: ["https://dsdc.ca/images/photos/wsc-group-2.jpg"],
  },
};

export default function ClassesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
