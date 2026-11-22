"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ProductCatalogItem } from "@/services/ProductService";
import { VisualStage } from "./VisualStage";
import { ProductConfiguration } from "./ProductConfiguration";
import { StickyMobileActionBar } from "./StickyMobileActionBar";
import { getCategoryTheme } from "@/lib/categoryThemes";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { buildSingleProductWhatsAppUrl, buildProductUrl } from "@/lib/whatsapp";

interface ProductDetailViewProps {
  product: ProductCatalogItem;
  categorySlug?: string;
  categoryName?: string;
  subCategoryName?: string;
  initialFinishId?: string;
  initialSizeId?: string;
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
  initialFinishId,
  initialSizeId,
}: ProductDetailViewProps) {
  // Deep-link hydration: resolve finish and size matching initial URL params or defaults
  const resolvedInitialFinish = useMemo(() => {
    if (initialFinishId) {
      const match = product.finishes.find(
        (f) =>
          f.id === initialFinishId ||
          f.finish_name.toLowerCase() === initialFinishId.toLowerCase()
      );
      if (match) return match;
    }
    return (
      product.finishes.find((f) => f.is_default) ||
      product.finishes[0] || {
        id: "def-finish",
        finish_name: "Architectural Grey",
        hex_code: "#36454F",
        media: {
          lifestyle: "/hero-bedroom.png",
          front: "/product-drawer-isolated.png",
          functional: "/inside-wardrobe-locker.png",
          macro: "/hero-bedroom.png",
        },
      }
    );
  }, [initialFinishId, product.finishes]);

  const resolvedInitialSize = useMemo(() => {
    if (initialSizeId) {
      const match = product.sizes.find(
        (s) =>
          s.id === initialSizeId ||
          s.size_label.toLowerCase() === initialSizeId.toLowerCase()
      );
      if (match) return match;
    }
    return (
      product.sizes.find((s) => s.is_default) ||
      product.sizes[0] || {
        id: "def-size",
        size_label: "Standard Proportions",
        price: product.base_price,
        token_amount: 500,
        delivery_days: 4,
        stock_status: "IN_STOCK",
        dimensions: { height: 78, width: 36, depth: 22, unit: "inches" as const },
      }
    );
  }, [initialSizeId, product.sizes, product.base_price]);

  const [selectedFinish, setSelectedFinish] = useState(resolvedInitialFinish);
  const [selectedSize, setSelectedSize] = useState(resolvedInitialSize);
  const [isAdded, setIsAdded] = useState(false);

  // Synchronize browser address bar with selected finish and size (shallow, zero reload)
  useEffect(() => {
    if (typeof window !== "undefined" && window.history?.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set("finish", selectedFinish.id);
      url.searchParams.set("size", selectedSize.id);
      window.history.replaceState(null, "", url.toString());
    }
  }, [selectedFinish.id, selectedSize.id]);

  const { addItem, openCart } = useCart();

  // Dynamic Theme Resolution
  const theme = getCategoryTheme(categorySlug || product.category?.slug);
  const blueprintType = product.category?.blueprint_type || "wardrobe";

  const currentPrice = Number(selectedSize?.price || product.base_price);

  // Phone & WhatsApp Configuration with Admin Settings Fallback
  const { whatsappPhone, businessPhone, settings } = useSiteSettings();

  // Branded WhatsApp Pre-filled URL with deep-link variant
  const waUrl = buildSingleProductWhatsAppUrl({
    phone: whatsappPhone,
    product,
    finish: selectedFinish,
    size: selectedSize,
    categorySlug,
    brandName: settings?.brand_name || "Green Steel Furniture",
  });
  const callUrl = `tel:${businessPhone.replace(/[^0-9+]/g, "")}`;

  const handleAddToCart = () => {
    const dimensionsStr = selectedSize?.dimensions
      ? `${selectedSize.dimensions.height || 78}" × ${selectedSize.dimensions.width || 36}" × ${selectedSize.dimensions.depth || 22}"`
      : "Standard Dimensions";

    const primaryImage =
      selectedFinish?.media?.lifestyle ||
      selectedFinish?.media?.front ||
      selectedFinish?.media?.functional ||
      selectedFinish?.media?.macro ||
      "/hero-bedroom.png";

    addItem({
      productId: product.id,
      productSlug: product.slug,
      categorySlug: categorySlug || product.category?.slug || "steel-furniture",
      title: product.title_en,
      finishId: selectedFinish?.id || "def",
      finishName: selectedFinish?.finish_name || "Standard",
      finishHex: selectedFinish?.hex_code || "#18181B",
      sizeId: selectedSize?.id || "def",
      sizeLabel: selectedSize?.size_label || "Standard",
      dimensionsText: dimensionsStr,
      unitPrice: currentPrice,
      thumbnailUrl: primaryImage,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    openCart();
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
              onAddToCart={handleAddToCart}
              isAdded={isAdded}
              waUrl={waUrl}
              callUrl={callUrl}
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
            onAddToCart={handleAddToCart}
            isAdded={isAdded}
            waUrl={waUrl}
            callUrl={callUrl}
            theme={theme}
          />
        </div>

        {/* Mobile Sticky Action Bar */}
        <StickyMobileActionBar
          currentPrice={currentPrice}
          onAddToCart={handleAddToCart}
          isAdded={isAdded}
          selectedFinishName={selectedFinish.finish_name}
          selectedSizeLabel={selectedSize.size_label}
          waUrl={waUrl}
          callUrl={callUrl}
        />
      </div>
    </div>
  );
}
