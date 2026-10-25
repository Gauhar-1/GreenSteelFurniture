import React from "react";

export default function RootLoading() {
  return (
    <div className="w-full min-h-[85vh] flex flex-col justify-between p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Hero Showcase Skeleton */}
      <div className="relative aspect-16/10 sm:aspect-16/9 w-full rounded-3xl bg-[#EDE9E1] overflow-hidden border border-[#18181B]/5 p-6 sm:p-12 flex flex-col justify-end">
        <div className="space-y-4 max-w-xl">
          <div className="h-4 w-32 bg-black/10 rounded-full animate-pulse" />
          <div className="h-10 sm:h-14 w-full bg-black/15 rounded-2xl animate-pulse" />
          <div className="h-4 w-3/4 bg-black/10 rounded-md animate-pulse" />
          <div className="flex items-center gap-3 pt-2">
            <div className="h-11 w-40 rounded-full bg-[#9A3412]/20 animate-pulse" />
            <div className="h-11 w-32 rounded-full bg-black/10 animate-pulse" />
          </div>
        </div>

        {/* Hotspot shimmer dot */}
        <div className="hidden sm:block absolute top-1/3 right-1/4 w-10 h-10 rounded-full bg-white/40 border border-white/60 animate-ping" />
      </div>

      {/* Bento Grid Preview Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-white border border-[#18181B]/10 p-6 flex flex-col justify-end space-y-2 shadow-2xs"
          >
            <div className="h-3 w-20 bg-[#18181B]/10 rounded animate-pulse" />
            <div className="h-6 w-36 bg-[#18181B]/15 rounded-md animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
