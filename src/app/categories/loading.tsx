import React from "react";

export default function CategoriesLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2 max-w-lg">
        <div className="h-3 w-28 bg-[#18181B]/10 rounded-full" />
        <div className="h-8 w-64 bg-[#18181B]/10 rounded-xl" />
        <div className="h-3.5 w-full bg-[#18181B]/10 rounded-md" />
      </div>

      {/* Viewport-fitted 2x2 Bento Skeleton on Desktop / Vertical Stack on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full lg:h-[calc(100vh-13rem)]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-full h-[25dvh] md:h-full rounded-3xl bg-[#EDE9E1] relative overflow-hidden border border-[#18181B]/5 flex flex-col justify-end p-6"
          >
            <div className="h-3 w-20 bg-black/15 rounded-full mb-2" />
            <div className="h-6 w-44 bg-black/20 rounded-lg mb-1.5" />
            <div className="h-3 w-60 bg-black/10 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
