import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Update session cookies & verify user credentials
  const { response, user, isAdmin, isConfigured } = await updateSession(request);

  // If Supabase is not configured (offline / local development mode), allow through
  if (!isConfigured) {
    return response;
  }

  // Allow test automation in non-production environments
  if (
    process.env.NODE_ENV !== "production" &&
    (request.headers.get("x-test-bypass") === "admin" ||
      request.cookies.get("playwright_test_admin")?.value === "true")
  ) {
    return response;
  }

  const isLoginPage = pathname === "/admin/login";

  // 1. Unauthenticated user trying to access protected /admin routes
  if (!user && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("redirectTo", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated admin visiting login page -> forward to dashboard
  if (user && isLoginPage) {
    const destinationUrl = request.nextUrl.clone();
    destinationUrl.pathname = isAdmin ? "/admin" : "/";
    destinationUrl.searchParams.delete("redirectTo");
    return NextResponse.redirect(destinationUrl);
  }

  // 3. Authenticated standard user (non-admin) trying to access /admin -> redirect to storefront
  if (user && !isAdmin && !isLoginPage) {
    const storefrontUrl = request.nextUrl.clone();
    storefrontUrl.pathname = "/";
    storefrontUrl.searchParams.set("auth_error", "admin_required");
    return NextResponse.redirect(storefrontUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all /admin paths:
     * - /admin
     * - /admin/:path*
     */
    "/admin/:path*",
  ],
};
