import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Free Consultation | DSDC Online Debate Classes",
  description:
    "Schedule a free 15-minute consultation to find the right online debate or public speaking class. All ages and experience levels welcome.",
  alternates: {
    canonical: "https://dsdc.ca/book",
  },
  openGraph: {
    title: "Book a Free Consultation | DSDC Online Debate Classes",
    description:
      "Schedule a free 15-minute consultation to find the right online debate or public speaking class. All ages and experience levels welcome.",
    url: "https://dsdc.ca/book",
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
    title: "Book a Free Consultation | DSDC Online Debate Classes",
    description:
      "Schedule a free 15-minute consultation to find the right online debate or public speaking class. All ages and experience levels welcome.",
    images: ["https://dsdc.ca/images/photos/wsc-group-2.jpg"],
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
