"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductCatalogItem } from "@/services/ProductService";
import type { Product, MediaVariant } from "@/types/product";
import { VisualStage } from "./VisualStage";
import { ProductConfiguration } from "./ProductConfiguration";
import { StickyMobileActionBar } from "./StickyMobileActionBar";
import { CheckoutDrawer } from "@/components/checkout/CheckoutDrawer";
import { getCategoryTheme } from "@/lib/categoryThemes";

interface ProductDetailViewProps {
  product: ProductCatalogItem;
  categorySlug?: string;
  categoryName?: string;
  subCategoryName?: string;
}

/**
 * ProductDetailView — Viewport-Locked Luxury Showroom Configurator
 * 
 * Layout Mechanics:
 * - Desktop: 12-column grid locked to `calc(100vh - 4.5rem)`
 *   - Left 7 cols: Locked, non-scrolling Interactive Stage (max-h-[72vh] bounded image)
 *   - Right 5 cols: Dedicated, independently scrollable luxury configurator panel
 * - Mobile:
 *   - Top Stage: `h-[48dvh] sticky top-14 z-20` holds visual stage + 5-pill mode switcher
 *   - Bottom Sheet: `relative z-30 bg-white rounded-t-3xl shadow-2xl -mt-4 pt-6 pb-28 px-5` scrollable panel
 * - Full live Supabase data binding (bilingual title, dynamic pricing, stock badge, finish/size swatches)
 */
