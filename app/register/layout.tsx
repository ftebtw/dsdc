import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: "/register",
    title: "Register for DSDC Classes",
    description:
      "Create your DSDC registration profile to enroll in debate and public speaking classes.",
    noIndex: true,
  });
}

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
