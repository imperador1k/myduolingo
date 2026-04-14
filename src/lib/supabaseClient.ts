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
 * Refactored to be more resilient with external JWTs (Clerk).
 */
export const setSupabaseAuth = async (token: string) => {
    if (!token) return;

    try {
        // 1. Set for Realtime WebSocket sub-protocol
        // Realtime handles its own auth state independently
        supabase.realtime.setAuth(token);
        
        // 2. Set for REST/PostgREST calls (needed for RLS on INSERT/SELECT)
        // We use setSession but we don't 'await' it strictly if it fails locally,
        // because the token injection into the headers is what matters most for RLS.
        const { data, error } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: "", // Clerk doesn't provide a Supabase refresh token
        });

        if (error && !error.message.includes("session missing")) {
            console.warn("[SupabaseAuth] Session warning (expected with Clerk):", error.message);
        }
    } catch (err) {
        // Silence internal auth errors to prevent log spam, 
        // as long as the token is injected for Realtime.
    }
};

/**
 * Creates a fresh, transient Supabase client initialized with a specific authorization token.
 * This is crucial for @supabase/supabase-js when used with external auth (Clerk) and Realtime WebSockets,
 * as the singleton client may fail to properly reconnect if it initially connected without a token,
 * leading to silent `TIMED_OUT` errors during subscription.
 */
export const createClerkSupabaseClient = (token: string) => {
    const client = createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        },
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storageKey: `sb-memory-${Math.random().toString(36).substring(7)}`,
        },
        realtime: {
            // Provide a shorter timeout if we want to fail faster, default is 10000ms
        }
    });
    
    // Explicitly set the token for the realtime socket's access_token parameter
    client.realtime.setAuth(token);
    return client;
};
