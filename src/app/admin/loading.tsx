import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Studio Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#18181B]/10">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-[#18181B]/10 rounded-md animate-pulse" />
          <div className="h-8 w-64 bg-[#18181B]/15 rounded-xl animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-[#18181B]/10 rounded-xl animate-pulse" />
          <div className="h-10 w-36 bg-[#18181B]/15 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* KPI Stat Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-[#18181B]/10 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-[#18181B]/10 rounded animate-pulse" />
              <div className="w-8 h-8 rounded-lg bg-[#9A3412]/10 animate-pulse" />
            </div>
            <div className="h-7 w-24 bg-[#18181B]/15 rounded-lg animate-pulse" />
            <div className="h-2.5 w-32 bg-[#18181B]/5 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Table / Grid Container Skeleton */}
      <div className="bg-white rounded-3xl border border-[#18181B]/10 p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-[#18181B]/15 rounded-md animate-pulse" />
          <div className="h-9 w-64 bg-[#18181B]/10 rounded-xl animate-pulse" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between p-4 rounded-xl bg-[#FAF8F5]/80 border border-[#18181B]/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#18181B]/10 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 bg-[#18181B]/15 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-[#18181B]/5 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-20 bg-[#18181B]/10 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
