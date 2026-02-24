import { createClient } from "@sanity/client";
import { hasSanityConfig, sanityEnv } from "./env";

const studioUrl =
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ||
  (typeof window !== "undefined" ? `${window.location.origin}/studio` : "/studio");

export function getSanityClient(opts?: { draft?: boolean; stega?: boolean }) {
  if (!hasSanityConfig()) {
    throw new Error("Sanity env vars are missing.");
  }

  return createClient({
    projectId: sanityEnv.projectId,
    dataset: sanityEnv.dataset,
    apiVersion: sanityEnv.apiVersion,
    useCdn: !opts?.draft,
    token: sanityEnv.token || undefined,
    perspective: opts?.draft ? "previewDrafts" : "published",
    stega: opts?.stega
      ? { enabled: true, studioUrl, filter: () => true }
      : { enabled: false },
  });
}
