"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { InteractiveLinkCard } from "@/components/ui/InteractiveLinkCard";
import type { CategoryProduct } from "@/types/category";

export interface PremiumProductCardData extends Partial<CategoryProduct> {
  slug: string;
  category_slug?: string;
  title: string;
  price: number;
  lifestyle_image: string;
  available_colors: string[];
  specs?: string;
  tagline?: string;
  size_count?: number;
  finishes?: Array<{
    id: string;
    name: string;
    hex: string;
    imageUrl: string;
  }>;
}

interface PremiumCatalogCardProps {
  product: PremiumProductCardData;
  categorySlug?: string;
  className?: string;
  priority?: boolean;
}

/**
 * PremiumCatalogCard — Smart Interactive Catalog Card
 * 
 * - Tactile feedback via InteractiveLinkCard on card tap (zero dead-clicks)
 * - Interactive Color Swatch Preview: Tapping a swatch swaps card preview image in place without navigating
 * - Constrained height: mobile 2-per-screen grid (aspect-[4/5])
 * - Displays starting price from product_sizes, available size count (e.g. 2 Sizes), and tagline
 */
export function PremiumCatalogCard({
  product,
  categorySlug,
  className,
  priority = false,
}: PremiumCatalogCardProps) {
  const targetCategory = categorySlug || product.category_slug || "bedroom";
  const targetHref = `/categories/${targetCategory}/product/${product.slug}`;

  // Swatch preview state
  const hasFinishes = product.finishes && product.finishes.length > 0;
  const [activeFinishIndex, setActiveFinishIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState(
    hasFinishes ? product.finishes![0].imageUrl : product.lifestyle_image
  );

  const handleSwatchClick = (
    e: React.MouseEvent,
    imageUrl: string,
    index: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewImage(imageUrl);
    setActiveFinishIndex(index);
  };

  const sizeCount = product.size_count || 1;

  return (
    <InteractiveLinkCard
      href={targetHref}
      ariaLabel={`View ${product.title} details`}
      className={cn(
        "group flex flex-col gap-2 rounded-2xl bg-white border border-[#18181B]/8 p-2 sm:p-2.5 transition-all duration-300 hover:shadow-md hover:border-[#18181B]/20",
        className
      )}
    >
      {/* Image Area: aspect-[4/5] bounded frame */}
      <div className="aspect-[4/5] relative w-full overflow-hidden rounded-xl bg-[#F4F4F5]">
        <Image
          src={previewImage || product.lifestyle_image || "/hero-bedroom.png"}
          alt={product.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-all duration-500 ease-out group-hover:scale-105"
        />

        {/* Subtle top badge: Size count */}
        <div className="absolute top-2 left-2 z-10">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-black/45 text-white/95 backdrop-blur-sm border border-white/10">
            {sizeCount} {sizeCount === 1 ? "Size" : "Sizes"}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col gap-1.5 px-1 py-0.5">
        {/* Title & Price */}
        <div className="flex flex-col">
          <h3 className="text-xs sm:text-sm font-semibold text-[#18181B] truncate group-hover:text-[#9A3412] transition-colors leading-snug">
            {product.title}
          </h3>
          {product.tagline && (
            <p className="text-[10px] sm:text-[11px] text-[#71717A] line-clamp-1 font-light">
              {product.tagline}
            </p>
          )}
        </div>

        {/* Starting Price & Swatches Row */}
        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-[#18181B]/5 mt-0.5">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#71717A]">
              From
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#18181B] leading-none">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Interactive In-Card Color Swatches */}
          {hasFinishes ? (
            <div
              className="flex items-center gap-1"
              role="radiogroup"
              aria-label="Color options"
            >
              {product.finishes!.map((finish, idx) => {
                const isSelected = activeFinishIndex === idx;
                return (
                  <button
                    key={`${product.slug}-${finish.id}-${idx}`}
                    type="button"
                    onClick={(e) => handleSwatchClick(e, finish.imageUrl, idx)}
                    title={finish.name}
                    aria-label={`Preview in ${finish.name}`}
                    className={cn(
                      "w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border transition-all duration-150 cursor-pointer touch-manipulation hover:scale-115 shrink-0",
                      isSelected
                        ? "border-[#18181B] ring-2 ring-[#9A3412] ring-offset-1 scale-110 shadow-xs"
                        : "border-black/20 hover:border-black/50"
                    )}
                    style={{ backgroundColor: finish.hex }}
                  />
                );
              })}
            </div>
          ) : (
            product.available_colors && product.available_colors.length > 0 && (
              <div className="flex items-center gap-1">
                {product.available_colors.slice(0, 3).map((hex, idx) => (
                  <span
                    key={`${product.slug}-fallback-${idx}`}
                    className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </InteractiveLinkCard>
  );
}
