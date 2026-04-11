import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Singleton Supabase client for common use.
 * For Clerk-authenticated Realtime/Storage, use the setter if needed,
 * but for Storage we usually use the anon client to avoid 'alg' header issues.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper to set the Auth token globally for the singleton client.
 * Useful for Realtime subscriptions in hooks.
 */
export const setSupabaseAuth = (token: string) => {
    supabase.realtime.setAuth(token);
    // Explicitly set headers for REST calls too
    (supabase as any).headers = {
        ...((supabase as any).headers || {}),
        Authorization: `Bearer ${token}`,
    };
};
