import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { addZhPrefix, normalizePathname, stripZhPrefix } from "@/lib/localeRouting";

const LOCALE_COOKIE = "dsdc-locale";

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
  const { hostname } = url;
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedProto === "http" && !isLocalHostname(hostname)) {
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  const requestedPathname = normalizePathname(url.pathname);
  const langParam = url.searchParams.get("lang");

  if (langParam === "zh") {
    url.searchParams.delete("lang");
    url.pathname = addZhPrefix(stripZhPrefix(requestedPathname));
    return NextResponse.redirect(url, 301);
  }

  if (langParam === "en") {
    url.searchParams.delete("lang");
    url.pathname = stripZhPrefix(requestedPathname);
    return NextResponse.redirect(url, 301);
  }

  if (requestedPathname !== url.pathname) {
    url.pathname = requestedPathname;
    return NextResponse.redirect(url, 301);
  }

  const hasZhPrefix = requestedPathname === "/zh" || requestedPathname.startsWith("/zh/");
  const contentPathname = stripZhPrefix(requestedPathname);
  const locale = hasZhPrefix ? "zh" : "en";
  const legacyDestination = LEGACY_REDIRECTS.get(contentPathname);

  if (legacyDestination) {
    url.pathname = locale === "zh" ? addZhPrefix(legacyDestination) : legacyDestination;
    return NextResponse.redirect(url, 301);
  }

  const preferredLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (!hasZhPrefix && preferredLocale === "zh" && !contentPathname.startsWith("/portal")) {
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
