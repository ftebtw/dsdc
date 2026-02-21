import { createDataAttribute } from "next-sanity";
import { sanityEnv } from "./env";

const studioUrl =
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ||
  (typeof window !== "undefined" ? `${window.location.origin}/studio` : "/studio");

function getDataAttr(documentId: string, path: string): string | undefined {
  if (!sanityEnv.projectId) return undefined;
  const attr = createDataAttribute({
    id: documentId,
    type: documentId,
    path,
    projectId: sanityEnv.projectId,
    dataset: sanityEnv.dataset,
    baseUrl: studioUrl,
  });
  return (attr as unknown as { toString(): string }).toString() as string;
}

/** data-sanity value for Homepage Content — use on homepage sections so "Documents on this page" detects it */
export function homePageDataSanity(path = "hero"): string | undefined {
  return getDataAttr("homePageContent", path);
}

/** data-sanity value for Team Page Content — use on team page so "Documents on this page" detects it */
export function teamPageDataSanity(path = "teamPage"): string | undefined {
  return getDataAttr("teamPageContent", path);
}
