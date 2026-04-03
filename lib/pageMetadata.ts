import type { Metadata } from "next";
import { headers } from "next/headers";
import { statSync } from "node:fs";
import { join } from "node:path";
import { addZhPrefix, type SiteLocale } from "@/lib/localeRouting";
import { SITE_NAME, absoluteUrl } from "@/lib/structuredData";

type MetadataImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

type BuildLocalizedPageMetadataOptions = {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  openGraphType?: "website" | "article";
  images?: MetadataImage[];
  noIndex?: boolean;
  hasChineseVersion?: boolean;
};

export async function buildLocalizedPageMetadata({
  path,
  title,
  description,
  keywords,
  openGraphType = "website",
  images = [],
  noIndex = false,
  hasChineseVersion = true,
}: BuildLocalizedPageMetadataOptions): Promise<Metadata> {
  const requestHeaders = await headers();
  const locale: SiteLocale = requestHeaders.get("x-dsdc-locale") === "zh" ? "zh" : "en";
  const englishHref = absoluteUrl(path);
  const chineseHref = absoluteUrl(addZhPrefix(path));
  const canonical = absoluteUrl(hasChineseVersion && locale === "zh" ? addZhPrefix(path) : path);
  const absoluteImages = images.map((image) => ({
    ...image,
    url: absoluteUrl(image.url),
  }));

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: {
      canonical,
      languages: hasChineseVersion
        ? {
            en: englishHref,
            zh: chineseHref,
            "x-default": englishHref,
          }
        : {
            en: englishHref,
            "x-default": englishHref,
          },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: openGraphType,
      ...(absoluteImages.length ? { images: absoluteImages } : {}),
    },
    twitter: {
      card: absoluteImages.length ? "summary_large_image" : "summary",
      title,
      description,
      ...(absoluteImages.length ? { images: absoluteImages.map((image) => image.url) } : {}),
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: true,
          },
        }
      : {}),
  };
}

export function getLocalizedLastModified(paths: string[]) {
  try {
    const timestamps = paths
      .map((filePath) => join(process.cwd(), filePath))
      .map((fullPath) => statSync(fullPath).mtimeMs);

    return new Date(Math.max(...timestamps));
  } catch {
    return new Date();
  }
}
