import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Awards",
  description:
    "DSDC student achievements in debate, public speaking, and the World Scholar's Cup. See our students' awards at Canadian Nationals, US Nationals, Stanford, Princeton, and more.",
  openGraph: {
    title: "Student Awards | DSDC",
    description: "DSDC student achievements at top tournaments worldwide.",
  },
};

export default function AwardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
