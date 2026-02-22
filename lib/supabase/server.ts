import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function getSupabaseServerClient() {
  const store = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase server env vars are missing.');
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookieList: Array<{ name: string; value: string; options?: any }>) {
        try {
          for (const cookie of cookieList) {
            store.set(cookie.name, cookie.value, cookie.options);
          }
        } catch {
          // Server Components may not allow cookie mutation. Safe to ignore.
        }
      },
    },
  }) as any;
}
