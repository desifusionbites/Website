'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Loader2 } from 'lucide-react';

interface SignOutButtonProps {
  className?: string;
  showLabel?: boolean;
}

export function SignOutButton({
  className = 'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors w-full text-left',
  showLabel = true,
}: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    if (loading) return;
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/admin/login');
      router.refresh();
    } catch {
      // Force navigation anyway
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={className}
      title="Sign Out of Admin CMS"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      {showLabel && (
        <span>{loading ? 'Signing Out...' : 'Sign Out'}</span>
      )}
    </button>
  );
}
