"use client";

import React, { useState, useRef, useMemo, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Grid,
  Paintbrush,
  Plus,
  Trash2,
  Check,
  Upload,
  RefreshCw,
  ExternalLink,
  Edit2,
  X,
  Eye,
  EyeOff,
  LayoutTemplate,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SplitSquareVertical,
} from "lucide-react";
import {
  type HeroHotspot,
  type BentoCardItem,
  type WallColorItem,
  type Category,
} from "@/types/database";
import type { ProductCatalogItem } from "@/services/ProductService";
import {
  saveStorefrontSectionAction,
  toggleStorefrontSectionActiveAction,
} from "@/actions/adminActions";
import { StorageService } from "@/services/StorageService";
import { CompleteTheLookEditor, SelectableProduct } from "@/components/admin/CompleteTheLookEditor";

interface StorefrontVisualEditorProps {
  categories?: Category[];
  products?: ProductCatalogItem[];
  initialSections?: Array<{
    id: string;
    section_key: string;
    title_en: string;
    title_hi: string;
    content: Record<string, unknown>;
    is_active: boolean;
    display_order?: number;
  }>;
}

export function StorefrontVisualEditor({
  categories = [],
  products = [],
  initialSections = [],
}: StorefrontVisualEditorProps) {
  const [activeTab, setActiveTab] = useState<"hero" | "look" | "bento" | "wall" | "split">("hero");
  const [isTabPending, startTabTransition] = useTransition();
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const [toast, setToast] = useState<{ success: boolean; message: string } | null>(null);

  const handleTabChange = (nextTab: "hero" | "look" | "bento" | "wall" | "split") => {
    if (nextTab === activeTab) return;
    setIsTabSwitching(true);
    // Smooth 150ms tactile transition so section change is graceful rather than snappy/glitched
    setTimeout(() => {
      startTabTransition(() => {
        setActiveTab(nextTab);
        setIsTabSwitching(false);
      });
    }, 150);
  };

  // Map initial sections by canonical keys & aliases
  const sectionsMap = useMemo(() => {
    const map = new Map<string, any>();
    for (const s of initialSections) {
      map.set(s.section_key, s);
    }
    return map;
  }, [initialSections]);

  const heroInitial = sectionsMap.get("hero_room_showcase") || sectionsMap.get("hero_showcase");
  const bentoInitial = sectionsMap.get("asymmetric_spaces_bento") || sectionsMap.get("bento_spaces");
  const lookInitial = sectionsMap.get("interactive_room_lookbook") || sectionsMap.get("complete_the_look");
  const wallInitial = sectionsMap.get("wall_color_matcher");
  const splitInitial = sectionsMap.get("visual_craftsmanship_split") || sectionsMap.get("craftsmanship_split");

  // Section active states & display orders
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({
    hero: heroInitial ? heroInitial.is_active : true,
    bento: bentoInitial ? bentoInitial.is_active : true,
    look: lookInitial ? lookInitial.is_active : true,
    wall: wallInitial ? wallInitial.is_active : true,
    split: splitInitial ? splitInitial.is_active : true,
  });

  const [displayOrders, setDisplayOrders] = useState<Record<string, number>>({
    hero: typeof heroInitial?.display_order === "number" ? heroInitial.display_order : 0,
    bento: typeof bentoInitial?.display_order === "number" ? bentoInitial.display_order : 1,
    look: typeof lookInitial?.display_order === "number" ? lookInitial.display_order : 2,
    wall: typeof wallInitial?.display_order === "number" ? wallInitial.display_order : 3,
    split: typeof splitInitial?.display_order === "number" ? splitInitial.display_order : 4,
  });

  // 1. HERO SHOWCASE STATE
  const heroContent = heroInitial?.content || {};
  const [heroImage, setHeroImage] = useState<string>(
    heroContent.imageUrl || heroContent.image_url || ""
  );
  const [heroBadge, setHeroBadge] = useState<string>(
    heroContent.label || heroContent.badge || ""
  );
  const [heroHeadlineEn, setHeroHeadlineEn] = useState<string>(
    heroContent.headline || heroContent.headline_en || ""
  );
  const [heroHeadlineHi, setHeroHeadlineHi] = useState<string>(
    heroContent.headline_hi || ""
  );
  const [heroCtaText, setHeroCtaText] = useState<string>(
    heroContent.cta?.label || "Explore Collections"
  );
  const [heroCtaHref, setHeroCtaHref] = useState<string>(
    heroContent.cta?.href || "/categories"
  );
  const [hotspots, setHotspots] = useState<HeroHotspot[]>(
    Array.isArray(heroContent.hotspots) && heroContent.hotspots.length > 0
      ? heroContent.hotspots.map((h: any) => ({
          id: h.id || `pin-${Date.now()}`,
          x: typeof h.xPercent === "number" ? h.xPercent : (typeof h.x === "number" ? h.x : 50),
          y: typeof h.yPercent === "number" ? h.yPercent : (typeof h.y === "number" ? h.y : 50),
          label: h.title || h.label || "Product Pin",
          product_id: h.product_id,
          product_slug: h.product_slug || "",
          price: typeof h.price === "number" ? h.price : Number(String(h.price).replace(/[^0-9]/g, "") || 0),
        }))
      : []
  );
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  // 2. BENTO SPACES (CATEGORIES SHOWCASE) STATE
  const bentoContent = bentoInitial?.content || {};
  const [bentoTitle, setBentoTitle] = useState<string>(
    bentoContent.title || "Designed for Every Space"
  );
  const [selectedBentoCategoryIds, setSelectedBentoCategoryIds] = useState<string[]>(() => {
    if (Array.isArray(bentoContent.cards) && bentoContent.cards.length > 0) {
      const fromCards = bentoContent.cards
        .map((c: any) => c.category_id || categories.find((cat) => cat.slug === c.slug)?.id)
        .filter((id: unknown): id is string => typeof id === "string" && id.length > 0);
      if (fromCards.length > 0) return fromCards;
    }
    // Default to the first 5 live categories
    return categories
      .slice(0, 5)
      .map((c) => c.id)
      .filter((id: unknown): id is string => typeof id === "string" && id.length > 0);
  });

  const handleMoveBentoCategory = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedBentoCategoryIds.length) return;
    const updated = [...selectedBentoCategoryIds];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setSelectedBentoCategoryIds(updated);
  };

  const handleRemoveBentoCategory = (catId: string) => {
    setSelectedBentoCategoryIds((prev) => prev.filter((id) => id !== catId));
  };

  const handleAddBentoCategory = (catId: string) => {
    if (!selectedBentoCategoryIds.includes(catId)) {
      setSelectedBentoCategoryIds((prev) => [...prev, catId]);
    }
  };

  const unselectedCategories = useMemo(() => {
    return categories.filter((c) => Boolean(c.id && !selectedBentoCategoryIds.includes(c.id)));
  }, [categories, selectedBentoCategoryIds]);

  // 3. WALL COLOR MATCHER STATE
  const wallContent = wallInitial?.content || {};
  const [wallColors, setWallColors] = useState<WallColorItem[]>(
    Array.isArray(wallContent.combinations) && wallContent.combinations.length > 0
      ? wallContent.combinations.map((w: any, idx: number) => ({
          id: w.id || `wall-${idx + 1}`,
          wallName: w.wallName || "Wall Tone",
          hex: w.hex || "#E5D9C5",
          advice: w.advice || "",
          image: w.image || "",
          href: w.ctaLink || w.href || "/categories",
        }))
      : []
  );
  const [editingWallIndex, setEditingWallIndex] = useState<number | null>(null);

  // 4. CRAFTSMANSHIP SPLIT STATE
  const splitContent = splitInitial?.content || {};
  const [splitLeft, setSplitLeft] = useState({
    caption: splitContent.left?.caption || "",
    imageUrl: splitContent.left?.imageUrl || splitContent.left?.image || "",
    imageAlt: splitContent.left?.imageAlt || "Craftsmanship detail",
    href: splitContent.left?.href || "/categories",
  });
  const [splitRight, setSplitRight] = useState({
    caption: splitContent.right?.caption || "",
    imageUrl: splitContent.right?.imageUrl || splitContent.right?.image || "",
    imageAlt: splitContent.right?.imageAlt || "Craftsmanship detail",
    href: splitContent.right?.href || "/categories",
  });

  // Convert live catalog products to selectable lookbook products
  const selectableProducts: SelectableProduct[] = useMemo(() => {
    return products.map((p) => {
      const firstFinish = p.finishes?.find((f) => f.is_default) || p.finishes?.[0];
      const img =
        firstFinish?.media?.lifestyle ||
        firstFinish?.media?.front ||
        firstFinish?.media?.macro ||
        "";
      const firstSize = p.sizes?.find((s) => s.is_default) || p.sizes?.[0];
      const price = firstSize?.price ?? p.base_price;

      return {
        id: p.id,
        title: p.title_en,
        category: p.category?.name_en || "Furniture",
        price: Number(price),
        image: img,
        tagline: p.tagline || p.highlights?.[0] || "",
      };
    });
  }, [products]);

  // Click on Hero Image to place new hotspot pin
  const heroImageRef = useRef<HTMLDivElement>(null);
  const handleHeroCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroImageRef.current) return;
    const rect = heroImageRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const defaultProd = products[0];

    const newPin: HeroHotspot = {
      id: `pin-${Date.now()}`,
      x,
      y,
      label: defaultProd?.title_en || "New Product Pin",
      product_id: defaultProd?.id,
      product_slug: defaultProd?.slug || "architectural-piece",
      price: defaultProd ? Number(defaultProd.base_price) : 24999,
    };

    setHotspots((prev) => [...prev, newPin]);
    setSelectedHotspotId(newPin.id);
  };

  // Image Upload helper with orphan cleanup
  const handleUploadImage = async (
    file: File,
    sectionKey: string,
    onSuccess: (url: string) => void,
    oldUrl?: string
  ) => {
    setUploadingSection(sectionKey);
    try {
      const res = await StorageService.uploadStorefrontMedia(file, sectionKey);
      if (res.publicUrl) {
        onSuccess(res.publicUrl);

        // Delete old image from storage if replaced
        if (oldUrl && oldUrl !== res.publicUrl) {
          await StorageService.deleteMediaByUrl(oldUrl);
        }

        setToast({
          success: true,
          message: `Image uploaded successfully to ${res.isFallback ? "local preview" : "Supabase Storage"}!`,
        });
      }
    } catch (err) {
      setToast({
        success: false,
        message: err instanceof Error ? err.message : "Failed to upload image.",
      });
    } finally {
      setUploadingSection(null);
    }
  };

  // Toggle active state for a section
  const handleToggleActive = async (key: string) => {
    const currentState = activeStates[key] ?? true;
    const nextState = !currentState;
    setActiveStates((prev) => ({ ...prev, [key]: nextState }));

    const dbSectionKey =
      key === "hero"
        ? "hero_room_showcase"
        : key === "bento"
        ? "asymmetric_spaces_bento"
        : key === "look"
        ? "interactive_room_lookbook"
        : key === "wall"
        ? "wall_color_matcher"
        : "visual_craftsmanship_split";

    await toggleStorefrontSectionActiveAction(dbSectionKey, nextState);
    setToast({
      success: true,
      message: `${key.toUpperCase()} section visibility toggled to ${nextState ? "Active" : "Disabled"}.`,
    });
  };

  // Save active section
  const handleSaveActiveSection = async () => {
    setIsSaving(true);
    setToast(null);

    try {
      if (activeTab === "hero") {
        await saveStorefrontSectionAction(
          "hero_room_showcase",
          {
            imageUrl: heroImage,
            label: heroBadge,
            headline: heroHeadlineEn,
            headline_hi: heroHeadlineHi,
            cta: {
              label: heroCtaText,
              href: heroCtaHref,
            },
            hotspots: hotspots.map((h) => ({
              id: h.id,
              xPercent: h.x,
              yPercent: h.y,
              title: h.label,
              product_id: h.product_id,
              product_slug: h.product_slug,
              price: h.price,
              href: h.product_slug ? `/categories/bedroom/product/${h.product_slug}` : "/categories",
            })),
          },
          "Master Hero Showcase",
          "मास्टर हीरो शोकेस",
          activeStates.hero ?? true,
          displayOrders.hero ?? 0
        );
      } else if (activeTab === "bento") {
        await saveStorefrontSectionAction(
          "asymmetric_spaces_bento",
          {
            title: bentoTitle,
            cards: selectedBentoCategoryIds.map((catId, idx) => {
              const cat = categories.find((c) => c.id === catId);
              const gridSpan =
                idx === 0
                  ? "master_bedroom"
                  : idx === 1
                  ? "living_hall"
                  : idx === 2
                  ? "dining_space"
                  : idx === 3
                  ? "study_office"
                  : idx === 4
                  ? "storage_almirah"
                  : "standard";

              return {
                id: `card-${catId}`,
                category_id: catId,
                gridSpan,
                title: cat?.name_en || "Category Space",
                subtitle: cat?.subtitle || "",
                imageUrl: cat?.cover_image || "",
                href: cat ? `/categories/${cat.slug}` : "/categories",
              };
            }),
          },
          "Designed for Every Space",
          "हर कमरे के लिए डिज़ाइन किया गया",
          activeStates.bento ?? true,
          displayOrders.bento ?? 1
        );
      } else if (activeTab === "wall") {
        await saveStorefrontSectionAction(
          "wall_color_matcher",
          {
            combinations: wallColors.map((w) => ({
              id: w.id,
              wallName: w.wallName,
              hex: w.hex,
              advice: w.advice,
              image: w.image,
              ctaLink: w.href || "/categories",
              ctaText: "Shop Collections",
            })),
          },
          "Design by Wall Color",
          "दीवार के रंग अनुसार",
          activeStates.wall ?? true,
          displayOrders.wall ?? 3
        );
      } else if (activeTab === "split") {
        await saveStorefrontSectionAction(
          "visual_craftsmanship_split",
          {
            left: splitLeft,
            right: splitRight,
          },
          "Craftsmanship Split",
          "शिल्प कौशल विभाजन",
          activeStates.split ?? true,
          displayOrders.split ?? 4
        );
      }

      setToast({
        success: true,
        message: "Section updated! Instant cache revalidation pushed to live storefront.",
      });
    } catch (err) {
      setToast({
        success: false,
        message: err instanceof Error ? err.message : "Failed to save storefront section.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          className={`p-4 rounded-2xl border shadow-md flex items-center justify-between gap-3 ${
            toast.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : "bg-red-50 border-red-200 text-red-950"
          }`}
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-xs font-semibold">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs uppercase font-bold text-[#71717A] hover:text-[#18181B]"
          >
            Close
          </button>
        </div>
      )}

      {/* Overview & Quick Section Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#18181B]/10">
        <div>
          <span className="text-xs font-mono font-semibold text-[#9A3412] uppercase tracking-wider">
            Live Storefront Controller
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#18181B]">
            Editorial Landing Page Studio
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Section Selector Pills */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#18181B]/10 shadow-2xs flex-wrap">
            <button
              type="button"
              onClick={() => handleTabChange("hero")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "hero"
                  ? "bg-[#18181B] text-white shadow-xs"
                  : "text-[#71717A] hover:text-[#18181B]"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Hero Hotspots</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("bento")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "bento"
                  ? "bg-[#18181B] text-white shadow-xs"
                  : "text-[#71717A] hover:text-[#18181B]"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Categories Bento</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("look")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "look"
                  ? "bg-[#18181B] text-white shadow-xs"
                  : "text-[#71717A] hover:text-[#18181B]"
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Lookbook Sets</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("wall")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "wall"
                  ? "bg-[#18181B] text-white shadow-xs"
                  : "text-[#71717A] hover:text-[#18181B]"
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              <span>Wall Matcher</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("split")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "split"
                  ? "bg-[#18181B] text-white shadow-xs"
                  : "text-[#71717A] hover:text-[#18181B]"
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Craftsmanship</span>
            </button>
          </div>

          {/* Active Toggle for current section */}
          <button
            type="button"
            onClick={() => handleToggleActive(activeTab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${
              activeStates[activeTab]
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-zinc-100 text-zinc-500 border-zinc-300"
            }`}
          >
            {activeStates[activeTab] ? (
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
            )}
            <span>{activeStates[activeTab] ? "Visible" : "Hidden"}</span>
          </button>

          {/* Save Button (for tabs other than 'look' which has its own save button) */}
          {activeTab !== "look" && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveActiveSection}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9A3412] hover:bg-[#b03c15] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Save & Revalidate</span>
            </button>
          )}
        </div>
      </div>

      {/* Tactile Section Switching Transition (Graceful micro-delay to prevent snappy or glitched feel) */}
      {isTabSwitching ? (
        <div className="bg-white rounded-3xl border border-[#18181B]/10 p-12 md:p-16 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-150">
          <div className="w-10 h-10 rounded-2xl bg-[#9A3412]/10 text-[#9A3412] flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#18181B]">
              Switching Studio Workspace...
            </p>
            <p className="text-[11px] text-[#71717A] mt-1">
              Synchronizing section controls and live database bindings
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ============================================================ */}
          {/* 1. HERO SHOWCASE & HOTSPOTS PIN CANVAS                       */}
          {/* ============================================================ */}
          {activeTab === "hero" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
              {/* Interactive Click-to-Pin Canvas (8 cols) */}
              <div className="lg:col-span-8 bg-white p-4 md:p-6 rounded-3xl border border-[#18181B]/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      Interactive Hotspots Canvas
                    </span>
                    <p className="text-xs text-[#71717A]">
                      Click anywhere on the room photography to drop a new &quot;Shop the Room&quot; pin.
                    </p>
                  </div>

                  {/* Upload Hero Image Button */}
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EDE9E1] border border-[#18181B]/10 text-xs font-bold text-[#18181B] cursor-pointer transition-all">
                    {uploadingSection === "hero_room_showcase" ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>Upload Room Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          handleUploadImage(f, "hero_room_showcase", setHeroImage, heroImage);
                        }
                      }}
                    />
                  </label>
                </div>

            {/* Canvas */}
            <div
              ref={heroImageRef}
              onClick={handleHeroCanvasClick}
              className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#18181B]/5 cursor-crosshair select-none border border-[#18181B]/10"
            >
              {heroImage && (
                <Image
                  src={heroImage}
                  alt="Hero Showcase Room"
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              )}

              {/* Overlay Hotspots */}
              {hotspots.map((pin) => {
                const isSelected = pin.id === selectedHotspotId;
                return (
                  <button
                    key={pin.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHotspotId(pin.id);
                    }}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer shadow-md ${
                      isSelected
                        ? "bg-[#9A3412] text-white scale-125 ring-4 ring-white"
                        : "bg-white/95 text-[#18181B] hover:scale-110"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-current" />
                  </button>
                );
              })}
            </div>

            {/* Headline and Metadata Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A] mb-1">
                  Section Badge
                </label>
                <input
                  type="text"
                  value={heroBadge}
                  onChange={(e) => setHeroBadge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 text-xs text-[#18181B] font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A] mb-1">
                  Headline (English)
                </label>
                <input
                  type="text"
                  value={heroHeadlineEn}
                  onChange={(e) => setHeroHeadlineEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 text-xs text-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A] mb-1">
                  Headline (Hindi)
                </label>
                <input
                  type="text"
                  value={heroHeadlineHi}
                  onChange={(e) => setHeroHeadlineHi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 text-xs text-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A] mb-1">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={heroCtaText}
                  onChange={(e) => setHeroCtaText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 text-xs text-[#18181B]"
                />
              </div>
            </div>
          </div>

          {/* Hotspots Sidebar Inspector (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#18181B]/10 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#18181B]/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#18181B]">
                Hotspot Inspector
              </h3>
              {selectedHotspotId && (
                <button
                  type="button"
                  onClick={() => {
                    setHotspots(hotspots.filter((p) => p.id !== selectedHotspotId));
                    setSelectedHotspotId(null);
                  }}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Pin</span>
                </button>
              )}
            </div>

            {(() => {
              const activePin = hotspots.find((p) => p.id === selectedHotspotId);
              if (!activePin) {
                return (
                  <div className="p-8 text-center text-[#71717A] text-xs bg-[#FAF8F5]/60 rounded-2xl border border-dashed border-[#18181B]/15">
                    Click a pin on the hero photo to edit its linked product, label, and coordinates.
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {/* Link Live Supabase Product */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A] mb-1">
                      Link Live Product (Supabase)
                    </label>
                    <select
                      value={activePin.product_id || ""}
                      onChange={(e) => {
                        const chosen = products.find((p) => p.id === e.target.value);
                        if (chosen) {
                          const updated = hotspots.map((p) =>
                            p.id === activePin.id
                              ? {
                                  ...p,
                                  product_id: chosen.id,
                                  product_slug: chosen.slug,
                                  label: chosen.title_en,
                                  price: Number(chosen.base_price),
                                }
                              : p
                          );
                          setHotspots(updated);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 text-xs font-medium text-[#18181B] bg-white"
                    >
                      <option value="">-- Custom / Select Live Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title_en} (₹{Number(p.base_price).toLocaleString("en-IN")})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A] mb-1">
                      Pin Label
                    </label>
                    <input
                      type="text"
                      value={activePin.label}
                      onChange={(e) => {
                        const updated = hotspots.map((p) =>
                          p.id === activePin.id ? { ...p, label: e.target.value } : p
                        );
                        setHotspots(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 text-xs font-semibold text-[#18181B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A] mb-1">
                      Price Tag (₹)
                    </label>
                    <input
                      type="number"
                      value={activePin.price}
                      onChange={(e) => {
                        const updated = hotspots.map((p) =>
                          p.id === activePin.id ? { ...p, price: Number(e.target.value) } : p
                        );
                        setHotspots(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 text-xs font-mono text-[#18181B]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#71717A]">
                    <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#18181B]/10">
                      X: {activePin.x}%
                    </div>
                    <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#18181B]/10">
                      Y: {activePin.y}%
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. CATEGORIES BENTO SPACES CONTROLLER                        */}
      {/* ============================================================ */}
      {activeTab === "bento" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#18181B]/10 shadow-xs space-y-6">
            {/* Informational Callout */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950">
                  <p className="font-semibold">Categories Managed Exclusively on Categories Page</p>
                  <p className="text-amber-800/90 mt-0.5">
                    Category names, subtitles, and cover images are live-synced from the Categories manager.
                    Use this section to select which categories appear on the Landing Page and set their display order.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/categories"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors shrink-0 shadow-xs"
              >
                <span>Edit Categories Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Header & Section Title Input */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#18181B]/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#18181B] block mb-1">
                  Landing Page Categories Bento ({selectedBentoCategoryIds.length} Selected)
                </span>
                <p className="text-xs text-[#71717A]">
                  Select the categories to show on the Landing Page and use the arrow buttons to arrange their order.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A] mb-1">
                  Section Headline
                </label>
                <input
                  type="text"
                  value={bentoTitle}
                  onChange={(e) => setBentoTitle(e.target.value)}
                  placeholder="Designed for Every Space"
                  className="px-3 py-1.5 rounded-xl border border-[#18181B]/15 text-xs font-semibold text-[#18181B] w-64"
                />
              </div>
            </div>

            {/* ACTIVE FEATURED CATEGORIES LIST WITH REORDER */}
            <div className="space-y-3">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                Categories Displayed on Landing Page (in order):
              </span>

              {selectedBentoCategoryIds.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#71717A] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#18181B]/15">
                  No categories selected yet. Add categories below to display them on the landing page bento grid.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedBentoCategoryIds.map((catId, idx) => {
                    const cat = categories.find((c) => c.id === catId);
                    const positionLabel =
                      idx === 0
                        ? "Master Featured (Span 7 • Tall)"
                        : idx === 1
                        ? "Top Accent (Span 5 • Wide)"
                        : idx === 2
                        ? "Bottom Accent (Span 5 • Wide)"
                        : `Standard Row Card #${idx + 1} (Span 6)`;

                    if (!cat) {
                      return (
                        <div
                          key={catId}
                          className="p-3.5 rounded-2xl border border-dashed border-[#18181B]/15 bg-[#FAF8F5]/40 flex items-center justify-between gap-3 text-xs text-[#71717A]"
                        >
                          <span className="italic">Category ID ({catId.slice(0, 12)}...) not found in catalog</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBentoCategory(catId)}
                            className="text-xs text-red-600 hover:text-red-800 p-1 cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={cat.id}
                        className="p-3.5 rounded-2xl border border-[#18181B]/10 bg-[#FAF8F5]/70 hover:bg-[#FAF8F5] transition-all flex items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Order Index & Layout Tag */}
                          <div className="flex flex-col items-center justify-center w-8 h-8 rounded-xl bg-[#18181B]/5 text-[#18181B] font-mono text-xs font-bold shrink-0">
                            0{idx + 1}
                          </div>

                          {/* Live Thumbnail */}
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0 border border-[#18181B]/10 flex items-center justify-center">
                            {cat.cover_image ? (
                              <Image
                                src={cat.cover_image}
                                alt={cat.name_en}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-[9px] font-mono text-[#71717A]">No img</span>
                            )}
                          </div>

                          {/* Live Category Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-[#18181B] truncate">
                                {cat.name_en}
                              </h4>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#9A3412]/10 text-[#9A3412]">
                                {positionLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#71717A] truncate mt-0.5">
                              {cat.subtitle || "No subtitle set on Categories page."}
                            </p>
                            <span className="text-[10px] font-mono text-[#71717A]">
                              /categories/{cat.slug}
                            </span>
                          </div>
                        </div>

                        {/* Reorder Up/Down & Remove Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveBentoCategory(idx, "up")}
                            className="p-1.5 rounded-lg border border-[#18181B]/10 hover:bg-white text-[#71717A] hover:text-[#18181B] disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={idx === selectedBentoCategoryIds.length - 1}
                            onClick={() => handleMoveBentoCategory(idx, "down")}
                            className="p-1.5 rounded-lg border border-[#18181B]/10 hover:bg-white text-[#71717A] hover:text-[#18181B] disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (cat.id) handleRemoveBentoCategory(cat.id);
                            }}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer ml-1"
                            title="Remove from Landing Page"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ADD MORE CATEGORIES SECTION */}
            {unselectedCategories.length > 0 && (
              <div className="pt-4 border-t border-[#18181B]/10 space-y-3">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                  Available Categories (Click to Add to Landing Page):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {unselectedCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3 rounded-xl border border-[#18181B]/10 bg-white hover:border-[#9A3412] transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#18181B]/10">
                          {cat.cover_image ? (
                            <Image
                              src={cat.cover_image}
                              alt={cat.name_en}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-[8px] font-mono text-[#71717A] flex items-center justify-center h-full">No img</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-[#18181B] truncate">{cat.name_en}</h5>
                          <p className="text-[10px] text-[#71717A] truncate">/categories/{cat.slug}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (cat.id) handleAddBentoCategory(cat.id);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#9A3412] text-[#18181B] hover:text-white border border-[#18181B]/10 text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. COMPLETE THE LOOK (ROOM SWITCHER)                         */}
      {/* ============================================================ */}
      {activeTab === "look" && (
        <CompleteTheLookEditor
          availableProducts={selectableProducts}
          initialData={lookInitial?.content as any}
          isActive={activeStates.look ?? true}
          displayOrder={displayOrders.look ?? 2}
          onSaveSuccess={() => {
            setToast({
              success: true,
              message: "Lookbook Room sets updated and live cache revalidated!",
            });
          }}
        />
      )}

      {/* ============================================================ */}
      {/* 4. WALL COLOR MATCHER                                        */}
      {/* ============================================================ */}
      {activeTab === "wall" && (
        <div className="bg-white p-6 rounded-3xl border border-[#18181B]/10 shadow-xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                Design by Wall Color Combinations
              </span>
              <p className="text-xs text-[#71717A]">
                Customize the wall paint tones, designer advice text, and room preview renderings.
              </p>
            </div>

            {/* Add Combination Button */}
            <button
              type="button"
              onClick={() => {
                const newOption: WallColorItem = {
                  id: `wall-${Date.now()}`,
                  wallName: "New Wall Tone",
                  hex: "#EDE9E1",
                  advice: "Pair with pure steel furniture for refined contrast.",
                  image: "/color-beige-navy.png",
                  href: "/categories",
                };
                setWallColors([...wallColors, newOption]);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#18181B]/90 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Wall Tone</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {wallColors.map((color, idx) => (
              <div
                key={color.id}
                className="p-5 rounded-2xl bg-[#FAF8F5]/60 border border-[#18181B]/10 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => {
                        const updated = [...wallColors];
                        updated[idx].hex = e.target.value;
                        setWallColors(updated);
                      }}
                      className="w-10 h-10 rounded-xl border border-[#18181B]/20 cursor-pointer bg-white p-0.5"
                    />
                    <div>
                      <input
                        type="text"
                        value={color.wallName}
                        onChange={(e) => {
                          const updated = [...wallColors];
                          updated[idx].wallName = e.target.value;
                          setWallColors(updated);
                        }}
                        className="w-full px-2.5 py-1 rounded-lg border border-[#18181B]/15 bg-white text-xs font-bold text-[#18181B]"
                      />
                      <span className="text-[10px] font-mono text-[#71717A] uppercase mt-0.5 block">
                        {color.hex}
                      </span>
                    </div>
                  </div>

                  {wallColors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setWallColors(wallColors.filter((_, i) => i !== idx));
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete swatch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/5">
                  {color.image && (
                    <Image
                      src={color.image}
                      alt={color.wallName}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover"
                    />
                  )}
                  <label className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          handleUploadImage(f, "wall_color_matcher", (url) => {
                            const updated = [...wallColors];
                            updated[idx].image = url;
                            setWallColors(updated);
                          }, color.image);
                        }
                      }}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">
                    Designer Advice
                  </label>
                  <textarea
                    rows={2}
                    value={color.advice}
                    onChange={(e) => {
                      const updated = [...wallColors];
                      updated[idx].advice = e.target.value;
                      setWallColors(updated);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#18181B]/15 bg-white text-xs text-[#18181B]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. CRAFTSMANSHIP SPLIT ("Unseen Strength")                   */}
      {/* ============================================================ */}
      {activeTab === "split" && (
        <div className="bg-white p-6 rounded-3xl border border-[#18181B]/10 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                Visual Craftsmanship Split (&quot;Show, Don&apos;t Tell&quot;)
              </span>
              <p className="text-xs text-[#71717A]">
                Two-column macro photography highlighting tactile steel surfaces and precision mechanisms.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Card */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5]/60 border border-[#18181B]/10 space-y-4">
              <span className="text-xs font-mono font-bold uppercase text-[#9A3412]">
                Left Macro Column
              </span>

              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/5">
                {splitLeft.imageUrl && (
                  <Image
                    src={splitLeft.imageUrl}
                    alt={splitLeft.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                )}
                <label className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Upload Macro Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        handleUploadImage(f, "craftsmanship_split", (url) => {
                          setSplitLeft((prev) => ({ ...prev, imageUrl: url }));
                        }, splitLeft.imageUrl);
                      }
                    }}
                  />
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#71717A] mb-1">
                  Caption
                </label>
                <input
                  type="text"
                  value={splitLeft.caption}
                  onChange={(e) => setSplitLeft({ ...splitLeft, caption: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 bg-white text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#71717A] mb-1">
                  Target Link
                </label>
                <input
                  type="text"
                  value={splitLeft.href}
                  onChange={(e) => setSplitLeft({ ...splitLeft, href: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 bg-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Right Card */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5]/60 border border-[#18181B]/10 space-y-4">
              <span className="text-xs font-mono font-bold uppercase text-[#9A3412]">
                Right Macro Column
              </span>

              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/5">
                {splitRight.imageUrl && (
                  <Image
                    src={splitRight.imageUrl}
                    alt={splitRight.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                )}
                <label className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Upload Macro Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        handleUploadImage(f, "craftsmanship_split", (url) => {
                          setSplitRight((prev) => ({ ...prev, imageUrl: url }));
                        }, splitRight.imageUrl);
                      }
                    }}
                  />
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#71717A] mb-1">
                  Caption
                </label>
                <input
                  type="text"
                  value={splitRight.caption}
                  onChange={(e) => setSplitRight({ ...splitRight, caption: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 bg-white text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#71717A] mb-1">
                  Target Link
                </label>
                <input
                  type="text"
                  value={splitRight.href}
                  onChange={(e) => setSplitRight({ ...splitRight, href: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 bg-white text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
