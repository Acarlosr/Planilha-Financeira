import { createBrowserClient } from '@supabase/ssr';

/**
 * Client-side Supabase client (SSR-safe, handles cookies automatically)
 * Use this in all "use client" components
 */
export function createBrowserSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Alias for backward compatibility — lazy singleton browser client
 */
let _supabase: ReturnType<typeof createBrowserSupabaseClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createBrowserSupabaseClient>, {
    get(_target, prop) {
        if (!_supabase) {
            _supabase = createBrowserSupabaseClient();
        }
        return (_supabase as any)[prop];
    }
});
