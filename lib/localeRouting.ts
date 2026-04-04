export type SiteLocale = "en" | "zh";

const CHINESE_VERSION_PATHS = new Set<string>([
  "/",
  "/about",
  "/awards",
  "/book",
  "/cancellation",
  "/classes",
  "/compare",
  "/contact",
  "/debate-classes-toronto",
  "/debate-classes-vancouver",
  "/faq",
  "/online-debate-classes",
  "/pricing",
  "/privacy",
  "/register",
  "/team",
  "/terms",
]);

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
  return CHINESE_VERSION_PATHS.has(stripZhPrefix(pathname));
}
