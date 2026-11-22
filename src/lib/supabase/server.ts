import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serverAnonClient: SupabaseClient | null = null;
let serverAdminClient: SupabaseClient | null = null;

/**
 * Returns a public Supabase client for Server Components and storefront services.
 * Strictly uses NEXT_PUBLIC_SUPABASE_ANON_KEY to ensure Row Level Security (RLS) is enforced.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (serverAnonClient) return serverAnonClient;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

  serverAnonClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverAnonClient;
}

/**
 * Returns a privileged Supabase client for internal administrator server actions.
 * NEVER expose this to client components or public storefront readers.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (serverAdminClient) return serverAdminClient;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-key";

  serverAdminClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverAdminClient;
}
