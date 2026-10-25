import React from "react";

export function FurnitureCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl animate-pulse">
      {/* 4:5 Aspect Image Skeleton */}
      <div className="aspect-[4/5] w-full rounded-xl bg-[#EDE9E1] shadow-2xs relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>

      {/* Typography & Price Skeleton */}
      <div className="flex flex-col gap-2 px-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <div className="h-4.5 w-3/5 bg-[#18181B]/10 rounded-md" />
          <div className="h-4 w-1/4 bg-[#18181B]/10 rounded-md" />
        </div>

        {/* Swatches Skeleton */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <div className="w-3.5 h-3.5 rounded-full bg-[#18181B]/10" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#18181B]/10" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#18181B]/10" />
        </div>
      </div>
    </div>
  );
}

export function CatalogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {Array.from({ length: count }).map((_, i) => (
          <FurnitureCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
