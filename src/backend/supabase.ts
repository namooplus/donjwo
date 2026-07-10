import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SupabaseDatabase } from "@/backend/schema";

type YugainSupabaseClient = SupabaseClient<SupabaseDatabase>;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabaseClient: YugainSupabaseClient | null = null;

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function getSupabaseClient(): YugainSupabaseClient {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  supabaseClient ??= createClient<SupabaseDatabase>(
    supabaseUrl,
    supabasePublishableKey
  );

  return supabaseClient;
}
