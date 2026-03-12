"use client";

import { useEffect } from "react";

export default function AuthHashRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const { pathname, hash, search } = window.location;
    if (pathname !== "/") return;
    if (!hash.includes("access_token=") || !hash.includes("refresh_token=")) return;

    const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const type = hashParams.get("type");
    const authTypes = new Set(["invite", "signup", "email", "magiclink", "recovery"]);
    if (!type || !authTypes.has(type)) return;

    const searchParams = new URLSearchParams(search);
    const next = searchParams.get("next");
    const nextQuery = next && next.startsWith("/") ? `?next=${encodeURIComponent(next)}` : "";
    window.location.replace(`/auth/callback/complete${nextQuery}${hash}`);
  }, []);

  return null;
}

