'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TurnstileChallenge } from '@/components/auth/TurnstileChallenge';
import { createClient } from '@/lib/supabase/client';
import { buildAuthCallbackUrl, normalizeEmail } from '@/lib/auth-security';
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (turnstileSiteKey && !captchaToken) {
      setErrorMsg('Please complete the security verification before requesting a reset.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const redirectTo = buildAuthCallbackUrl(window.location.origin, '/admin/reset-password');

      const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
        redirectTo,
        captchaToken: captchaToken || undefined,
      });

      setLoading(false);
      if (error) {
        setCaptchaResetSignal((value) => value + 1);
        setErrorMsg('We could not process that request right now. Please wait and try again.');
      } else {
        setSuccessMsg('If an authorized account exists for that address, a password reset link has been sent.');
      }
    } catch {
      setCaptchaResetSignal((value) => value + 1);
      setErrorMsg('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

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
          <span>Password Recovery</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-sand-200 space-y-6">
          <div className="border-b border-sand-200 pb-3">
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Reset Admin Password
            </h2>
            <p className="text-xs text-stone-500">
              Enter your registered staff/owner email address to receive a secure password recovery link.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-emerald-900 text-sm">Check Your Inbox</div>
                  <div className="leading-relaxed">{successMsg}</div>
                </div>
              </div>

              <Link
                href="/admin/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Registered Staff/Owner Email
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
                    <span>Sending Recovery Link...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send Reset Instructions</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/admin/login"
                  className="text-xs text-stone-500 hover:text-stone-800 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-stone-400 border-t border-sand-100">
            Protected by Supabase Auth & Row-Level Security
          </div>
        </div>
      </div>
    </div>
  );
}
