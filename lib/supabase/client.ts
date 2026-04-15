import { createBrowserClient } from '@supabase/ssr';

let client: any = null;

export function getSupabaseBrowserClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // In local dev without Supabase env vars, return null so unrelated pages
    // (marketing, blog, etc.) can still render. Portal/auth code must null-check.
    return null;
  }

  client = createBrowserClient(url, anonKey) as any;
  return client;
}
