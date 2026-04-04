import { headers } from "next/headers";
import type { SiteLocale } from "@/lib/localeRouting";

export async function getRequestLocale(): Promise<SiteLocale> {
  const requestHeaders = await headers();
  return requestHeaders.get("x-dsdc-locale") === "zh" ? "zh" : "en";
}
