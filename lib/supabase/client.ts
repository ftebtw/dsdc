import { createBrowserClient } from '@supabase/ssr';

let client: any = null;

export function getSupabaseBrowserClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase browser env vars are missing.');
  }

  client = createBrowserClient(url, anonKey) as any;
  return client;
}
