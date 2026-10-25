import React from "react";

export default function ProductsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#18181B]/10">
        <div className="space-y-1.5">
          <div className="h-3.5 w-36 bg-[#9A3412]/15 rounded animate-pulse" />
          <div className="h-8 w-60 bg-[#18181B]/15 rounded-xl animate-pulse" />
          <div className="h-3.5 w-72 bg-[#18181B]/10 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-36 bg-[#18181B]/15 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="h-10 flex-1 min-w-[200px] bg-white rounded-xl border border-[#18181B]/10 animate-pulse" />
        <div className="h-10 w-44 bg-white rounded-xl border border-[#18181B]/10 animate-pulse" />
        <div className="h-10 w-32 bg-white rounded-xl border border-[#18181B]/10 animate-pulse" />
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white border border-[#18181B]/10 overflow-hidden shadow-2xs space-y-3 p-3.5"
          >
            <div className="relative aspect-4/3 w-full rounded-xl bg-[#18181B]/5 overflow-hidden animate-pulse" />
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-[#18181B]/10 rounded animate-pulse" />
                <div className="h-3 w-14 bg-emerald-100 rounded animate-pulse" />
              </div>
              <div className="h-4.5 w-40 bg-[#18181B]/15 rounded-md animate-pulse" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-5 w-24 bg-[#18181B]/20 rounded animate-pulse" />
                <div className="h-7 w-16 bg-[#18181B]/10 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