export function ProductDetailView({
  product,
  categorySlug = "bedroom",
  categoryName,
  subCategoryName,
}: ProductDetailViewProps) {
  // Safe defaults for finishes and sizes from live Supabase data
  const defaultFinish =
    product.finishes.find((f) => f.is_default) || product.finishes[0] || {
      id: "def-finish",
      finish_name: "Architectural Grey",
      hex_code: "#36454F",
      media: {
        lifestyle: "/hero-bedroom.png",
        front: "/product-drawer-isolated.png",
        functional: "/inside-wardrobe-locker.png",
        macro: "/hero-bedroom.png",
      },
    };

  const defaultSize =
    product.sizes.find((s) => s.is_default) || product.sizes[0] || {
      id: "def-size",
      size_label: "Standard Proportions",
      price: product.base_price,
      token_amount: 500,
      delivery_days: 4,
      stock_status: "IN_STOCK",
      dimensions: { height: 78, width: 36, depth: 22, unit: "inches" as const },
    };

  const [selectedFinish, setSelectedFinish] = useState(defaultFinish);
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Dynamic Theme Resolution
  const theme = getCategoryTheme(categorySlug || product.category?.slug);
  const blueprintType = product.category?.blueprint_type || "wardrobe";

  const currentPrice = Number(selectedSize?.price || product.base_price);
  const tokenAmount = selectedSize?.token_amount || 500;

  // WhatsApp Pre-filled URL
  const waMessage = `Hello Green Steel Furniture, I'm interested in the ${product.title_en}${
    product.title_hi ? ` (${product.title_hi})` : ""
  } in ${selectedFinish?.finish_name} finish, ${
    selectedSize?.size_label
  } size (₹${currentPrice.toLocaleString("en-IN")}). Could you please share more details?`;
  const waUrl = `https://wa.me/919437000000?text=${encodeURIComponent(waMessage)}`;

  // Adapt configured state for the 3-step CheckoutDrawer
  const checkoutProduct: Product = {
    id: product.id,
    name: `${product.title_en} — ${selectedSize?.size_label || "Standard"}`,
    tagline: product.tagline,
    slug: product.slug,
    category: categoryName || product.category?.name_en || "Architectural Steel",
    price: currentPrice,
    mrp: Math.round(currentPrice * 1.3),
    media: {
      outsideView:
        selectedFinish?.media?.lifestyle ||
        selectedFinish?.media?.front ||
        selectedFinish?.media?.functional ||
        selectedFinish?.media?.macro ||
        "/hero-bedroom.png",
      insideView:
        selectedFinish?.media?.functional ||
        selectedFinish?.media?.inside ||
        selectedFinish?.media?.front ||
        selectedFinish?.media?.lifestyle ||
        "/inside-wardrobe-locker.png",
      alt: product.title_en,
      variants: product.finishes.map((f) => {
        const primary =
          f.media?.lifestyle ||
          f.media?.front ||
          f.media?.functional ||
          f.media?.macro ||
          "/hero-bedroom.png";
        const secondary =
          f.media?.functional ||
          f.media?.inside ||
          f.media?.front ||
          primary;
        return {
          id: f.id,
          name: f.finish_name,
          hex: f.hex_code,
          outsideImageUrl: primary,
          insideImageUrl: secondary,
        };
      }),
    },
    attributes: {
      gauge: "Tata 20-Gauge CRCA Steel",
      dimensions: selectedSize?.dimensions
        ? `${selectedSize.dimensions.height || 78}H x ${selectedSize.dimensions.width || 36}W x ${selectedSize.dimensions.depth || 22}D (inches)`
        : "Architectural Proportions",
      tags: [selectedSize?.size_label || "Standard", selectedFinish?.finish_name || "Coated"],
      warranty: "15-Year Rust-Proof Guarantee",
    },
    inStock: selectedSize?.stock_status === "IN_STOCK",
  };

  const checkoutVariant: MediaVariant = {
    id: selectedFinish?.id || "def-variant",
    name: selectedFinish?.finish_name || "Standard",
    hex: selectedFinish?.hex_code || "#18181B",
    outsideImageUrl:
      selectedFinish?.media?.lifestyle ||
      selectedFinish?.media?.front ||
      selectedFinish?.media?.functional ||
      selectedFinish?.media?.macro ||
      "/hero-bedroom.png",
    insideImageUrl:
      selectedFinish?.media?.functional ||
      selectedFinish?.media?.inside ||
      selectedFinish?.media?.front ||
      "/inside-wardrobe-locker.png",
  };

  return (
    <div
      className="w-full flex-1 flex flex-col transition-colors duration-300"
      style={{ backgroundColor: theme.bgSurface }}
    >
      {/* DESKTOP VIEWPORT-LOCKED SHOWROOM (>= lg) */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:h-[calc(100dvh-4.5rem)] lg:overflow-hidden max-w-[1700px] mx-auto w-full">
        {/* Left 7 Columns: Locked, Non-Scrolling Interactive Stage */}
        <section
          aria-label="Interactive visual stage"
          className="lg:col-span-7 h-full p-6 flex flex-col justify-between border-r border-black/8 overflow-hidden"
          style={{ backgroundColor: theme.bgSurface }}
        >
          <VisualStage
            finishMedia={selectedFinish.media}
            finishName={selectedFinish.finish_name}
            productTitle={product.title_en}
            slot3Label={theme.slot3Label}
            blueprintType={blueprintType}
            dimensions={selectedSize.dimensions}
            theme={theme}
            className="h-full"
          />
        </section>

        {/* Right 5 Columns: Independently Scrollable Luxury Spec & Configurator Panel */}
        <section
          aria-label="Furniture configuration"
          className="lg:col-span-5 h-full overflow-y-auto px-8 py-6 bg-white/90 backdrop-blur-md"
        >
          <div className="max-w-xl mx-auto flex flex-col pb-12">
            <ProductConfiguration
              product={product}
              categoryName={categoryName}
              categorySlug={categorySlug}
              subCategoryName={subCategoryName}
              selectedFinish={selectedFinish}
              selectedSize={selectedSize}
              onFinishChange={setSelectedFinish}
              onSizeChange={setSelectedSize}
              onBookNow={() => setIsCheckoutOpen(true)}
              theme={theme}
            />
          </div>
        </section>
      </div>

      {/* MOBILE SHOWROOM (< lg) */}
      <div className="flex lg:hidden flex-col w-full">
        {/* Top Viewport Stage: Sticky 48dvh */}
        <div
          className="h-[48dvh] min-h-[300px] max-h-[460px] sticky top-14 z-20 border-b border-black/8 shadow-2xs"
          style={{ backgroundColor: theme.bgSurface }}
        >
          <VisualStage
            finishMedia={selectedFinish.media}
            finishName={selectedFinish.finish_name}
            productTitle={product.title_en}
            slot3Label={theme.slot3Label}
            blueprintType={blueprintType}
            dimensions={selectedSize.dimensions}
            theme={theme}
            className="h-full"
          />
        </div>

        {/* Bottom Scrollable Sheet */}
        <div className="relative z-30 bg-white rounded-t-3xl shadow-2xl -mt-4 pt-6 pb-28 px-5">
          <ProductConfiguration
            product={product}
            categoryName={categoryName}
            categorySlug={categorySlug}
            subCategoryName={subCategoryName}
            selectedFinish={selectedFinish}
            selectedSize={selectedSize}
            onFinishChange={setSelectedFinish}
            onSizeChange={setSelectedSize}
            onBookNow={() => setIsCheckoutOpen(true)}
            theme={theme}
          />
        </div>

        {/* Mobile Sticky Action Bar */}
        <StickyMobileActionBar
          currentPrice={currentPrice}
          tokenAmount={tokenAmount}
          onBookNow={() => setIsCheckoutOpen(true)}
          selectedFinishName={selectedFinish.finish_name}
          selectedSizeLabel={selectedSize.size_label}
          waUrl={waUrl}
        />
      </div>

      {/* Slide-Up Token Checkout Drawer */}
      <CheckoutDrawer
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={checkoutProduct}
        selectedVariant={checkoutVariant}
      />
    </div>
  );
}
