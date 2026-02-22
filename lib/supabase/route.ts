import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';

export function getSupabaseRouteClient(request: NextRequest, response: NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase route env vars are missing.');
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        for (const cookie of cookiesToSet) {
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  }) as any;
}

/**
 * Copy any cookies that Supabase SSR set on `supabaseResponse`
 * onto a final NextResponse (JSON, CSV, etc.).
 */
export function mergeCookies(
  supabaseResponse: NextResponse,
  finalResponse: NextResponse
): NextResponse {
  for (const cookie of supabaseResponse.cookies.getAll()) {
    finalResponse.cookies.set(cookie.name, cookie.value, cookie as any);
  }
  return finalResponse;
}
