import { translatedChineseBlogSlugs } from "@/lib/blogChineseSlugs";

export type SiteLocale = "en" | "zh";

const CHINESE_VERSION_PATHS = new Set<string>([
  "/",
  "/about",
  "/awards",
  "/book",
  "/blog",
  "/cancellation",
  "/classes",
  "/compare",
  "/contact",
  "/debate-classes-toronto",
  "/debate-classes-vancouver",
  "/debate-club",
  "/debate-formats",
  "/debate-summer-camp",
  "/faq",
  "/online-debate-classes",
  "/pricing",
  "/privacy",
  "/public-speaking-classes-for-kids",
  "/public-speaking-classes-vancouver",
  "/register",
  "/team",
  "/terms",
  "/world-scholars-cup-coaching",
]);

const CHINESE_BLOG_SLUGS = new Set<string>(translatedChineseBlogSlugs);

export function normalizePathname(pathname: string) {
  if (!pathname) return "/";
  return pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function stripZhPrefix(pathname: string) {
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === "/zh") return "/";
  if (normalizedPath.startsWith("/zh/")) return normalizePathname(normalizedPath.slice(3));

  return normalizedPath;
}

export function addZhPrefix(pathname: string) {
  const normalizedPath = normalizePathname(pathname);
  return normalizedPath === "/" ? "/zh" : `/zh${normalizedPath}`;
}

export function hasChineseVersion(pathname: string) {
  const normalizedPath = stripZhPrefix(pathname);

  if (CHINESE_VERSION_PATHS.has(normalizedPath)) {
    return true;
  }

  if (normalizedPath === "/guide-to-debate-in-canada") {
    return CHINESE_BLOG_SLUGS.has("guide-to-debate-in-canada");
  }

  if (normalizedPath.startsWith("/blog/")) {
    const slug = normalizedPath.slice("/blog/".length);
    return CHINESE_BLOG_SLUGS.has(slug);
  }

  return false;
}
