'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MIN_PASSWORD_LENGTH, validatePassword } from '@/lib/auth-security';
import { Lock, Loader2, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function AdminResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuthSession() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!cancelled && !user) {
          setErrorMsg('This recovery link is invalid or has expired. Request a new link.');
        }
      } catch {
        if (!cancelled) {
          setErrorMsg('This recovery link could not be verified. Request a new link.');
        }
      } finally {
        if (!cancelled) setSessionChecking(false);
      }
    }

    void checkAuthSession();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handlePasswordUpdate(e: React.FormEvent) {
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
      setErrorMsg('Passwords do not match. Please re-enter identical passwords.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      setLoading(false);
      if (error) {
        setErrorMsg('Unable to update the password. Request a new recovery link and try again.');
      } else {
        await supabase.auth.signOut({ scope: 'others' });
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 2000);
      }
    } catch {
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
          <span>Set New Password</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-sand-200 space-y-6">
          <div className="border-b border-sand-200 pb-3">
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Create New Password
            </h2>
            <p className="text-xs text-stone-500">
              Enter your new secure password for administrative access.
            </p>
          </div>

          {sessionChecking && (
            <div className="p-4 rounded-xl bg-sand-50 border border-sand-200 text-xs text-stone-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Verifying password recovery session...</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {success ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Password Successfully Updated</span>
              </div>
              <p className="leading-relaxed text-emerald-700">
                Your password has been changed. Redirecting to your Admin Dashboard...
              </p>
              <Link
                href="/admin"
                className="inline-block mt-2 font-bold text-brand-700 hover:text-brand-800 underline"
              >
                Click here if you are not redirected automatically →
              </Link>
            </div>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  New Password (12+ characters)
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
                  Confirm New Password
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

              <button
                type="submit"
                disabled={loading || sessionChecking}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Set New Password & Access Admin</span>
                  </>
                )}
              </button>
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
