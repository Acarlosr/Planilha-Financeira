import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client-side Supabase client (SSR-safe, handles cookies automatically)
 * Use this in all "use client" components
 */
export function createBrowserSupabaseClient() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Alias for backward compatibility — singleton browser client
 */
export const supabase = createBrowserSupabaseClient();
