import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSafeRedirectPath } from '@/lib/auth-security';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = getSafeRedirectPath(requestUrl.searchParams.get('next'), '/account');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email_confirmed_at) {
        const response = NextResponse.redirect(new URL(next, request.url));
        response.headers.set('Cache-Control', 'no-store');
        return response;
      }

      await supabase.auth.signOut();
    }
  }

  const loginPath = next.startsWith('/admin') ? '/admin/login' : '/login';
  const response = NextResponse.redirect(
    new URL(`${loginPath}?error=auth_callback_failed`, request.url)
  );
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
