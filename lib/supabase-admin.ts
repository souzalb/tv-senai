import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceRoleKey) {
    if (process.env.NODE_ENV !== 'production') {
        console.warn("Missing SUPABASE_SERVICE_ROLE_KEY. Admin operations will fail.");
    }
}

// Service Role client for Admin operations (creating/deleting users)
// NEVER expose this to the client-side
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
