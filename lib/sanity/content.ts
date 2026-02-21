import { getSanityClient } from "./client";
import { hasSanityConfig } from "./env";
import {
  cmsContentQuery,
  siteSettingsQuery,
  homePageQuery,
  pricingPageQuery,
  teamPageQuery,
} from "./queries";

type Locale = "en" | "zh";
type MessageObject = Record<string, unknown>;

interface SanityCmsResponse {
  siteSettings?: Record<string, unknown>;
  homePage?: Record<string, unknown>;
  pricingPage?: Record<string, unknown>;
  teamPage?: Record<string, unknown>;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLocalizedObject(value: unknown): value is { en?: unknown; zh?: unknown } {
  if (!isObject(value)) return false;
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((k) => k === "en" || k === "zh");
}

function resolveLocale(value: unknown, locale: Locale): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => resolveLocale(item, locale));
  }

  if (isLocalizedObject(value)) {
    if (value[locale] !== undefined && value[locale] !== null) return value[locale];
    const fallbackLocale = locale === "en" ? "zh" : "en";
    return value[fallbackLocale] ?? "";
  }

  if (isObject(value)) {
    const resolved: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (key === "_type" || key === "_id" || key === "_createdAt" || key === "_updatedAt" || key === "_rev" || key === "_key") {
        continue;
      }
      if (key === "image" && isObject(nested) && typeof nested.imageUrl === "string") {
        resolved.image = nested.imageUrl;
        continue;
      }
      resolved[key] = resolveLocale(nested, locale);
    }
    return resolved;
  }

  return value;
}

function deepMerge(base: MessageObject, override: MessageObject): MessageObject {
  const merged: MessageObject = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (Array.isArray(value)) {
      merged[key] = value;
      continue;
    }
    const current = merged[key];
    if (isObject(current) && isObject(value)) {
      merged[key] = deepMerge(current, value);
      continue;
    }
    merged[key] = value;
  }
  return merged;
}

function buildLocaleOverrides(payload: SanityCmsResponse, locale: Locale): MessageObject {
  const parts = [payload.siteSettings, payload.homePage, payload.pricingPage, payload.teamPage]
    .filter((part): part is Record<string, unknown> => Boolean(part))
    .map((part) => resolveLocale(part, locale))
    .filter((part): part is MessageObject => isObject(part));

  return parts.reduce<MessageObject>((acc, part) => deepMerge(acc, part), {});
}

async function fetchSanityCmsContent(opts?: { draft?: boolean }): Promise<SanityCmsResponse | null> {
  if (!hasSanityConfig()) return null;
  try {
    const client = getSanityClient({ draft: opts?.draft, stega: opts?.draft });
    const fetchOpts = {
      cache: "no-store" as const,
      ...(opts?.draft && {
        resultSourceMap: "withKeyArraySelector" as const,
        stega: true,
      }),
    };

    if (opts?.draft) {
      const [siteSettings, homePage, pricingPage, teamPage] = await Promise.all([
        client.fetch<SanityCmsResponse["siteSettings"]>(siteSettingsQuery, {}, fetchOpts),
        client.fetch<SanityCmsResponse["homePage"]>(homePageQuery, {}, fetchOpts),
        client.fetch<SanityCmsResponse["pricingPage"]>(pricingPageQuery, {}, fetchOpts),
        client.fetch<SanityCmsResponse["teamPage"]>(teamPageQuery, {}, fetchOpts),
      ]);
      return { siteSettings, homePage, pricingPage, teamPage };
    }

    const data = await client.fetch<SanityCmsResponse>(cmsContentQuery, {}, fetchOpts);
    return data ?? null;
  } catch {
    return null;
  }
}

export async function getCmsMessageOverrides(opts?: { draft?: boolean }) {
  try {
    const data = await fetchSanityCmsContent({ draft: opts?.draft ?? false });
    if (!data) return { source: "fallback" as const, overrides: { en: {}, zh: {} } };
    return {
      source: "live" as const,
      overrides: {
        en: buildLocaleOverrides(data, "en"),
        zh: buildLocaleOverrides(data, "zh"),
      },
    };
  } catch {
    return { source: "fallback" as const, overrides: { en: {}, zh: {} } };
  }
}
