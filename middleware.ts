import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { addZhPrefix, hasChineseVersion, normalizePathname, stripZhPrefix } from "@/lib/localeRouting";

const LOCALE_COOKIE = "dsdc-locale";
const CANONICAL_HOST = "dsdc.ca";
const LEGACY_HOSTNAMES = new Set(["www.dsdc.ca", "k.dsdc.ca", "ki.dsdc.ca"]);

const LEGACY_REDIRECTS = new Map<string, string>([
  ["/contact-form", "/contact"],
  ["/contact-us", "/contact"],
  ["/our-team", "/team"],
  ["/book-meeting", "/book"],
  ["/student-awards", "/awards"],
  ["/registration", "/register"],
  ["/blog/guide-to-debate-in-canada", "/guide-to-debate-in-canada"],
]);

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = url.hostname.toLowerCase();
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (LEGACY_HOSTNAMES.has(hostname)) {
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    return NextResponse.redirect(url, 301);
  }

  if (forwardedProto === "http" && !isLocalHostname(hostname)) {
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  const requestedPathname = normalizePathname(url.pathname);
  const normalizedContentPath = stripZhPrefix(requestedPathname);
  const requestedHasZhPrefix = requestedPathname === "/zh" || requestedPathname.startsWith("/zh/");
  const langParam = url.searchParams.get("lang");
  const requestedLocale = requestedHasZhPrefix ? "zh" : "en";
  const targetLocale = langParam === "zh" ? "zh" : langParam === "en" ? "en" : requestedLocale;
  const legacyDestination = LEGACY_REDIRECTS.get(normalizedContentPath);

  if (langParam === "zh" || langParam === "en" || requestedPathname !== url.pathname || legacyDestination) {
    url.searchParams.delete("lang");
    const destinationPath = legacyDestination ?? normalizedContentPath;
    url.pathname =
      targetLocale === "zh" && hasChineseVersion(destinationPath) ? addZhPrefix(destinationPath) : destinationPath;
    return NextResponse.redirect(url, 301);
  }

  const hasZhPrefix = requestedHasZhPrefix;
  const contentPathname = normalizedContentPath;
  const supportsChineseVersion = hasChineseVersion(contentPathname);

  if (hasZhPrefix && !supportsChineseVersion) {
    url.pathname = contentPathname;
    return NextResponse.redirect(url, 301);
  }

  const locale = hasZhPrefix ? "zh" : "en";

  const preferredLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (!hasZhPrefix && preferredLocale === "zh" && supportsChineseVersion && !contentPathname.startsWith("/portal")) {
    url.pathname = addZhPrefix(contentPathname);
    return NextResponse.redirect(url, 307);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-dsdc-locale", locale);
  requestHeaders.set("x-dsdc-pathname", contentPathname);
  requestHeaders.set("x-dsdc-public-pathname", requestedPathname);

  const response = hasZhPrefix
    ? (() => {
        const rewriteUrl = url.clone();
        rewriteUrl.pathname = contentPathname;
        return NextResponse.rewrite(rewriteUrl, {
          request: {
            headers: requestHeaders,
          },
        });
      })()
    : NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
