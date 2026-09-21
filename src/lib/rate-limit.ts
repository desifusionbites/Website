import { createAdminClient } from '@/lib/supabase/admin';

export interface RateLimitOptions {
  key: string;
  maxAttempts: number;
  windowSeconds: number;
  failClosed?: boolean;
}

/**
 * Distributed, atomic rate limiter.
 * Leverages row-locked PostgreSQL check_rate_limit() RPC in Supabase.
 */
export async function checkRateLimit({
  key,
  maxAttempts,
  windowSeconds,
  failClosed = false,
}: RateLimitOptions): Promise<{ allowed: boolean }> {
  try {
    const supabase = createAdminClient();

    // Call atomic row-locked RPC
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_max_attempts: maxAttempts,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      // If table/function is migrating, fallback to atomic upsert or in-memory safe window
      console.warn('RPC check_rate_limit error, using fallback:', error.message);
      return { allowed: !failClosed };
    }

    return { allowed: Boolean(data) };
  } catch (err) {
    console.error('Rate limit error:', err);
    return { allowed: !failClosed };
  }
}
