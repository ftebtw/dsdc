import { randomInt } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/portal/auth';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

const CODE_LENGTH = 6;
const MAX_ACTIVE_CODES = 5;
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function generateInviteCode(): string {
  let code = '';
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    code += CODE_ALPHABET[randomInt(0, CODE_ALPHABET.length)];
  }
  return code;
}

export async function POST(request: NextRequest) {
  const session = await requireApiRole(request, ['parent']);
  if (!session) return jsonError('Unauthorized', 401);

  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);
  const nowIso = new Date().toISOString();

  const { count, error: countError } = await supabase
    .from('invite_codes')
    .select('id', { count: 'exact', head: true })
    .eq('parent_id', session.userId)
    .is('claimed_by', null)
    .gt('expires_at', nowIso);

  if (countError) return mergeCookies(supabaseResponse, jsonError(countError.message, 400));
  if ((count ?? 0) >= MAX_ACTIVE_CODES) {
    return mergeCookies(supabaseResponse, jsonError('You already have 5 active codes. Use or wait for one to expire.', 429));
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateInviteCode();
    const { data, error } = await supabase
      .from('invite_codes')
      .insert({
        parent_id: session.userId,
        code,
        expires_at: expiresAt,
      })
      .select('id,code,expires_at,claimed_by,claimed_at,created_at')
      .single();

    if (!error && data) {
      return mergeCookies(supabaseResponse, NextResponse.json({
        code: data.code,
        expiresAt: data.expires_at,
        invite: data,
      }));
    }

    if (error?.code !== '23505') {
      return mergeCookies(supabaseResponse, jsonError(error?.message || 'Could not generate invite code.', 500));
    }
  }

  return mergeCookies(supabaseResponse, jsonError('Could not generate invite code. Please try again.', 500));
}

