"use client";

import { useState, useMemo } from "react";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import { VisualFilterStrip } from "./VisualFilterStrip";
import { CatalogGrid } from "./CatalogGrid";
import type { CatalogProduct, FilterPillItem } from "@/types/catalog";

interface CatalogPageClientProps {
  initialProducts: CatalogProduct[];
  filters: FilterPillItem[];
}

/**
 * CatalogPageClient — Client Component
 * 
 * Coordinates the visual filter strip with the editorial catalog grid:
 * - Instant client-side filtering by category/tag without full page reloads
 * - Displays active filter pill and item count
 * - Minimal, editorial aesthetic (Warm Alabaster #FAF8F5, Deep Espresso #18181B, Warm Bronze #9A3412)
 */
export function CatalogPageClient({
  initialProducts,
  filters,
}: CatalogPageClientProps) {
  const [activeTag, setActiveTag] = useState<string>("all");

  // Dynamic filtering based on active tag
  const filteredProducts = useMemo(() => {
    if (activeTag === "all") {
      return initialProducts;
    }
    return initialProducts.filter((product) =>
      product.tags.includes(activeTag)
    );
  }, [initialProducts, activeTag]);

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-10 pb-20">
      {/* Editorial Catalog Hero Header */}
      <section className="pt-8 sm:pt-12 px-4 sm:px-8 max-w-7xl mx-auto w-full text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#18181B]/10 pb-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#9A3412]">
            Pure Steel Showroom
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#18181B] tracking-tight leading-tight">
            The Architectural Collection
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] max-w-xl">
            Heavy-gauge pure steel furniture engineered for Indian homes. 100% rust-proof, zero wood-rot, integrated vault lockers.
          </p>
        </div>

        {/* Counter & Status */}
        <div className="flex items-center justify-center sm:justify-end gap-2 text-xs font-medium text-[#71717A]">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Showing {filteredProducts.length} pieces</span>
        </div>
      </section>

      {/* Component 1: VisualFilterStrip (Sticky) */}
      <VisualFilterStrip
        filters={filters}
        activeTag={activeTag}
        onSelectTag={setActiveTag}
      />

      {/* Component 3: CatalogGrid */}
      <main>
        <CatalogGrid products={filteredProducts} />
      </main>
    </div>
  );
}
