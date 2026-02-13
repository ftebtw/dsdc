"use client";

import { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </I18nProvider>
  );
}
