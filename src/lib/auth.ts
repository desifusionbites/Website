import { createClient } from '@/lib/supabase/server';
import { UserRole, Profile } from '@/types/database';

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) return profile as Profile;

    // Default fallback profile for initial setup
    return {
      id: user.id,
      email: user.email || 'owner@desifusionbites.com',
      full_name: user.user_metadata?.full_name || 'Business Owner',
      role: 'owner' as UserRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function checkRole(allowedRoles: UserRole[]): Promise<boolean> {
  const profile = await getCurrentProfile();
  if (!profile) return false;
  return allowedRoles.includes(profile.role);
}
