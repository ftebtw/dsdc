import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseRouteClient, mergeCookies } from '@/lib/supabase/route';

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function extractIpAddress(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  return null;
}

export async function POST(request: NextRequest) {
  const supabaseResponse = NextResponse.next();
  const supabase = getSupabaseRouteClient(request, supabaseResponse);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return mergeCookies(supabaseResponse, jsonError('Unauthorized', 401));
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id,email,role,display_name')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return mergeCookies(supabaseResponse, jsonError(profileError.message, 500));
  }

  if (!profile) {
    return mergeCookies(supabaseResponse, jsonError('Profile not found.', 404));
  }

  if (profile.role !== 'admin' && profile.role !== 'coach' && profile.role !== 'ta') {
    return mergeCookies(supabaseResponse, NextResponse.json({ tracked: false }));
  }

  const admin = getSupabaseAdminClient();
  const ipAddress = extractIpAddress(request);
  const userAgent = request.headers.get('user-agent')?.trim() || null;

  const { error: insertError } = await admin.from('portal_login_log').insert({
    user_id: profile.id,
    email: profile.email,
    role: profile.role,
    display_name: profile.display_name,
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  if (insertError) {
    console.error('[portal-track-login] insert failed', insertError);
    return mergeCookies(supabaseResponse, NextResponse.json({ tracked: false }));
  }

  return mergeCookies(supabaseResponse, NextResponse.json({ tracked: true }));
}
