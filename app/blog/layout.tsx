import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Expert insights on debate coaching, public speaking, study techniques, and competitive debate formats. Tips for parents and students from DSDC's award-winning coaches.",
  openGraph: {
    title: "Blog | DSDC",
    description:
      "Expert insights on debate coaching, public speaking, study techniques, and competitive debate formats.",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
