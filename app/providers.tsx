"use client";

import { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

type CmsOverrides = { en: Record<string, unknown>; zh: Record<string, unknown> };

export default function ClientProviders({
  children,
  initialCmsOverrides,
}: {
  children: ReactNode;
  initialCmsOverrides?: CmsOverrides;
}) {
  const pathname = usePathname();
  const hideShell = pathname?.startsWith("/studio");

  return (
    <ThemeProvider>
      <I18nProvider initialCmsOverrides={initialCmsOverrides}>
        {!hideShell && <Navbar />}
        <main>{children}</main>
        {!hideShell && <Footer />}
      </I18nProvider>
    </ThemeProvider>
  );
}
