"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Check, Sparkles, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product, MediaVariant } from "@/types/product";

interface FurnitureCardProps {
  product: Product;
  onBookNow?: (product: Product, selectedVariant: MediaVariant) => void;
  className?: string;
}

/**
 * FurnitureCard — Client Component
 * 
 * Features:
 * - "Inside/Outside" ([ Bahar | Andar ]) instant view switcher without page navigation
 * - Color/Texture swatches dynamically swapping images
 * - Mobile thumb-friendly action zone with Amber "Book Now" CTA
 * - Soft contrasting background (Warm Ivory bg-[#F3EFE6], never pure white)
 */
export function FurnitureCard({ product, onBookNow, className }: FurnitureCardProps) {
  const { name, tagline, price, mrp, media, attributes } = product;

  // View state: 'outside' (Bahar) vs 'inside' (Andar)
  const [viewMode, setViewMode] = useState<"outside" | "inside">("outside");

  // Selected color swatch variant state (default to first variant)
  const [selectedVariant, setSelectedVariant] = useState<MediaVariant>(
    media.variants[0] || {
      id: "default",
      name: "Standard Finish",
      hex: "#1E3A8A",
      outsideImageUrl: media.outsideView,
      insideImageUrl: media.insideView,
    }
  );

  // Active image based on color swatch and inside/outside toggle
  const activeImageUrl =
    viewMode === "inside"
      ? selectedVariant.insideImageUrl || media.insideView
      : selectedVariant.outsideImageUrl || media.outsideView;

  // Calculate discount percentage if MRP exists
  const discountPercent =
    mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;

  const handleBookClick = () => {
    if (onBookNow) {
      onBookNow(product, selectedVariant);
    } else {
      // Default direct booking action
      const message = encodeURIComponent(
        `Namaste! I want to book ${product.name} (${selectedVariant.name}) for ₹${price.toLocaleString("en-IN")}. Please send details.`
      );
      window.open(`https://wa.me/919876543210?text=${message}`, "_blank");
    }
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl bg-[#F3EFE6] border border-[#E7E0D2] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden",
        className
      )}
    >
      {/* 1. Image Area (Min-height 250px) */}
      <div className="relative min-h-[260px] sm:min-h-[280px] w-full overflow-hidden bg-[#E8E2D4] flex items-center justify-center">
        {/* Main Product Image with Smooth Transition */}
        <div className="relative w-full h-[260px] sm:h-[280px]">
          <Image
            key={`${selectedVariant.id}-${viewMode}`}
            src={activeImageUrl}
            alt={`${name} — ${selectedVariant.name} (${viewMode === "outside" ? "Bahar ka view" : "Andar ka view"})`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-all duration-300 ease-out group-hover:scale-105"
            priority={false}
          />
        </div>

        {/* Top-Left Trust Badge / Discount Pill */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white bg-[#1E3A8A] shadow-md border border-white/20">
            <ShieldCheck className="w-3 h-3 text-[#D97706]" aria-hidden="true" />
            {attributes.gauge}
          </span>
          {discountPercent && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold text-[#FAF9F6] bg-[#D97706] shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Top-Right "Inside/Outside" ([ Bahar | Andar ]) Toggle Pill */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <div
            role="group"
            aria-label="Product view angle"
            className="inline-flex items-center p-0.5 rounded-full bg-[#1E3A8A]/90 backdrop-blur-md border border-white/25 shadow-lg"
          >
            <button
              type="button"
              onClick={() => setViewMode("outside")}
              aria-pressed={viewMode === "outside"}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-150 min-h-[30px] flex items-center justify-center cursor-pointer touch-manipulation",
                viewMode === "outside"
                  ? "bg-[#FAF9F6] text-[#1E3A8A] shadow-sm"
                  : "text-[#FAF9F6]/85 hover:text-white"
              )}
            >
              Bahar
            </button>
            <button
              type="button"
              onClick={() => setViewMode("inside")}
              aria-pressed={viewMode === "inside"}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-150 min-h-[30px] flex items-center justify-center cursor-pointer touch-manipulation",
                viewMode === "inside"
                  ? "bg-[#FAF9F6] text-[#1E3A8A] shadow-sm"
                  : "text-[#FAF9F6]/85 hover:text-white"
              )}
            >
              Andar
            </button>
          </div>
        </div>

        {/* View Indicator Label banner at bottom of image */}
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white/90 bg-black/50 backdrop-blur-xs">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            {viewMode === "outside" ? "Front Exterior" : "Internal Shelves & Locker"}
          </span>
        </div>
      </div>

      {/* 2. Color Swatches Area */}
      <div className="px-4 pt-3.5 pb-1 flex items-center justify-between border-b border-[#E7E0D2]/60">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider">
            Colors:
          </span>
          <div 
            className="flex items-center gap-2"
            role="radiogroup" 
            aria-label="Color options"
          >
            {media.variants.map((variant) => {
              const isSelected = selectedVariant.id === variant.id;

              return (
                <button
                  key={variant.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={variant.name}
                  onClick={() => setSelectedVariant(variant)}
                  style={{ backgroundColor: variant.hex }}
                  className={cn(
                    "relative w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-transform cursor-pointer touch-manipulation flex items-center justify-center active:scale-90",
                    isSelected
                      ? "ring-2 ring-offset-2 ring-[#1E3A8A] border-white scale-110 shadow-sm"
                      : "border-black/15 hover:scale-105"
                  )}
                >
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-white drop-shadow-md stroke-[3]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <span className="text-[11px] font-medium text-[#1E3A8A]/75 truncate max-w-[110px] text-right">
          {selectedVariant.name}
        </span>
      </div>

      {/* 3. Product Details Area */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1E3A8A] leading-snug line-clamp-1 hover:text-[#D97706] transition-colors">
            <Link href={`/product/${product.slug || "minimalist-3-door-wardrobe"}`}>
              {name}
            </Link>
          </h3>
          {tagline && (
            <p className="mt-0.5 text-xs text-[#1E3A8A]/75 line-clamp-1">
              {tagline}
            </p>
          )}

          {/* Quick specs pill row */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-[#1E3A8A]/80 font-medium">
            {attributes.lockType && (
              <span className="px-2 py-0.5 rounded bg-[#EAE3D5] border border-[#DDD5C5]">
                {attributes.lockType}
              </span>
            )}
            {attributes.warranty && (
              <span className="px-2 py-0.5 rounded bg-[#EAE3D5] border border-[#DDD5C5]">
                {attributes.warranty}
              </span>
            )}
          </div>
        </div>

        {/* 4. Action Zone: Price & Book Now CTA */}
        <div className="pt-2 border-t border-[#E7E0D2] flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-[#1E3A8A] tracking-tight">
                ₹{price.toLocaleString("en-IN")}
              </span>
              {mrp && (
                <span className="text-xs sm:text-sm text-[#1E3A8A]/50 line-through font-medium">
                  ₹{mrp.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-wide">
              Factory Direct Price
            </span>
          </div>

          {/* Full-width Amber "Book Now" Button (Min 44x44px touch target) */}
          <button
            type="button"
            onClick={handleBookClick}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl font-bold text-white bg-[#D97706] hover:bg-[#F59E0B] shadow-md shadow-amber-900/20 active:scale-[0.98] transition-all duration-150 text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706]"
          >
            <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Book Now • Pay on Delivery</span>
          </button>
        </div>
      </div>
    </article>
  );
}
