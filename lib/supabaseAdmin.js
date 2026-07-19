import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn(
    "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
  );
}

// SERVER-ONLY. Never import this file from a "use client" component.
// It uses the service role key, which bypasses Row Level Security, and must
// only be used after verifying the caller is an authenticated admin
// (see lib/auth.js -> requireAdmin).
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false }
});
