import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Server-only admin client with service role key for privileged queries (e.g. audit logs, user management)
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin credentials (SUPABASE_SERVICE_ROLE_KEY) are missing in environment.');
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
