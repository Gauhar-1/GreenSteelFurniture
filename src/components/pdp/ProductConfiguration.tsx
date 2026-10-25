"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  Check,
  ChevronRight,
  MessageCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TactileButton } from "@/components/ui/TactileButton";
import type { ProductCatalogItem } from "@/services/ProductService";
import type { CategoryTheme } from "@/lib/categoryThemes";

interface ProductConfigurationProps {
  product: ProductCatalogItem;
  categoryName?: string;
  categorySlug?: string;
  subCategoryName?: string;
  selectedFinish: ProductCatalogItem["finishes"][number];
  selectedSize: ProductCatalogItem["sizes"][number];
  onFinishChange: (finish: ProductCatalogItem["finishes"][number]) => void;
  onSizeChange: (size: ProductCatalogItem["sizes"][number]) => void;
  onBookNow: () => void;
  theme: CategoryTheme;
  className?: string;
}

/**
 * ProductConfiguration — Luxury Viewport Specification & Configurator Panel
 * 
 * Renders 100% of Supabase Admin Fields:
 * 1. Breadcrumbs & Bilingual Title (title_en / title_hi) & Tagline
 * 2. Live Dynamic Pricing & Stock Badge (IN_STOCK / MADE_TO_ORDER) + Delivery Days
 * 3. Finish Selector with instant cross-fade triggering
 * 4. Size & Dimension Selector with live dimension pills
 * 5. Engineering Highlights 2-column architectural spec grid
 * 6. Sticky Action Bar: Primary Token reservation + WhatsApp secondary inquiry
 */
