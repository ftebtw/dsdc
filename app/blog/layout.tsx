import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debate & Public Speaking Tips | Blog | DSDC",
  description:
    "Expert insights on debate strategy, public speaking, tournament preparation, and education from DSDC's award-winning coaching team.",
  alternates: {
    canonical: "https://dsdc.ca/blog",
  },
  openGraph: {
    title: "Debate & Public Speaking Tips | Blog | DSDC",
    description:
      "Expert insights on debate strategy, public speaking, tournament preparation, and education from DSDC's award-winning coaching team.",
    url: "https://dsdc.ca/blog",
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
    title: "Debate & Public Speaking Tips | Blog | DSDC",
    description:
      "Expert insights on debate strategy, public speaking, tournament preparation, and education from DSDC's award-winning coaching team.",
    images: ["https://dsdc.ca/images/photos/wsc-group-2.jpg"],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
