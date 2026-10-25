"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { loginAdmin } from "@/actions/authActions";
import { cn } from "@/lib/utils";

export function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";
  const authErrorParam = searchParams.get("auth_error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [errorMessage, setErrorMessage] = useState<string | null>(
    authErrorParam === "admin_required"
      ? "Administrator privileges are required to access the requested portal."
      : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    startTransition(async () => {
      const res = await loginAdmin({
        email,
        password,
        redirectTo,
      });

      if (!res.success) {
        setErrorMessage(res.message || "Invalid email or password.");
        return;
      }

      setSuccessMessage("Authentication successful. Redirecting to Studio...");
      const destination = res.data?.redirectTo || redirectTo || "/admin";

      // Allow session cookies to sync before pushing route
      setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 400);
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative selection:bg-[#9A3412]/20">
      {/* Background Architectural Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#18181B 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top Header / Return link */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#71717A] hover:text-[#18181B] transition-colors"
        >
          <span>&larr; Return to Storefront</span>
        </Link>
        <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider">
          CRCA Pure Steel
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10">
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#18181B]/10 shadow-xl shadow-black/5 space-y-7">
          {/* Brand & Badge Header */}
          <div className="text-center space-y-2.5">
            <div className="w-13 h-13 rounded-2xl bg-[#18181B] mx-auto flex items-center justify-center text-white shadow-md relative group">
              <Layers className="w-6 h-6 text-[#FAF8F5]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#9A3412] border-2 border-white" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#9A3412] uppercase">
                Management Console
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#18181B] tracking-tight mt-0.5">
                Admin Studio
              </h1>
              <p className="text-xs text-[#71717A] mt-1 max-w-xs mx-auto">
                Sign in with authorized credentials to manage steel furniture blueprints and orders.
              </p>
            </div>
          </div>

          {/* Error / Alert Message Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-950 flex items-start gap-2.5 text-xs animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Notification Banner */}
          {successMessage && (
            <div
              role="status"
              className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2.5 text-xs animate-in fade-in duration-200"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#18181B]"
              >
                Staff Email *
              </label>
              <div className="relative rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/40 overflow-hidden focus-within:border-[#9A3412] focus-within:ring-2 focus-within:ring-[#9A3412]/10 transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  required
                  autoFocus
                  autoComplete="email"
                  autoCapitalize="none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@greensteelfurniture.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-transparent text-xs text-[#18181B] font-medium placeholder:text-[#71717A]/60 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="admin-password"
                  className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#18181B]"
                >
                  Security Passphrase *
                </label>
              </div>
              <div className="relative rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/40 overflow-hidden focus-within:border-[#9A3412] focus-within:ring-2 focus-within:ring-[#9A3412]/10 transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-transparent text-xs text-[#18181B] font-medium placeholder:text-[#71717A]/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "w-full mt-2 py-3.5 px-4 rounded-xl bg-[#18181B] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer",
                isPending
                  ? "opacity-80 cursor-not-allowed bg-[#18181B]"
                  : "hover:bg-[#9A3412] hover:shadow-md"
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Card Footer Security Indicator */}
          <div className="pt-4 border-t border-[#18181B]/10 flex items-center justify-center gap-2 text-[11px] text-[#71717A]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-bit SSL Session • Row-Level Security Protected</span>
          </div>
        </div>
      </div>

      {/* Footer System Info */}
      <div className="w-full max-w-md mx-auto text-center text-[10px] text-[#71717A] font-mono z-10">
        Green Steel Furniture &copy; {new Date().getFullYear()} • Production RBAC v2.4
      </div>
    </div>
  );
}
