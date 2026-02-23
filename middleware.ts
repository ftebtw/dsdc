import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/database.types';

function roleHome(role: Database['public']['Enums']['app_role']) {
  if (role === 'admin') return '/portal/admin/dashboard';
  if (role === 'coach' || role === 'ta') return '/portal/coach/dashboard';
  if (role === 'student') return '/portal/student/classes';
  if (role === 'parent') return '/portal/parent/dashboard';
  return '/portal/login';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/portal')) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: Array<{ name: string; value: string; options?: any }>) => {
        for (const cookie of cookiesToSet) {
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authFlowPages = ['/portal/login', '/portal/setup-password'];
  const isAuthFlow = authFlowPages.some((path) => pathname === path);
  const isLogin = pathname === '/portal/login';
  const isSetupPassword = pathname === '/portal/setup-password';

  if (!user) {
    if (isLogin) return response;
    const loginUrl = new URL('/portal/login', request.url);
    if (!isAuthFlow) {
      loginUrl.searchParams.set('redirectTo', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (isSetupPassword) {
    return response;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role;
  if (!role) {
    return NextResponse.redirect(new URL('/portal/login', request.url));
  }

  if (isLogin || pathname === '/portal') {
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }

  if (pathname.startsWith('/portal/signup') || pathname.startsWith('/portal/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL(roleHome(role), request.url));
    }
  }

  if (pathname.startsWith('/portal/coach')) {
    if (!(role === 'coach' || role === 'ta')) {
      return NextResponse.redirect(new URL(roleHome(role), request.url));
    }
  }

  if (pathname.startsWith('/portal/student')) {
    if (role !== 'student') {
      return NextResponse.redirect(new URL(roleHome(role), request.url));
    }
  }

  if (pathname.startsWith('/portal/parent')) {
    if (role !== 'parent') {
      return NextResponse.redirect(new URL(roleHome(role), request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/portal/:path*'],
};
