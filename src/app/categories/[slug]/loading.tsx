import React from "react";

export default function CategorySlugLoading() {
  return (
    <div className="w-full flex flex-col gap-5 pb-20 animate-pulse">
      {/* Compact Atmospheric Header Skeleton */}
      <div className="w-full bg-[#EDE9E1]/80 border-b border-[#18181B]/10 py-6 px-4 sm:px-8 h-[18dvh] md:h-[20vh] flex flex-col justify-between max-w-7xl mx-auto rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div className="h-3 w-32 bg-[#18181B]/10 rounded-full" />
          <div className="h-3 w-16 bg-[#18181B]/10 rounded-full" />
        </div>
        <div>
          <div className="h-7 w-52 bg-[#18181B]/15 rounded-xl mb-1.5" />
          <div className="h-3.5 w-72 bg-[#18181B]/10 rounded-md" />
        </div>
      </div>

      {/* Filter Strip Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full flex items-center gap-2 overflow-x-auto py-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-[#18181B]/10 rounded-full shrink-0" />
        ))}
      </div>

      {/* 2-col Mobile / 4-col Desktop Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2.5">
              <div className="aspect-[4/5] w-full rounded-2xl bg-[#EDE9E1] shadow-2xs" />
              <div className="h-4 w-3/4 bg-[#18181B]/10 rounded-md" />
              <div className="h-3 w-1/3 bg-[#18181B]/10 rounded-md" />
              <div className="flex gap-1 pt-0.5">
                <div className="w-3 h-3 rounded-full bg-[#18181B]/10" />
                <div className="w-3 h-3 rounded-full bg-[#18181B]/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
