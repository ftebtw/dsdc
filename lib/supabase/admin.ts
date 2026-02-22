import 'server-only';
import { createClient } from '@supabase/supabase-js';

let adminClient: any = null;

export function getSupabaseAdminClient() {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRole) {
    throw new Error('Supabase service role env vars are missing.');
  }

  adminClient = createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }) as any;

  return adminClient;
}