export function ProductConfiguration({
  product,
  categoryName,
  categorySlug = "bedroom",
  subCategoryName,
  selectedFinish,
  selectedSize,
  onFinishChange,
  onSizeChange,
  onBookNow,
  theme,
  className,
}: ProductConfigurationProps) {
  const price = Number(selectedSize?.price || product.base_price);
  const mrp = Math.round(price * 1.3);
  const tokenAmount = selectedSize?.token_amount || 500;
  const deliveryDays = selectedSize?.delivery_days || 4;
  const isStockReady = selectedSize?.stock_status === "IN_STOCK";

  // Dimension details
  const dims = selectedSize?.dimensions;
  const hasDimensions = dims && (dims.height || dims.width || dims.depth || dims.length);

  // WhatsApp Pre-filled Link Generator
  const waMessage = `Hello Green Steel Furniture, I'm interested in the ${product.title_en}${
    product.title_hi ? ` (${product.title_hi})` : ""
  } in ${selectedFinish?.finish_name || "Standard"} finish, ${
    selectedSize?.size_label || "Standard"
  } size (₹${price.toLocaleString("en-IN")}). Could you please share more details?`;

  const waUrl = `https://wa.me/919437000000?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className={cn("w-full flex flex-col gap-5 text-[#18181B]", className)}>
      {/* 1. Breadcrumb Hierarchy */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-[#71717A] flex-wrap">
        <Link
          href="/categories"
          className="hover:text-[#18181B] transition-colors font-medium"
        >
          Collections
        </Link>
        <ChevronRight className="w-3 h-3 text-[#18181B]/20" />
        <Link
          href={`/categories/${categorySlug}`}
          className="hover:text-[#18181B] transition-colors font-medium"
        >
          {categoryName || "Department"}
        </Link>
        {subCategoryName && (
          <>
            <ChevronRight className="w-3 h-3 text-[#18181B]/20" />
            <span className="text-[#71717A] font-medium">{subCategoryName}</span>
          </>
        )}
      </nav>

      {/* 2. Bilingual Title & Identity */}
      <div className="flex flex-col gap-1.5 border-b border-[#18181B]/10 pb-4">
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-serif text-[#18181B] tracking-tight leading-tight">
            {product.title_en}
          </h1>
          {product.title_hi && (
            <span className="text-sm sm:text-base font-sans text-[#71717A] font-medium">
              {product.title_hi}
            </span>
          )}
        </div>

        {product.tagline && (
          <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed font-light">
            {product.tagline}
          </p>
        )}

        {/* Live Dynamic Pricing & Stock Badge */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight">
              ₹{price.toLocaleString("en-IN")}
            </span>
            <span className="text-xs sm:text-sm text-[#71717A] line-through font-normal">
              ₹{mrp.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A3412] bg-[#9A3412]/10 px-2 py-0.5 rounded-full">
              Save ₹{(mrp - price).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Stock Status Badge */}
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border shadow-2xs",
              isStockReady
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-900 border-amber-200"
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                isStockReady ? "bg-emerald-600 animate-pulse" : "bg-amber-600"
              )}
            />
            <span>{isStockReady ? "Ready to Ship" : "Crafted on Order"}</span>
          </div>
        </div>

        {/* Token Advance Note & Delivery Timeline */}
        <div className="flex items-center justify-between gap-2 pt-1 text-[11px] font-medium text-[#71717A]">
          <span className="text-[#9A3412] font-semibold">
            Book today for ₹{tokenAmount} Token
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#71717A]" />
            <span>Estimated Delivery: {deliveryDays} Days</span>
          </span>
        </div>
      </div>

      {/* 3. Finish Selector */}
      <div className="flex flex-col gap-2.5 border-b border-[#18181B]/10 pb-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#18181B]">
            Finish / Coating
          </label>
          <span className="text-xs font-medium text-[#71717A]">
            Selected: <strong className="text-[#18181B]">{selectedFinish?.finish_name}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {product.finishes.map((finish) => {
            const isSelected = finish.id === selectedFinish?.id;
            return (
              <button
                key={finish.id}
                type="button"
                onClick={() => onFinishChange(finish)}
                aria-label={`Select ${finish.finish_name} finish`}
                aria-pressed={isSelected}
                className={cn(
                  "relative w-10 h-10 sm:w-11 sm:h-11 rounded-full cursor-pointer transition-all duration-200 outline-none flex items-center justify-center touch-manipulation",
                  isSelected
                    ? "ring-2 ring-offset-2 ring-offset-[#FAF8F5] ring-[#18181B] scale-105 shadow-sm"
                    : "hover:scale-105 opacity-85 hover:opacity-100"
                )}
                style={{ backgroundColor: finish.hex_code }}
              >
                <span className="absolute inset-0 rounded-full border border-black/15 pointer-events-none" />
                {isSelected && (
                  <Check
                    className={cn(
                      "w-4 h-4 stroke-[3]",
                      finish.hex_code === "#FFFFFF" || finish.hex_code === "#F5F2EB"
                        ? "text-[#18181B]"
                        : "text-white"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Size & Dimension Selector */}
      <div className="flex flex-col gap-2.5 border-b border-[#18181B]/10 pb-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#18181B]">
            Proportions & Size
          </label>
          {hasDimensions && (
            <span className="text-[11px] font-bold text-[#9A3412]">
              H: {dims?.height || 78}&quot; × W: {dims?.width || 36}&quot; × D: {dims?.depth || 22}&quot;
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {product.sizes.map((size) => {
            const isSelected = size.id === selectedSize?.id;
            return (
              <button
                key={size.id}
                type="button"
                onClick={() => onSizeChange(size)}
                aria-pressed={isSelected}
                className={cn(
                  "p-2.5 rounded-xl border text-left flex flex-col justify-center transition-all duration-200 cursor-pointer touch-manipulation select-none",
                  isSelected
                    ? "bg-[#18181B] border-[#18181B] text-white shadow-xs"
                    : "bg-white border-[#18181B]/15 text-[#18181B] hover:border-[#18181B]/40 hover:bg-[#FAF8F5]"
                )}
              >
                <span className="text-xs font-bold leading-tight truncate">
                  {size.size_label}
                </span>
                <span
                  className={cn(
                    "text-[10px] mt-0.5",
                    isSelected ? "text-white/70" : "text-[#71717A]"
                  )}
                >
                  ₹{Number(size.price).toLocaleString("en-IN")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Engineering Highlights JSONB Architectural Grid */}
      {product.highlights && product.highlights.length > 0 && (
        <div className="flex flex-col gap-2.5 border-b border-[#18181B]/10 pb-4">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#18181B]">
            Engineering Highlights
          </span>

          <div className="grid grid-cols-2 gap-2">
            {product.highlights.map((highlight, idx) => {
              const hasColon = highlight.includes(":");
              const [key, value] = hasColon
                ? highlight.split(":").map((s) => s.trim())
                : ["Spec", highlight];

              return (
                <div
                  key={`hl-${idx}`}
                  className="p-2.5 rounded-xl bg-white/70 border border-[#18181B]/8 flex flex-col gap-0.5"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A3412]">
                    {key}
                  </span>
                  <span className="text-xs font-medium text-[#18181B] leading-tight">
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Sticky Action Buttons */}
      <div className="flex flex-col gap-2.5 pt-2">
        {/* Primary CTA */}
        <TactileButton
          variant="primary"
          onClick={onBookNow}
          className="w-full min-h-[50px] shadow-lg flex items-center justify-center gap-2"
        >
          <span>Reserve for ₹{tokenAmount} Token</span>
          <ArrowRight className="w-4 h-4" />
        </TactileButton>

        {/* Secondary WhatsApp CTA */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border border-emerald-600/20 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 shadow-xs cursor-pointer select-none touch-manipulation active:scale-[0.98]"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Ask on WhatsApp</span>
        </a>

        {/* Inspection Trust Guarantees */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-center">
          <div className="p-2 rounded-xl bg-white/60 border border-[#18181B]/5 flex items-center justify-center gap-1.5 text-[10px] font-medium text-[#18181B]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9A3412] shrink-0" />
            <span>15-Yr Rust Guarantee</span>
          </div>
          <div className="p-2 rounded-xl bg-white/60 border border-[#18181B]/5 flex items-center justify-center gap-1.5 text-[10px] font-medium text-[#18181B]">
            <Truck className="w-3.5 h-3.5 text-[#18181B] shrink-0" />
            <span>Doorstep Inspection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
