import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Coaching Team | Award-Winning Debate Coaches | DSDC",
  description:
    "Meet DSDC's award-winning debate and public speaking coaches from top universities worldwide. Dedicated to personalized coaching for every student.",
  alternates: {
    canonical: "https://dsdc.ca/team",
  },
  openGraph: {
    title: "Our Coaching Team | Award-Winning Debate Coaches | DSDC",
    description:
      "Meet DSDC's award-winning debate and public speaking coaches from top universities worldwide. Dedicated to personalized coaching for every student.",
    url: "https://dsdc.ca/team",
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
    title: "Our Coaching Team | Award-Winning Debate Coaches | DSDC",
    description:
      "Meet DSDC's award-winning debate and public speaking coaches from top universities worldwide. Dedicated to personalized coaching for every student.",
    images: ["https://dsdc.ca/images/photos/wsc-group-2.jpg"],
  },
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
