"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Pencil,
  ArrowUpRight,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Ruler,
} from "lucide-react";
import { type ProductCatalogItem } from "@/services/ProductService";
import { BlueprintScaleChart } from "@/components/pdp/BlueprintScaleChart";
import { resolveBlueprintType } from "@/lib/blueprintUtils";
import { cn } from "@/lib/utils";

interface AdminProductCardProps {
  product: ProductCatalogItem;
  onDelete?: (id: string, title: string) => void;
}

/**
 * AdminProductCard — Interactive Furniture Card with Live Media & Blueprint Mini-Carousel
 * 
 * Features:
 * - Slides through up to 3 uploaded finish photos
 * - Renders the live Parametric SVG Blueprint as the final slide with exact dimensions
 * - Left/Right chevrons and interactive dot indicators with tiny blueprint icon
 */
export function AdminProductCard({ product, onDelete }: AdminProductCardProps) {
  const defaultFinish =
    product.finishes?.find((f) => f.is_default) || product.finishes?.[0];

  // Extract up to 3 valid uploaded photos
  const imageSlides = useMemo<string[]>(() => {
    const mediaObj = defaultFinish?.media || {};
    const slides: string[] = [];
    const checkAndAdd = (url?: unknown) => {
      if (
        typeof url === "string" &&
        url.trim() &&
        !url.includes("undefined") &&
        !url.includes("null") &&
        !slides.includes(url.trim())
      ) {
        slides.push(url.trim());
      }
    };

    const record = mediaObj as Record<string, string>;
    checkAndAdd(record.lifestyle || record.lifestyle_image);
    checkAndAdd(record.front || record.studio || record.studio_front_image);
    checkAndAdd(record.functional || record.inside || record.functional_view_image);
    checkAndAdd(record.macro || record.macro_detail_image);

    if (slides.length === 0) {
      slides.push("/bento-wardrobe-navy.png");
    }
    return slides.slice(0, 3);
  }, [defaultFinish]);

  // Total slides = images + 1 live blueprint slide
  const totalSlides = imageSlides.length + 1;
  const [activeSlide, setActiveSlide] = useState(0);
  const isBlueprintSlide = activeSlide === imageSlides.length;

  // Resolve Blueprint Archetype
  const resolvedBlueprint = useMemo(() => {
    return resolveBlueprintType(
      product.blueprint_type,
      product.category?.blueprint_type,
      `${product.title_en} ${product.category?.name_en || ""}`
    );
  }, [product.blueprint_type, product.category?.blueprint_type, product.title_en, product.category?.name_en]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#18181B]/10 p-3.5 space-y-3 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
      {/* ======================================================== */}
      {/* 1. INTERACTIVE MINI-CAROUSEL MEDIA AREA                  */}
      {/* ======================================================== */}
      <div className="relative w-full aspect-16/10 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#18181B]/10 group select-none">
        {/* Slide Content: Photos or Live Blueprint */}
        {!isBlueprintSlide ? (
          <div className="relative w-full h-full">
            <Image
              src={imageSlides[activeSlide]}
              alt={`${product.title_en} - Slide ${activeSlide + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 380px"
              className="object-cover transition-all duration-300"
            />
            {/* Slide Index Badge */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-md text-[9px] font-mono font-semibold">
              Photo {activeSlide + 1}/{imageSlides.length}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-between bg-[#FAF8F5]">
            <BlueprintScaleChart
              compact
              blueprintType={resolvedBlueprint}
              selectedSize={product.sizes?.[0]}
              productTitle={product.title_en}
              className="w-full h-full border-0 rounded-none shadow-none bg-transparent"
            />
          </div>
        )}

        {/* Carousel Chevrons */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous slide"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 hover:bg-white text-[#18181B] flex items-center justify-center border border-black/10 shadow-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:scale-105 active:scale-95 z-10"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next slide"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 hover:bg-white text-[#18181B] flex items-center justify-center border border-black/10 shadow-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:scale-105 active:scale-95 z-10"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Bottom Pagination Dots Strip */}
        {totalSlides > 1 && (
          <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-auto">
            {Array.from({ length: totalSlides }).map((_, i) => {
              const isActive = activeSlide === i;
              const isBlueprint = i === imageSlides.length;

              return (
                <button
                  key={i}
                  type="button"
                  aria-label={isBlueprint ? "View Blueprint Scale Chart" : `View photo ${i + 1}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveSlide(i);
                  }}
                  className={cn(
                    "transition-all duration-200 cursor-pointer flex items-center justify-center rounded-full touch-manipulation",
                    isBlueprint
                      ? isActive
                        ? "px-1.5 py-0.5 bg-[#18181B] text-white text-[8px] font-mono font-bold shadow-xs"
                        : "px-1.5 py-0.5 bg-white/90 text-[#9A3412] hover:bg-white text-[8px] font-mono font-bold border border-[#9A3412]/30 shadow-2xs"
                      : isActive
                      ? "w-4 h-1.5 bg-[#18181B] shadow-xs"
                      : "w-1.5 h-1.5 bg-black/30 hover:bg-black/60"
                  )}
                >
                  {isBlueprint ? (
                    <span className="flex items-center gap-0.5">
                      <Ruler className="w-2.5 h-2.5" />
                      <span>CAD</span>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. PRODUCT IDENTITY & ATTRIBUTES                        */}
      {/* ======================================================== */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-mono text-[#9A3412] uppercase tracking-wider truncate">
            {product.category?.name_en || "General"}
          </span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0",
              product.is_active
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-gray-100 text-gray-700"
            )}
          >
            {product.is_active ? "Active" : "Draft"}
          </span>
        </div>

        <h4 className="text-sm font-bold text-[#18181B] truncate" title={product.title_en}>
          {product.title_en}
        </h4>

        <div className="flex items-baseline justify-between pt-0.5">
          <div className="text-sm font-bold text-[#18181B] font-mono">
            ₹{Number(product.base_price).toLocaleString("en-IN")}
          </div>

          <span className="text-[10px] font-mono text-[#71717A]">
            Archetype: <strong className="text-[#18181B] uppercase">{resolvedBlueprint}</strong>
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. FINISH SWATCHES & ACTION BUTTONS                      */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#18181B]/10 text-xs">
        <div className="flex items-center gap-1.5">
          {product.finishes?.slice(0, 4).map((f) => (
            <span
              key={f.id}
              title={f.finish_name}
              className="w-3.5 h-3.5 rounded-full border border-[#18181B]/20 inline-block shadow-2xs shrink-0"
              style={{ backgroundColor: f.hex_code }}
            />
          ))}
          <span className="text-[10px] font-mono text-[#71717A]">
            ({product.finishes?.length || 0})
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#18181B]/15 hover:border-[#9A3412] bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 text-[#18181B] hover:text-[#9A3412] text-[11px] font-semibold transition-colors cursor-pointer"
            title="Edit Product Blueprint"
          >
            <Pencil className="w-3 h-3 text-[#9A3412]" />
            <span>Edit</span>
          </Link>

          <Link
            href={`/categories/${product.category?.slug || "bedroom"}/product/${product.slug}`}
            target="_blank"
            className="p-1.5 rounded-xl border border-[#18181B]/10 hover:border-[#18181B] text-[#71717A] hover:text-[#18181B] transition-colors"
            title="View Live Storefront"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(product.id, product.title_en)}
              className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete Product"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
