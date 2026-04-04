import type { Metadata } from "next";
import RegionalDebateLandingPage from "@/components/RegionalDebateLandingPage";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { getRegionalLandingPageData } from "@/lib/regionalLandingPages";

const pageData = getRegionalLandingPageData("alberta");

export async function generateMetadata(): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    path: pageData.path,
    title: pageData.metaTitle,
    description: pageData.metaDescription,
    images: [{ url: "/images/photos/wsc-group-2.jpg" }],
    hasChineseVersion: false,
  });
}

export default function DebateClassesAlbertaPage() {
  return <RegionalDebateLandingPage data={pageData} />;
}
