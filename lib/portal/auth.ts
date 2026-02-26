import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseRouteClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';

export type PortalRole = Database['public']['Enums']['app_role'];

export type PortalProfile = Database['public']['Tables']['profiles']['Row'];

export const getCurrentSessionProfile = cache(
  async (): Promise<{ userId: string; profile: PortalProfile } | null> => {
    try {
      const supabase = await getSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) return null;

      return { userId: user.id, profile };
    } catch (error) {
      console.error('[portal-auth] getCurrentSessionProfile failed', error);
      return null;
    }
  }
);

export async function requireSession() {
  const session = await getCurrentSessionProfile();
  if (!session) {
    redirect('/portal/login');
  }
  return session;
}

export async function requireRole(allowed: PortalRole[]) {
  const session = await requireSession();
  if (!allowed.includes(session.profile.role)) {
    redirect(roleHome(session.profile.role));
  }
  return session;
}

export function roleHome(role: PortalRole): string {
  if (role === 'admin') return '/portal/admin/dashboard';
  if (role === 'coach' || role === 'ta') return '/portal/coach/dashboard';
  if (role === 'student') return '/portal/student/classes';
  if (role === 'parent') return '/portal/parent/dashboard';
  return '/portal/login';
}

export async function redirectByCurrentRole() {
  const session = await requireSession();
  redirect(roleHome(session.profile.role));
}

export async function getRequestSessionProfile(request: NextRequest): Promise<{ userId: string; profile: PortalProfile } | null> {
  try {
    const response = NextResponse.next();
    const supabase = getSupabaseRouteClient(request, response);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return { userId: user.id, profile };
  } catch (error) {
    console.error('[portal-auth] getRequestSessionProfile failed', error);
    return null;
  }
}

export async function requireApiRole(request: NextRequest, allowed: PortalRole[]) {
  const session = await getRequestSessionProfile(request);
  if (!session || !allowed.includes(session.profile.role)) {
    return null;
  }
  return session;
}
