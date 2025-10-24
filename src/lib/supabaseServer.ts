import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;

export const supabaseService = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const supabaseAnon = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
