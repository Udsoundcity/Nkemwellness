import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars."
  );
}

// Safe to use in client or server components. Respects Row Level Security,
// so it can only ever see what public policies allow (active products,
// forms, and inserting orders).
export const supabasePublic = createClient(url, anonKey, {
  auth: { persistSession: false }
});
