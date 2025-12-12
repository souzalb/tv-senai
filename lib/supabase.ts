import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
    if (typeof window !== "undefined") {
        console.error("🚨 CRITICAL ERROR: Supabase credentials are missing or set to placeholders.");
        console.error("Please update your .env.local file with your actual Supabase URL and Key.");
        console.error("Current URL:", supabaseUrl);
    }
}

// Use createBrowserClient for Client Components to ensure cookies are handled correctly
// across client/server boundary (Middleware).
export const supabase = createBrowserClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key'
);
