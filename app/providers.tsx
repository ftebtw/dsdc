"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HtmlLangUpdater from "@/components/HtmlLangUpdater";
import { usePathname } from "next/navigation";

type CmsOverrides = { en: Record<string, unknown>; zh: Record<string, unknown> };
const FloatingLanguagePill = dynamic(() => import("@/components/FloatingLanguagePill"), {
  ssr: false,
});

export default function ClientProviders({
  children,
  initialCmsOverrides,
}: {
  children: ReactNode;
  initialCmsOverrides?: CmsOverrides;
}) {
  const pathname = usePathname();
  const hideShell = pathname?.startsWith("/studio") || pathname?.startsWith("/portal");

  return (
    <ThemeProvider>
      <I18nProvider initialCmsOverrides={initialCmsOverrides}>
        <HtmlLangUpdater />
        {!hideShell && <Navbar />}
        <main id="main-content">{children}</main>
        {!hideShell && <Footer />}
        {!hideShell && <FloatingLanguagePill />}
      </I18nProvider>
    </ThemeProvider>
  );
}
