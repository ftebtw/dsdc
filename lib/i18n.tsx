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

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [cmsOverrides, setCmsOverrides] = useState<{ en: Record<string, unknown>; zh: Record<string, unknown> } | null>(null);
  const [contentSource, setContentSource] = useState<"static" | "live" | "fallback">("static");

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "en" ? "zh" : "en"));
  }, []);

  useEffect(() => {
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
  }, []);

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
    <I18nContext.Provider value={{ locale, t, toggleLocale, messages: currentMessages, contentSource }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
