"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, LayoutDashboard } from "lucide-react";
import { BrandLoader } from "@/components/ui/BrandLoader";

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Studio Error Boundary]:", error);
  }, [error]);

  return (
    <main className="min-h-[75dvh] flex items-center justify-center px-6 py-20 bg-[#F4F4F5]">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-zinc-200/80 shadow-sm text-center space-y-6">
        {/* GS Monogram Mark */}
        <div className="flex justify-center">
          <div className="w-14 h-14">
            <BrandLoader variant="inline" showLabel={false} className="w-14 h-14" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#9A3412]">
            Admin Studio Exception
          </span>
          <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">
            Studio Encountered an Issue
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed pt-1">
            An unexpected error occurred in this management module. Reload the view or return to the main dashboard.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-zinc-400">
              Reference Code: {error.digest}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Reload Studio</span>
          </button>
          <Link
            href="/admin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-zinc-800 border border-zinc-200 hover:border-zinc-400 bg-white transition-colors shadow-2xs"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#163826]" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

