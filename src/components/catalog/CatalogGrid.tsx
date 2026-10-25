import { PremiumCatalogCard } from "./PremiumCatalogCard";
import type { CatalogProduct } from "@/types/catalog";
import { cn } from "@/lib/utils";

interface CatalogGridProps {
  products: CatalogProduct[];
  className?: string;
}

/**
 * CatalogGrid — Server / Pure Component
 * 
 * Luxury Editorial Grid Layout:
 * - Mobile: grid-cols-1 gap-y-8 px-4
 * - Desktop: md:grid-cols-2 lg:grid-cols-3 gap-8 px-8
 * - Minimum 44px tap targets and smooth transitions
 */
export function CatalogGrid({ products, className }: CatalogGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
        <p className="text-sm font-medium text-[#71717A]">
          No pieces match the selected filter.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-y-8 px-4 md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:px-8 max-w-7xl mx-auto w-full",
        className
      )}
    >
      {products.map((product, idx) => (
        <PremiumCatalogCard
          key={product.slug}
          product={product}
          priority={idx < 3}
        />
      ))}
    </div>
  );
}
