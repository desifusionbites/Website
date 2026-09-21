'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TurnstileChallenge } from '@/components/auth/TurnstileChallenge';
import { createClient } from '@/lib/supabase/client';
import { getSafeRedirectPath, normalizeEmail } from '@/lib/auth-security';
import { Lock, Mail, Loader2, AlertCircle, Sparkles, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);

  const queryError = searchParams.get('error') === 'unauthorized_role'
    ? 'This account is not authorized for administrative access.'
    : searchParams.get('error') === 'auth_callback_failed'
      ? 'Authentication session could not be verified. Please try signing in with your email and password.'
      : null;
  const displayedError = errorMsg || queryError;

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'unauthorized_role') {
      const supabase = createClient();
      supabase.auth.signOut().catch(() => {});
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (turnstileSiteKey && !captchaToken) {
      setErrorMsg('Please complete the security verification before signing in.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizeEmail(email),
        password,
        options: {
          captchaToken: captchaToken || undefined,
        },
      });

      if (error) {
        setCaptchaResetSignal((value) => value + 1);
        setErrorMsg('Unable to sign in. Check your credentials and verify your email first.');
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Double check profile authorization
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profile || !['owner', 'admin', 'staff'].includes(profile.role)) {
          setErrorMsg('This account is not authorized for administrative access.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        router.replace(getSafeRedirectPath(searchParams.get('redirect'), '/admin'));
        router.refresh();
      }
    } catch {
      setCaptchaResetSignal((value) => value + 1);
      setErrorMsg('An unexpected error occurred during sign in. Please try again.');
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const redirectPath = getSafeRedirectPath(searchParams.get('redirect'), '/admin');
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      callbackUrl.searchParams.set('next', redirectPath);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setErrorMsg(error.message || 'Failed to initialize Google Sign In');
        setLoading(false);
      }
    } catch {
      setErrorMsg('An error occurred initializing Google Sign In');
      setLoading(false);
    }
  }

  return (
    <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-sand-200 space-y-6">
      <div className="border-b border-sand-200 pb-3">
        <h2 className="font-serif text-lg font-bold text-stone-900">
          Admin & Proprietor Login
        </h2>
        <p className="text-xs text-stone-500">
          Authorized personnel only. Enter your registered credentials or sign in with Google.
        </p>
      </div>

      {displayedError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{displayedError}</div>
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm shadow-sm transition-all hover:border-stone-400 disabled:opacity-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Sign in with Google</span>
      </button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-sand-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-stone-400 font-semibold tracking-wider">or sign in with password</span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Admin Email
          </label>
          <div className="relative">
            <input
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. desifusionbites@gmail.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-sand-50/50"
            />
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-stone-700">
              Password
            </label>
            <Link
              href="/admin/forgot-password"
              className="text-xs text-brand-700 hover:text-brand-800 font-semibold hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              maxLength={128}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-sand-50/50"
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-2.5 p-0.5 text-stone-400 hover:text-stone-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {turnstileSiteKey && (
          <TurnstileChallenge
            siteKey={turnstileSiteKey}
            onTokenChange={setCaptchaToken}
            resetSignal={captchaResetSignal}
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In to Dashboard</span>
            </>
          )}
        </button>
      </form>

      <div className="pt-3 flex items-center justify-between text-xs text-stone-400 border-t border-sand-100">
        <span>Protected by Supabase Auth & RLS</span>
        <Link
          href="/"
          className="text-stone-500 hover:text-brand-700 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <span>Back to Store</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-sand-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 pattern-spice-subtle">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-700 to-spice-800 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-xl mx-auto border-2 border-brand-500/40">
          DFB
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          Desi Fusion Bites
        </h1>
        <p className="text-xs text-brand-800 font-semibold uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Business Admin CMS</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense
          fallback={
            <div className="bg-white p-8 rounded-3xl border border-sand-200 text-center text-xs text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-2" />
              Loading security portal...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
