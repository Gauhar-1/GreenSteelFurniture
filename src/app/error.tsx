"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, Home } from "lucide-react";
import { BrandLoader } from "@/components/ui/BrandLoader";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to telemetry or developer console without exposing raw database strings to users
    console.error("[Storefront Error Boundary]:", error);
  }, [error]);

  return (
    <main className="min-h-[75dvh] flex items-center justify-center px-6 py-20 bg-[#FAF8F5]">
      <div className="max-w-md w-full text-center space-y-6">
        {/* GS Monogram Mark */}
        <div className="flex justify-center">
          <div className="w-16 h-16">
            <BrandLoader variant="inline" showLabel={false} className="w-16 h-16" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#9A3412]">
            Temporary Interruption
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#18181B] tracking-tight">
            Something Paused This View
          </h1>
          <p className="text-sm text-[#71717A] leading-relaxed pt-1">
            We encountered an unexpected issue while loading this showroom gallery. Our engineering team has been notified, and no order data was lost.
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] bg-[#18181B] hover:bg-[#163826] transition-colors shadow-xs cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#18181B] border border-[#18181B]/15 hover:border-[#18181B] bg-white transition-colors shadow-2xs"
          >
            <Home className="w-3.5 h-3.5 text-[#163826]" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

