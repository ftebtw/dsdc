"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import HtmlLangUpdater from "@/components/HtmlLangUpdater";

type CmsOverrides = { en: Record<string, unknown>; zh: Record<string, unknown> };

const FloatingLanguagePill = dynamic(() => import("@/components/FloatingLanguagePill"), {
  ssr: false,
});

export default function ClientProviders({
  children,
  initialCmsOverrides,
  initialLocale,
  hideShell = false,
}: {
  children: ReactNode;
  initialCmsOverrides?: CmsOverrides;
  initialLocale: "en" | "zh";
  hideShell?: boolean;
}) {
  return (
    <ThemeProvider>
      <I18nProvider initialCmsOverrides={initialCmsOverrides} initialLocale={initialLocale}>
        <HtmlLangUpdater />
        {children}
        {!hideShell && <FloatingLanguagePill />}
      </I18nProvider>
    </ThemeProvider>
  );
}
