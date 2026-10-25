import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export interface UpdateSessionResult {
  response: NextResponse;
  user: import("@supabase/supabase-js").User | null;
  isAdmin: boolean;
  isConfigured: boolean;
}

/**
 * Updates auth session tokens across request and response cookies.
 * Handles Edge middleware session verification and RBAC checks.
 */
export async function updateSession(request: NextRequest): Promise<UpdateSessionResult> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Development / Offline mode: if unconfigured or placeholder
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder-project")) {
    return {
      response: supabaseResponse,
      user: null,
      isAdmin: true, // Allow local development when credentials are unset
      isConfigured: false,
    };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do NOT use getSession() in server context; getUser() validates auth against Supabase server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    if (user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin") {
      isAdmin = true;
    } else {
      const { data: adminRecord } = await supabase
        .from("admin_users")
        .select("role")
        .or(`id.eq.${user.id},email.eq.${user.email}`)
        .single();

      if (adminRecord && (adminRecord.role === "admin" || adminRecord.role === "superadmin")) {
        isAdmin = true;
      }
    }
  }

  return {
    response: supabaseResponse,
    user,
    isAdmin,
    isConfigured: true,
  };
}
