import { createClient } from "@sanity/client";
import { hasSanityConfig, sanityEnv } from "./env";

export function getSanityClient() {
  if (!hasSanityConfig()) {
    throw new Error("Sanity env vars are missing.");
  }

  return createClient({
    projectId: sanityEnv.projectId,
    dataset: sanityEnv.dataset,
    apiVersion: sanityEnv.apiVersion,
    useCdn: false,
    token: sanityEnv.token || undefined,
    perspective: "published",
  });
}
