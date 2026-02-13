import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet DSDC's award-winning coaching team — decorated debaters from top universities including the University of Sydney, Duke, UBC, and Queen's. World Championship competitors coaching your child.",
  openGraph: {
    title: "Our Team | DSDC",
    description:
      "Meet DSDC's award-winning coaching team. World Championship competitors dedicated to coaching your child.",
  },
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
