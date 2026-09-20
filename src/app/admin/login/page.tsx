'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, Loader2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message || 'Invalid email or password');
    } else if (data.session) {
      router.push('/admin');
      router.refresh();
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
          <span>Business Admin CMS</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-sand-200 space-y-6">
          <div className="border-b border-sand-200 pb-3">
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Admin & Proprietor Login
            </h2>
            <p className="text-xs text-stone-500">
              Authorized personnel only. Enter your registered credentials.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. desifusionbites@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-sand-50/50"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-sand-50/50"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

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

          <div className="pt-2 text-center text-xs text-stone-400 border-t border-sand-100">
            Protected by Supabase Row-Level Security
          </div>
        </div>
      </div>
    </div>
  );
}
