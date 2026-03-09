import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client for static/ISR server-side data fetching.
 * Does NOT use cookies — allows routes to be statically generated or ISR cached.
 * Only use for public (anon-key) read operations.
 */
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
