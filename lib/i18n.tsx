"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useEffect, useMemo } from "react";
import en from "@/messages/en.json";
import zh from "@/messages/zh.json";

type Locale = "en" | "zh";
type Messages = typeof en;

interface I18nContextType {
  locale: Locale;
  t: (key: string) => string;
  toggleLocale: () => void;
  setLocale: (locale: Locale) => void;
  messages: Record<string, unknown>;
  contentSource: "static" | "live" | "fallback";
}

const messages: Record<Locale, Messages> = { en, zh };

const I18nContext = createContext<I18nContextType | null>(null);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (Array.isArray(value)) {
      merged[key] = value;
      continue;
    }
    const current = merged[key];
    if (isObject(current) && isObject(value)) {
      merged[key] = deepMerge(current, value);
      continue;
    }
    merged[key] = value;
  }
  return merged;
}

type CmsOverridesPayload = { en: Record<string, unknown>; zh: Record<string, unknown> } | null;

export function I18nProvider({
  children,
  initialCmsOverrides,
}: {
  children: ReactNode;
  initialCmsOverrides?: CmsOverridesPayload;
}) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";

    // 1) URL param takes highest priority (?lang=zh)
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get("lang");
    if (langParam === "zh") return "zh";
    if (langParam === "en") return "en";

    // 2) Previously saved choice
    const saved = localStorage.getItem("dsdc-locale");
    if (saved === "zh" || saved === "en") return saved as Locale;

    // 3) Auto-detect browser language
    const nav = window.navigator as Navigator & { userLanguage?: string };
    const browserLang = nav.language || nav.userLanguage || "";
    if (browserLang.startsWith("zh")) return "zh";

    return "en";
  });
  const [cmsOverrides, setCmsOverrides] = useState<CmsOverridesPayload>(initialCmsOverrides ?? null);
  const [contentSource, setContentSource] = useState<"static" | "live" | "fallback">(
    initialCmsOverrides ? "live" : "static"
  );

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "en" ? "zh" : "en"));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dsdc-locale", locale);
    }
  }, [locale]);

  useEffect(() => {
    if (initialCmsOverrides) return;
    let cancelled = false;

    async function loadCmsOverrides() {
      try {
        const res = await fetch("/api/cms/messages", { cache: "no-store" });
        if (!res.ok) return;
        const payload = (await res.json()) as {
          source: "live" | "fallback";
          overrides: { en: Record<string, unknown>; zh: Record<string, unknown> };
        };
        if (cancelled) return;
        if (payload.overrides) setCmsOverrides(payload.overrides);
        setContentSource(payload.source);
      } catch {
        // keep static defaults silently
      }
    }

    loadCmsOverrides();
    return () => {
      cancelled = true;
    };
  }, [initialCmsOverrides]);

  const currentMessages = useMemo(() => {
    const base = messages[locale] as unknown as Record<string, unknown>;
    if (!cmsOverrides) return base;
    const override = cmsOverrides[locale] || {};
    return deepMerge(base, override);
  }, [locale, cmsOverrides]);

  const t = useCallback(
    (key: string) => getNestedValue(currentMessages, key),
    [currentMessages]
  );

  return (
    <I18nContext.Provider
      value={{ locale, t, toggleLocale, setLocale, messages: currentMessages, contentSource }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
