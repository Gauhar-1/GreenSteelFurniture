import React from "react";

export default function StorefrontLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Studio Header & Tab Switcher Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#18181B]/10">
        <div className="space-y-1.5">
          <div className="h-3.5 w-40 bg-[#9A3412]/15 rounded animate-pulse" />
          <div className="h-8 w-64 bg-[#18181B]/15 rounded-xl animate-pulse" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#18181B]/10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 w-24 rounded-xl bg-[#18181B]/5 animate-pulse"
              />
            ))}
          </div>
          <div className="h-8 w-20 rounded-xl bg-emerald-50 border border-emerald-200 animate-pulse" />
          <div className="h-8 w-32 rounded-xl bg-[#9A3412]/20 animate-pulse" />
        </div>
      </div>

      {/* Editor Main Canvas Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#18181B]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-44 bg-[#18181B]/15 rounded animate-pulse" />
              <div className="h-3 w-64 bg-[#18181B]/5 rounded animate-pulse" />
            </div>
            <div className="h-8 w-32 rounded-xl bg-[#18181B]/10 animate-pulse" />
          </div>

          <div className="relative aspect-video w-full rounded-2xl bg-[#18181B]/5 border border-[#18181B]/10 overflow-hidden flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[#9A3412]/10 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#9A3412] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#18181B]/10 shadow-xs space-y-4">
          <div className="h-4 w-32 bg-[#18181B]/15 rounded animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map((j) => (
              <div
                key={j}
                className="p-3 rounded-xl bg-[#FAF8F5] border border-[#18181B]/5 space-y-2"
              >
                <div className="h-3.5 w-24 bg-[#18181B]/10 rounded animate-pulse" />
                <div className="h-8 w-full bg-[#18181B]/5 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
