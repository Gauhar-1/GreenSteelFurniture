"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  AdminLoginSchema,
  type AdminLoginInput,
  type AuthActionResult,
} from "@/types/auth";

/**
 * Checks if active session belongs to an authorized administrator
 */
export async function verifyAdminSession(): Promise<{ authorized: boolean; userId?: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // If unconfigured in local development mode, allow action to proceed
  if (!url || url.includes("placeholder-project")) {
    return { authorized: true };
  }

  // Allow test automation in non-production
  if (process.env.NODE_ENV !== "production") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      if (cookieStore.get("playwright_test_admin")?.value === "true") {
        return { authorized: true, userId: "test-admin" };
      }
    } catch {
      // ignore
    }
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { authorized: false };
    }

    // 1. Check JWT metadata
    if (user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin") {
      return { authorized: true, userId: user.id };
    }

    // 2. Check admin_users table (by ID or Email)
    const { data: adminRecord } = await supabase
      .from("admin_users")
      .select("role")
      .or(`id.eq.${user.id},email.eq.${user.email}`)
      .single();

    if (!adminRecord) {
      return { authorized: false, userId: user.id };
    }

    const isRoleValid = adminRecord.role === "admin" || adminRecord.role === "superadmin";
    return { authorized: isRoleValid, userId: user.id };
  } catch {
    return { authorized: false };
  }
}

/**
 * Server Action: Authenticate administrator with email and password
 */
export async function loginAdmin(
  rawInput: FormData | AdminLoginInput
): Promise<AuthActionResult<{ redirectTo: string }>> {
  try {
    const data: Record<string, unknown> = {};

    if (rawInput instanceof FormData) {
      data.email = rawInput.get("email");
      data.password = rawInput.get("password");
      const redirectField = rawInput.get("redirectTo");
      if (redirectField) data.redirectTo = redirectField;
    } else {
      Object.assign(data, rawInput);
    }

    // 1. Zod Boundary Validation
    const validation = AdminLoginSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: "Please provide valid credentials.",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const { email, password, redirectTo } = validation.data;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url || url.includes("placeholder-project")) {
      // Local development fallback
      return {
        success: true,
        message: "Development login successful.",
        data: { redirectTo: redirectTo || "/admin" },
      };
    }

    // 2. Sign in with Supabase SSR server client
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        message: authError?.message || "Invalid email or password.",
      };
    }

    // 3. RBAC Verification
    let isAuthorized = false;

    // Check user metadata
    if (
      authData.user.app_metadata?.role === "admin" ||
      authData.user.user_metadata?.role === "admin"
    ) {
      isAuthorized = true;
    }

    // Check admin_users table
    if (!isAuthorized) {
      const { data: adminRecord } = await supabase
        .from("admin_users")
        .select("role, id")
        .or(`id.eq.${authData.user.id},email.eq.${email}`)
        .single();

      if (adminRecord && (adminRecord.role === "admin" || adminRecord.role === "superadmin")) {
        isAuthorized = true;

        // Auto-heal ID in admin_users if it was mismatched
        if (adminRecord.id !== authData.user.id) {
          await supabase
            .from("admin_users")
            .update({ id: authData.user.id, updated_at: new Date().toISOString() })
            .eq("email", email);
        }
      }
    }

    if (!isAuthorized) {
      // Sign user out immediately to prevent token retention
      await supabase.auth.signOut();
      return {
        success: false,
        message: "Access Denied: Your account does not possess administrator privileges.",
      };
    }

    revalidatePath("/admin", "layout");

    return {
      success: true,
      message: "Authentication successful.",
      data: { redirectTo: redirectTo || "/admin" },
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Authentication failed.",
    };
  }
}

/**
 * Server Action: Sign out administrator and clear session cookies
 */
export async function logoutAdmin(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url && !url.includes("placeholder-project")) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/admin/login");
}
