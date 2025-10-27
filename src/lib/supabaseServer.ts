import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // safe for client-side usage
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;     // server-only

// Use anon for public-safe operations (if ever used client-side)
export const supabaseAnon = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Use service role for server routes only
export const supabaseService = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
