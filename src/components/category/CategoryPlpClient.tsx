"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { SubCategoryFilterStrip } from "./SubCategoryFilterStrip";
import { PremiumCatalogCard } from "@/components/catalog/PremiumCatalogCard";
import { getCategoryTheme } from "@/lib/categoryThemes";
import type { MasterCategory, CategoryProduct } from "@/types/category";

interface CategoryPlpClientProps {
  category: MasterCategory;
  products: CategoryProduct[];
}

/**
 * CategoryPlpClient — Viewport-Proportioned Showroom
 * 
 * - Compact Atmospheric Header (<= 18dvh mobile / 22vh desktop)
 * - Dynamic Category Theme with mood badge & accent colors
 * - Sticky SubCategoryFilterStrip with instant filtering
 * - 2-col mobile grid (fits 2 full cards per screen) / 4-col desktop
 */
export function CategoryPlpClient({
  category,
  products,
}: CategoryPlpClientProps) {
  const [activeSubCategory, setActiveSubCategory] = useState<string>("all");
  const theme = getCategoryTheme(category.slug);

  const filteredProducts = useMemo(() => {
    if (activeSubCategory === "all") {
      return products;
    }
    return products.filter((p) => p.sub_category === activeSubCategory);
  }, [products, activeSubCategory]);

  return (
    <div
      className="w-full min-h-screen flex flex-col pb-24 transition-colors duration-300"
      style={{ backgroundColor: theme.bgSurface }}
    >
      {/* Compact Atmospheric Header (< 18dvh on mobile / 22vh on desktop) */}
      <header
        className="w-full border-b border-black/8 px-4 sm:px-6 lg:px-8 pt-3 pb-3 sm:pb-4 shrink-0 transition-colors"
        style={{
          background: `linear-gradient(180deg, ${theme.bgCard} 0%, ${theme.bgSurface} 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          {/* Top Breadcrumb & Mood Badge */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-[#71717A]">
              <Link
                href="/categories"
                className="hover:text-[#18181B] transition-colors flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Collections</span>
              </Link>
              <ChevronRight className="w-3 h-3 text-[#18181B]/20" />
              <span className="text-[#18181B] font-semibold truncate max-w-[140px] sm:max-w-none">
                {category.name}
              </span>
            </div>

            {/* Mood Pill */}
            <div
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wide border shadow-2xs"
              style={{
                backgroundColor: theme.badgeBg,
                color: theme.badgeText,
                borderColor: theme.borderTint,
              }}
            >
              <Sparkles className="w-3 h-3" />
              <span>{theme.moodLabel}</span>
              {theme.moodLabelHi && (
                <span className="hidden md:inline opacity-75">
                  • {theme.moodLabelHi}
                </span>
              )}
            </div>
          </div>

          {/* Bilingual Title & Subtitle */}
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#18181B] tracking-tight leading-none">
                {category.name}
              </h1>
              {category.name_hi && (
                <span className="text-xs sm:text-sm font-sans text-[#71717A] font-medium">
                  {category.name_hi}
                </span>
              )}
            </div>

            <span className="text-xs font-semibold text-[#71717A] shrink-0">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Piece" : "Pieces"}
            </span>
          </div>

          {/* Concise Tagline */}
          <p className="text-[11px] sm:text-xs text-[#71717A] line-clamp-1 font-light">
            {category.tagline}
          </p>
        </div>
      </header>

      {/* Sticky SubCategory Filter Strip */}
      <SubCategoryFilterStrip
        subCategories={category.sub_categories}
        activeSubCategory={activeSubCategory}
        onSelectSubCategory={setActiveSubCategory}
      />

      {/* Product Showroom Grid */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full pt-4 sm:pt-6">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
            <p className="text-sm font-medium text-[#71717A]">
              No architectural pieces found in this department.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
            {filteredProducts.map((product, idx) => (
              <PremiumCatalogCard
                key={product.slug}
                product={product}
                categorySlug={category.slug}
                priority={idx < 4}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
