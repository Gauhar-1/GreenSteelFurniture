"use client";

import { cn } from "@/lib/utils";
import type { SubCategory } from "@/types/category";

interface SubCategoryFilterStripProps {
  subCategories: SubCategory[];
  activeSubCategory: string;
  onSelectSubCategory: (subCatId: string) => void;
  className?: string;
}

/**
 * SubCategoryFilterStrip — Client Component
 * 
 * Contextual Sub-department Filter:
 * - Rendered at top of /categories/[slug]/page.tsx
 * - Sticky below header: sticky top-16 md:top-20 z-30 bg-[#FAF8F5]/90 backdrop-blur-md py-4
 * - Horizontal scrollable row with scrollbars hidden
 * - Active: solid #18181B background with #FAF8F5 text
 * - Inactive: soft #18181B/15 border with #18181B text
 * - 44px minimum tap target for mobile thumbs
 */
export function SubCategoryFilterStrip({
  subCategories,
  activeSubCategory,
  onSelectSubCategory,
  className,
}: SubCategoryFilterStripProps) {
  return (
    <nav
      aria-label="Filter subcategories"
      className={cn(
        "sticky top-16 md:top-20 z-30 w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#18181B]/10 py-3.5 px-4 sm:px-8 transition-all",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center">
        <div
          role="tablist"
          aria-label="Subcategory options"
          className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full"
        >
          {subCategories.map((subCat) => {
            const isActive = activeSubCategory === subCat.id;

            return (
              <button
                key={subCat.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => onSelectSubCategory(subCat.id)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 shrink-0 min-h-[44px] cursor-pointer touch-manipulation select-none active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181B]",
                  isActive
                    ? "bg-[#18181B] text-[#FAF8F5] shadow-xs"
                    : "bg-white/70 text-[#18181B] border border-[#18181B]/15 hover:border-[#18181B]/40 hover:bg-white"
                )}
              >
                {subCat.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
