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

/**
 * Fetches the database profile for the currently authenticated user.
 * STRICT SECURITY: Returns null if no matching profile row exists in the database.
 * Never falls back to a synthetic owner or elevated role.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return null;
    }

    return profile as Profile;
  } catch {
    return null;
  }
}

export async function checkRole(allowedRoles: UserRole[]): Promise<boolean> {
  const profile = await getCurrentProfile();
  if (!profile) return false;
  return allowedRoles.includes(profile.role);
}

/**
 * Enforces role authorization on the server side.
 * Throws an explicit error if the user is not authenticated or lacks required role.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error('Unauthorized: Authentication required with an active profile.');
  }
  if (!allowedRoles.includes(profile.role)) {
    throw new Error(`Forbidden: Role '${profile.role}' does not have required permissions.`);
  }
  return profile;
}
