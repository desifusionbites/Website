'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, LogIn, ShoppingBag, Shield, LogOut, ChevronDown } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function AccountButton() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          setRole(profile?.role || 'customer');
        }
      } catch {
        // Continue
      }
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      if (!session) {
        setRole(null);
      } else {
        loadUser();
      }
    });

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push('/login');
    router.refresh();
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 hover:text-brand-800 hover:bg-sand-100 transition-colors border border-sand-300"
      >
        <LogIn className="w-3.5 h-3.5 text-stone-500" />
        <span className="hidden sm:inline">Sign In</span>
      </Link>
    );
  }

  const initial = user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-full text-xs font-semibold text-stone-700 hover:bg-sand-100 border border-sand-300 transition-colors"
        aria-label="User Account Menu"
      >
        <div className="w-6 h-6 rounded-full bg-brand-700 text-white flex items-center justify-center text-xs font-bold uppercase shadow-xs">
          {initial}
        </div>
        <span className="hidden sm:inline max-w-[100px] truncate text-stone-800">
          {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
        </span>
        <ChevronDown className="w-3 h-3 text-stone-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-sand-200 py-2 z-50 animate-in fade-in-50 slide-in-from-top-1">
          <div className="px-4 py-2 border-b border-sand-100">
            <div className="text-xs font-bold text-stone-900 truncate">
              {user.user_metadata?.full_name || 'My Account'}
            </div>
            <div className="text-[11px] text-stone-500 truncate">{user.email}</div>
          </div>

          <div className="py-1">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-sand-50 hover:text-brand-800 transition-colors"
            >
              <User className="w-4 h-4 text-stone-400" />
              <span>Account Dashboard</span>
            </Link>

            <Link
              href="/track-order"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-sand-50 hover:text-brand-800 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-stone-400" />
              <span>Track Orders</span>
            </Link>

            {role === 'owner' || role === 'admin' || role === 'staff' ? (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-700 font-bold bg-brand-50/50 hover:bg-brand-50 transition-colors"
              >
                <Shield className="w-4 h-4 text-brand-600" />
                <span>Admin CMS ({role})</span>
              </Link>
            ) : null}
          </div>

          <div className="pt-1 border-t border-sand-100">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
