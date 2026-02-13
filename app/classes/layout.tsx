import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Classes",
  description:
    "Online debate and public speaking classes for Grades 4–12. Novice to Advanced Competitive debate, World Scholar's Cup prep (100% qualification rate), and public speaking training.",
  openGraph: {
    title: "Our Classes | DSDC",
    description:
      "Online debate and public speaking classes for Grades 4–12. From beginner to elite competitive programs.",
  },
};

export default function ClassesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
