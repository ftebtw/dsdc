import en from '@/messages/en.json';
import zh from '@/messages/zh.json';

type Locale = 'en' | 'zh';

const bundles: Record<Locale, Record<string, unknown>> = {
  en: en as unknown as Record<string, unknown>,
  zh: zh as unknown as Record<string, unknown>,
};

function getNestedValue(obj: Record<string, unknown>, path: string): string | null {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return null;
    }
  }
  return typeof current === 'string' ? current : null;
}

export function parentT(locale: Locale, key: string, fallback: string): string {
  return getNestedValue(bundles[locale], key) ?? fallback;
}
