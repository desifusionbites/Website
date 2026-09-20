import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Public admin authentication paths that unauthenticated visitors can access
const PUBLIC_ADMIN_PATHS = [
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-dfb-public-admin-auth-page', isPublicAdminPath ? '1' : '0');
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (pathname.startsWith('/admin') || pathname === '/auth/callback') {
      return new NextResponse('Authentication service is unavailable.', {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      });
    }
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /admin routes (except public auth pages like login, forgot-password, reset-password)
  if (pathname.startsWith('/admin') && !isPublicAdminPath) {
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role verification: Verify that authenticated user has an active profile with allowed role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || !['owner', 'admin', 'staff'].includes(profile.role)) {
      // Authenticated user with no registered role or unauthorized role
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized_role');
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and visiting /admin/login or /admin/forgot-password with a valid role, redirect to /admin
  if ((pathname === '/admin/login' || pathname === '/admin/forgot-password') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile && ['owner', 'admin', 'staff'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/callback',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
