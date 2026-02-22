function readEnv(name: string, fallback = ""): string {
  const value = process.env[name];
  if (!value) return fallback;
  return value.trim().replace(/^['"]|['"]$/g, "");
}

const SANITY_PROJECT_ID_RE = /^[a-z0-9-]+$/;

export const sanityEnv = {
  projectId: readEnv("NEXT_PUBLIC_SANITY_PROJECT_ID"),
  dataset: readEnv("NEXT_PUBLIC_SANITY_DATASET", "production"),
  apiVersion: readEnv("NEXT_PUBLIC_SANITY_API_VERSION", "2025-02-01"),
  token: readEnv("SANITY_API_READ_TOKEN"),
};

export function hasSanityConfig() {
  return Boolean(
    SANITY_PROJECT_ID_RE.test(sanityEnv.projectId) &&
      sanityEnv.dataset &&
      sanityEnv.apiVersion
  );
}
