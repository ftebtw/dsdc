import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
  const { pathname, hostname } = url;
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedProto === "http" && !isLocalHostname(hostname)) {
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  const normalizedPathname =
    pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const legacyDestination = LEGACY_REDIRECTS.get(normalizedPathname);

  if (legacyDestination) {
    url.pathname = legacyDestination;
    return NextResponse.redirect(url, 301);
  }

  if (normalizedPathname !== pathname) {
    url.pathname = normalizedPathname;
    return NextResponse.redirect(url, 301);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-dsdc-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
