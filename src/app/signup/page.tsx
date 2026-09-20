'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { TurnstileChallenge } from '@/components/auth/TurnstileChallenge';
import { createClient } from '@/lib/supabase/client';
import {
  buildAuthCallbackUrl,
  getSafeRedirectPath,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  validatePassword,
} from '@/lib/auth-security';
import { Lock, Mail, User, Loader2, AlertCircle, Sparkles, UserCheck, LogIn, CheckCircle2 } from 'lucide-react';

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function SignUpForm() {
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrorMsg(passwordError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      setLoading(false);
      return;
    }

    if (turnstileSiteKey && !captchaToken) {
      setErrorMsg('Please complete the security verification before creating your account.');
      setLoading(false);
      return;
    }

    try {
      const normalizedEmail = normalizeEmail(email);
      const redirectPath = getSafeRedirectPath(
        searchParams.get('redirect'),
        '/account?verified=1'
      );
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: buildAuthCallbackUrl(window.location.origin, redirectPath),
          captchaToken: captchaToken || undefined,
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        setCaptchaResetSignal((value) => value + 1);
        setErrorMsg('We could not start registration. Please wait a moment and try again.');
        setLoading(false);
        return;
      }

      // A password signup must not create a usable session before the mailbox
      // is verified. Fail closed if email confirmation is disabled upstream.
      if (data.session) {
        await supabase.auth.signOut();
        setErrorMsg(
          'Email verification is temporarily unavailable. Please contact support before using this account.'
        );
        setLoading(false);
        return;
      }

      // Supabase deliberately obscures whether an address is already
      // registered. Keep this response identical to prevent enumeration.
      setVerificationEmail(normalizedEmail);
      setLoading(false);
    } catch {
      setCaptchaResetSignal((value) => value + 1);
      setErrorMsg('An unexpected error occurred during account creation.');
      setLoading(false);
    }
  }

  return (
    <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-sand-200 space-y-6">
      <div className="border-b border-sand-200 pb-3">
        <h2 className="font-serif text-xl font-bold text-stone-900">
          Create Your Account
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Sign up to place orders, track shipments, and receive updates.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMsg}</div>
        </div>
      )}

      {verificationEmail ? (
        <div className="space-y-4" aria-live="polite">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm">Verify your email first</div>
              <p className="leading-relaxed">
                If an account can be created for {verificationEmail}, we sent a secure verification link.
                Your account will not be activated until you open that link.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Return to Sign In
          </Link>
        </div>
      ) : (
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-sand-50/50"
            />
            <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-sand-50/50"
            />
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Password (12+ characters)
          </label>
          <div className="relative">
            <input
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={128}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-sand-50/50"
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={128}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-sand-50/50"
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
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
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4" />
              <span>Create Account & Continue</span>
            </>
          )}
        </button>
      </form>
      )}

      <div className="pt-4 border-t border-sand-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-stone-500">Already registered?</span>
        <Link
          href={`/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`}
          className="font-bold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1 hover:underline"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In Here</span>
        </Link>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] bg-sand-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 pattern-spice-subtle">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-block">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-700 to-spice-800 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-lg mx-auto border-2 border-brand-500/40">
            DFB
          </div>
        </Link>
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Desi Fusion Bites
        </h1>
        <p className="text-xs text-brand-800 font-semibold uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Customer Registration</span>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense
          fallback={
            <div className="bg-white p-8 rounded-3xl border border-sand-200 text-center text-xs text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-2" />
              Loading registration...
            </div>
          }
        >
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
