import React from "react";

export default function CategoriesLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Category Manager Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#18181B]/10">
        <div className="space-y-1.5">
          <div className="h-3.5 w-36 bg-[#9A3412]/15 rounded animate-pulse" />
          <div className="h-8 w-60 bg-[#18181B]/15 rounded-xl animate-pulse" />
          <div className="h-3.5 w-80 bg-[#18181B]/10 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-36 bg-[#18181B]/15 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Blueprint Filter Pills Skeleton */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-9 w-28 rounded-xl bg-white border border-[#18181B]/10 animate-pulse shrink-0"
          />
        ))}
      </div>

      {/* Tree View Hierarchy Skeleton */}
      <div className="bg-white rounded-3xl border border-[#18181B]/10 p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#18181B]/10">
          <div className="h-4 w-44 bg-[#18181B]/15 rounded animate-pulse" />
          <div className="h-4 w-28 bg-[#18181B]/10 rounded animate-pulse" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4].map((parent) => (
            <div
              key={parent}
              className="rounded-2xl border border-[#18181B]/10 p-4 space-y-3 bg-[#FAF8F5]/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#18181B]/10 animate-pulse" />
                  <div className="w-12 h-12 rounded-xl bg-[#18181B]/15 animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-4 w-36 bg-[#18181B]/15 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-[#18181B]/5 rounded animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-16 bg-[#18181B]/10 rounded-lg animate-pulse" />
                  <div className="h-7 w-8 bg-[#18181B]/10 rounded-lg animate-pulse" />
                </div>
              </div>

              {/* Child indent skeleton */}
              <div className="ml-10 pl-4 border-l-2 border-[#18181B]/10 space-y-2">
                {[1, 2].map((child) => (
                  <div
                    key={child}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#18181B]/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#18181B]/10 animate-pulse" />
                      <div className="h-3.5 w-28 bg-[#18181B]/15 rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-14 bg-[#18181B]/10 rounded-md animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
