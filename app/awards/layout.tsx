import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Awards & Tournament Results | DSDC",
  description:
    "See where DSDC students compete and win - Canadian Nationals, BC Provincials, World Scholar's Cup at Yale, Stanford, Princeton, Oxford, and more.",
  alternates: {
    canonical: "https://dsdc.ca/awards",
  },
  openGraph: {
    title: "Student Awards & Tournament Results | DSDC",
    description:
      "See where DSDC students compete and win - Canadian Nationals, BC Provincials, World Scholar's Cup at Yale, Stanford, Princeton, Oxford, and more.",
    url: "https://dsdc.ca/awards",
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
    title: "Student Awards & Tournament Results | DSDC",
    description:
      "See where DSDC students compete and win - Canadian Nationals, BC Provincials, World Scholar's Cup at Yale, Stanford, Princeton, Oxford, and more.",
    images: ["https://dsdc.ca/images/photos/wsc-group-2.jpg"],
  },
};

export default function AwardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
