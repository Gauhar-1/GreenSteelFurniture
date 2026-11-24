import { CatalogGridSkeleton } from "@/components/catalog/CatalogGridSkeleton";

/**
 * Loading skeleton for /categories/[slug]
 * 
 * Displayed while server resolves master category, child categories,
 * and pre-filtered product catalog items.
 */
export default function CategorySlugLoading() {
  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24 flex flex-col">
      {/* Header Skeleton */}
      <div className="w-full border-b border-black/8 px-4 sm:px-6 lg:px-8 pt-4 pb-4 bg-white/60 animate-pulse">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-stone-200 rounded-full" />
            <div className="h-5 w-24 bg-stone-200 rounded-full" />
          </div>
          <div className="h-8 w-64 bg-stone-200 rounded-lg" />
          <div className="h-3 w-80 max-w-full bg-stone-200 rounded-md" />
        </div>
      </div>

      {/* Subcategory Filter Strip Skeleton */}
      <div className="border-b border-black/5 bg-[#FAF8F5]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-2 overflow-x-hidden">
          <div className="h-7 w-20 bg-stone-200 rounded-full shrink-0 animate-pulse" />
          <div className="h-7 w-24 bg-stone-200 rounded-full shrink-0 animate-pulse" />
          <div className="h-7 w-28 bg-stone-200 rounded-full shrink-0 animate-pulse" />
          <div className="h-7 w-24 bg-stone-200 rounded-full shrink-0 animate-pulse" />
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <CatalogGridSkeleton count={8} />
    </div>
  );
}
