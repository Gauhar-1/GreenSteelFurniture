"use client";

import { useState, useMemo } from "react";
import { VisualFilterStrip } from "@/components/catalog/VisualFilterStrip";
import { FurnitureCard } from "@/components/catalog/FurnitureCard";
import { CheckoutDrawer } from "@/components/checkout/CheckoutDrawer";
import type { Product, FilterPill, MediaVariant } from "@/types/product";
import { RotateCcw } from "lucide-react";

interface CatalogClientViewProps {
  initialProducts: Product[];
  filterPills: FilterPill[];
}

/**
 * CatalogClientView — Client Component
 * 
 * Coordinates the visual filter strip with the responsive product grid:
 * - Mobile: 1 column (grid-cols-1)
 * - Tablet: 2 columns (sm:grid-cols-2)
 * - Desktop: 3 columns (md:grid-cols-3)
 * - Seamless slide-up checkout drawer integration
 */
export function CatalogClientView({
  initialProducts,
  filterPills,
}: CatalogClientViewProps) {
  const [activeTag, setActiveTag] = useState<string>("all");
  const [checkoutTarget, setCheckoutTarget] = useState<{
    product: Product;
    variant: MediaVariant;
  } | null>(null);

  // Filter products based on selected visual tag
  const filteredProducts = useMemo(() => {
    if (activeTag === "all") {
      return initialProducts;
    }
    return initialProducts.filter((product) =>
      product.attributes.tags.some(
        (tag) => tag.toLowerCase() === activeTag.toLowerCase()
      )
    );
  }, [initialProducts, activeTag]);

  return (
    <div className="w-full flex flex-col bg-[#FAF9F6]">
      {/* 1. Sticky Visual Filter Strip */}
      <VisualFilterStrip
        filters={filterPills}
        activeTag={activeTag}
        onSelectTag={setActiveTag}
      />

      {/* 2. Catalog Content Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Active Filter Status & Product Counter */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <p className="text-xs sm:text-sm font-semibold text-[#1E3A8A]">
            Showing{" "}
            <span className="text-[#D97706] font-bold">
              {filteredProducts.length}
            </span>{" "}
            of {initialProducts.length} Models
          </p>

          {activeTag !== "all" && (
            <button
              type="button"
              onClick={() => setActiveTag("all")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D97706] hover:text-[#1E3A8A] transition-colors cursor-pointer min-h-[32px] touch-manipulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        {/* 3. Responsive Product Grid: grid-cols-1 on mobile, md:grid-cols-3 on desktop */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-6">
            {filteredProducts.map((product) => (
              <FurnitureCard
                key={product.id}
                product={product}
                onBookNow={(prod, variant) =>
                  setCheckoutTarget({ product: prod, variant })
                }
              />
            ))}
          </div>
        ) : (
          /* Empty Filter State */
          <div className="flex flex-col items-center justify-center p-10 sm:p-16 rounded-2xl bg-[#F3EFE6] border border-[#E7E0D2] text-center my-6">
            <h3 className="text-lg font-bold text-[#1E3A8A]">
              No models match this filter
            </h3>
            <p className="mt-1 text-sm text-[#1E3A8A]/70 max-w-sm">
              Try selecting another tag or reset to view our complete heavy-gauge steel collection.
            </p>
            <button
              type="button"
              onClick={() => setActiveTag("all")}
              className="mt-4 px-5 py-2.5 rounded-xl font-bold text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 transition-all text-sm min-h-[44px]"
            >
              Show All Models
            </button>
          </div>
        )}
      </div>

      {/* 4. Slide-Up Token Advance Checkout Drawer */}
      <CheckoutDrawer
        isOpen={!!checkoutTarget}
        onClose={() => setCheckoutTarget(null)}
        product={checkoutTarget?.product ?? null}
        selectedVariant={checkoutTarget?.variant ?? null}
      />
    </div>
  );
}
