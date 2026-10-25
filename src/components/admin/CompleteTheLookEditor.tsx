"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import {
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Check,
  Search,
  ArrowUp,
  ArrowDown,
  Layers,
  Copy,
  ExternalLink,
  RefreshCw,
  FolderTree,
  Tag,
  IndianRupee,
  ChevronDown,
} from "lucide-react";
import {
  type CompleteTheLookData,
  type CompleteTheLookSet,
} from "@/types/database";
import { saveStorefrontSectionAction } from "@/actions/adminActions";
import { StorageService } from "@/services/StorageService";

// Master Catalog Items available for linking
export interface SelectableProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  image: string;
  tagline: string;
}

const AVAILABLE_PRODUCTS: SelectableProduct[] = [];

const PRESET_ROOM_IMAGES = [
  { label: "Master Bedroom Suite", url: "/hero-bedroom.png" },
  { label: "Navy Wardrobe Room", url: "/bento-wardrobe-navy.png" },
  { label: "Executive Studio Office", url: "/switcher-office-room.png" },
  { label: "Living Console Lounge", url: "/bento-tv-console.png" },
  { label: "Dining Hall Space", url: "/bento-dining-table.png" },
];

const CATEGORY_LINKS = [
  { label: "Bedroom Collection", href: "/categories/bedroom" },
  { label: "Living Collection", href: "/categories/living-room" },
  { label: "Dining Collection", href: "/categories/dining" },
  { label: "Workspace Collection", href: "/categories/workspace" },
];

export interface CompleteTheLookEditorProps {
  availableProducts?: SelectableProduct[];
  initialData?: CompleteTheLookData;
  isActive?: boolean;
  displayOrder?: number;
  onSaveSuccess?: () => void;
}

export function CompleteTheLookEditor({
  availableProducts = [],
  initialData,
  isActive = true,
  displayOrder = 3,
  onSaveSuccess,
}: CompleteTheLookEditorProps = {}) {
  const productsList = availableProducts;

  const [data, setData] = useState<CompleteTheLookData>(() => {
    if (initialData?.sets && initialData.sets.length > 0) {
      return initialData;
    }
    // Clean initial sets referencing only live products if available, or empty
    const firstTwoProdIds = productsList.slice(0, 2).map((p) => p.id);
    return {
      sets: [
        {
          id: "set-1",
          tabName: "Living Room",
          badgeLabel: "Featured Living Collection",
          lifestyleImage: "/bento-tv-console.png",
          linkedProductIds: firstTwoProdIds,
          exploreLink: {
            text: "Explore Living Collection",
            href: "/categories/living-room",
          },
        },
      ],
    };
  });

  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [toast, setToast] = useState<{ success: boolean; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSet = data.sets[activeSetIndex] || data.sets[0];

  // Filtered available products for combobox
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return productsList.filter((prod) => {
      // Exclude already linked products
      const isAlreadyLinked = currentSet?.linkedProductIds.includes(prod.id);
      if (isAlreadyLinked) return false;

      if (!query) return true;
      return (
        prod.title.toLowerCase().includes(query) ||
        prod.category.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, currentSet?.linkedProductIds, productsList]);

  // Handle Image Upload using StorageService with WebP Canvas compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const oldImage = currentSet?.lifestyleImage;
    setIsUploading(true);
    try {
      const res = await StorageService.uploadStorefrontMedia(file, "complete_the_look");
      const updatedSets = [...data.sets];
      updatedSets[activeSetIndex].lifestyleImage = res.publicUrl;
      setData({ sets: updatedSets });

      // Prune previous lifestyle image from storage if replaced
      if (oldImage && oldImage !== res.publicUrl) {
        await StorageService.deleteMediaByUrl(oldImage);
      }
    } catch (err) {
      console.error("Storage upload failed:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Add new product to current set
  const handleLinkProduct = (productId: string) => {
    if (currentSet.linkedProductIds.length >= 4) return;
    const updatedSets = [...data.sets];
    updatedSets[activeSetIndex].linkedProductIds = [
      ...currentSet.linkedProductIds,
      productId,
    ];
    setData({ sets: updatedSets });
    setIsComboboxOpen(false);
    setSearchQuery("");
  };

  // Remove linked product
  const handleRemoveProduct = (productId: string) => {
    const updatedSets = [...data.sets];
    updatedSets[activeSetIndex].linkedProductIds = currentSet.linkedProductIds.filter(
      (id) => id !== productId
    );
    setData({ sets: updatedSets });
  };

  // Reorder product up/down
  const handleMoveProduct = (index: number, direction: "up" | "down") => {
    const ids = [...currentSet.linkedProductIds];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ids.length) return;

    const temp = ids[index];
    ids[index] = ids[targetIndex];
    ids[targetIndex] = temp;

    const updatedSets = [...data.sets];
    updatedSets[activeSetIndex].linkedProductIds = ids;
    setData({ sets: updatedSets });
  };

  // Add a new Room Set
  const handleAddSet = () => {
    const newSet: CompleteTheLookSet = {
      id: `set-${Date.now().toString(36)}`,
      tabName: "Dining Room",
      badgeLabel: "Dining Suite Set",
      lifestyleImage: "/bento-dining-table.png",
      linkedProductIds: ["prod-dining-table"],
      exploreLink: {
        text: "Explore Dining Collection",
        href: "/categories/dining",
      },
    };
    setData((prev) => ({ sets: [...prev.sets, newSet] }));
    setActiveSetIndex(data.sets.length);
  };

  // Duplicate current Room Set
  const handleDuplicateSet = (index: number) => {
    const source = data.sets[index];
    if (!source) return;

    const copy: CompleteTheLookSet = {
      ...source,
      id: `set-clone-${Date.now().toString(36)}`,
      tabName: `${source.tabName} (Copy)`,
      badgeLabel: `${source.badgeLabel} (Copy)`,
      linkedProductIds: [...source.linkedProductIds],
    };

    const updated = [...data.sets];
    updated.splice(index + 1, 0, copy);
    setData({ sets: updated });
    setActiveSetIndex(index + 1);
  };

  // Save changes via Server Action
  const handleSave = async () => {
    setIsSaving(true);
    setToast(null);

    try {
      const res = await saveStorefrontSectionAction(
        "complete_the_look",
        data as unknown as Record<string, unknown>,
        "Complete the Look",
        "कमप्लीट द लुक",
        isActive,
        displayOrder
      );
      if (res.success && onSaveSuccess) {
        onSaveSuccess();
      }
      setToast({
        success: true,
        message: "Room switcher updated! Instant cache revalidation pushed to live storefront.",
      });
    } catch (err) {
      setToast({
        success: false,
        message: err instanceof Error ? err.message : "Failed to save Room Switcher.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Feedback */}
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
            Dismiss
          </button>
        </div>
      )}

      {/* Editor Sub-Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#18181B]/10">
        <div>
          <span className="text-xs font-mono font-semibold text-[#9A3412] uppercase tracking-wider">
            Room Switcher Engine
          </span>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-[#18181B]">
            &quot;Complete the Look&quot; Visual Editor
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Manage multi-room collections, lifestyle hero sets, and up to 4 companion furniture pieces.
          </p>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#b03c15] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          {isSaving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          <span>Save & Revalidate</span>
        </button>
      </div>

      {/* Room Sets Horizontal Tab Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-[#18181B]/10 overflow-x-auto shadow-2xs">
        <div className="flex items-center gap-2">
          {data.sets.map((set, idx) => {
            const isSelected = activeSetIndex === idx;
            return (
              <button
                key={set.id}
                type="button"
                onClick={() => setActiveSetIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? "bg-[#18181B] text-white shadow-xs"
                    : "bg-[#FAF8F5] text-[#18181B] hover:bg-[#FAF8F5]/80 border border-[#18181B]/10"
                }`}
              >
                <span>{set.tabName}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-[#18181B]/5 text-[#71717A]"
                  }`}
                >
                  {set.linkedProductIds.length} items
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-[#18181B]/10 shrink-0">
          <button
            type="button"
            onClick={() => handleDuplicateSet(activeSetIndex)}
            className="p-2 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5] text-xs font-medium text-[#18181B] hover:border-[#9A3412] hover:text-[#9A3412] flex items-center gap-1 cursor-pointer"
            title="Duplicate current set"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          <button
            type="button"
            onClick={handleAddSet}
            className="p-2 rounded-xl bg-[#18181B] text-white text-xs font-semibold hover:bg-[#9A3412] flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Room Set</span>
          </button>

          {data.sets.length > 1 && (
            <button
              type="button"
              onClick={async () => {
                const targetSet = data.sets[activeSetIndex];
                const updated = data.sets.filter((_, i) => i !== activeSetIndex);
                setData({ sets: updated });
                setActiveSetIndex(0);
                if (targetSet?.lifestyleImage) {
                  await StorageService.deleteMediaByUrl(targetSet.lifestyleImage);
                }
              }}
              className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium cursor-pointer"
              title="Delete set and remove image from storage"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: Left Master Photo vs Right Product Selector */}
      {currentSet && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ============================================================ */}
          {/* LEFT SIDE: MASTER PHOTO & OVERLAY BADGE (7 cols)             */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#18181B]/10 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                  Master Room Photography
                </span>
                <p className="text-xs text-[#71717A]">
                  Edge-to-edge sunlit showroom set with live badge pill overlay.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] text-[#71717A]">
                16:9 Showcase
              </span>
            </div>

            {/* Overlaid Lifestyle Photo Dropzone */}
            <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#18181B]/15 group">
              <Image
                src={currentSet.lifestyleImage}
                alt={currentSet.badgeLabel}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />

              {/* OVERLAID BADGE LABEL INPUT */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 max-w-[85%]">
                <div className="bg-[#18181B]/90 backdrop-blur-md rounded-xl p-1.5 pl-2.5 border border-white/20 flex items-center gap-1.5 shadow-lg">
                  <Tag className="w-3.5 h-3.5 text-[#9A3412]" />
                  <input
                    type="text"
                    value={currentSet.badgeLabel}
                    onChange={(e) => {
                      const updatedSets = [...data.sets];
                      updatedSets[activeSetIndex].badgeLabel = e.target.value;
                      setData({ sets: updatedSets });
                    }}
                    placeholder="e.g. Master Suite Set"
                    className="bg-transparent text-white text-xs font-semibold focus:outline-none placeholder:text-white/50 w-36 sm:w-48"
                  />
                </div>
              </div>

              {/* Upload Replace Overlay */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
              >
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-[#9A3412]" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 mb-1 text-[#9A3412]" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Tap to Replace Room Photo
                    </span>
                    <span className="text-[10px] text-white/70">
                      Auto-compressed to .webp in furniture-media
                    </span>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Room Photography Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                Quick Lifestyle Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ROOM_IMAGES.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => {
                      const updatedSets = [...data.sets];
                      updatedSets[activeSetIndex].lifestyleImage = preset.url;
                      setData({ sets: updatedSets });
                    }}
                    className={`text-xs px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                      currentSet.lifestyleImage === preset.url
                        ? "bg-[#18181B] text-white border-[#18181B]"
                        : "bg-[#FAF8F5] text-[#18181B] border-[#18181B]/10 hover:border-[#18181B]/30"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Set Tab Name Input */}
            <div className="pt-3 border-t border-[#18181B]/5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                Horizontal Tab Name (Customer View)
              </label>
              <input
                type="text"
                value={currentSet.tabName}
                onChange={(e) => {
                  const updatedSets = [...data.sets];
                  updatedSets[activeSetIndex].tabName = e.target.value;
                  setData({ sets: updatedSets });
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/40 text-sm font-semibold text-[#18181B]"
                placeholder="e.g. Bedroom"
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT SIDE: SEARCHABLE PRODUCT SELECTOR & REORDER (5 cols)   */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#18181B]/10 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#18181B]/10">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#18181B]">
                  Linked Furniture Pieces
                </h3>
                <p className="text-xs text-[#71717A]">
                  Select up to 4 matching pieces for this set.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#9A3412]">
                {currentSet.linkedProductIds.length} / 4 Linked
              </span>
            </div>

            {/* SEARCHABLE COMBOBOX / DROPDOWN */}
            {currentSet.linkedProductIds.length < 4 && (
              <div className="relative">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                  Search & Add Product
                </label>

                <div
                  data-testid="combobox-trigger"
                  onClick={() => setIsComboboxOpen(!isComboboxOpen)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/40 flex items-center justify-between cursor-pointer hover:border-[#9A3412] transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs text-[#71717A]">
                    <Search className="w-3.5 h-3.5" />
                    <span>Choose from live furniture catalog...</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#71717A]" />
                </div>

                {/* Combobox Dropdown Popover */}
                {isComboboxOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-[#18181B]/15 shadow-2xl z-30 p-2 space-y-2 max-h-72 overflow-y-auto">
                    <div className="relative p-1">
                      <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by title or category..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#18181B]/15 text-xs text-[#18181B] focus:outline-none"
                      />
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                    </div>

                    <div className="divide-y divide-[#18181B]/5">
                      {filteredProducts.map((p) => (
                        <div
                          key={p.id}
                          data-testid="combobox-item"
                          onClick={() => handleLinkProduct(p.id)}
                          className="p-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#18181B]/10">
                              <Image
                                src={p.image}
                                alt={p.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-[#18181B] group-hover:text-[#9A3412]">
                                {p.title}
                              </h5>
                              <p className="text-[10px] text-[#71717A]">{p.category}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#18181B]">
                            ₹{p.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}

                      {filteredProducts.length === 0 && (
                        <div className="p-4 text-center text-xs text-[#71717A]">
                          No additional matching products found.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CURRENT LINKED PRODUCTS LIST (With Read-Only Cards & Reorder Handles) */}
            <div className="space-y-3">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                Active Set Items (Drag/Reorder):
              </span>

              {currentSet.linkedProductIds.map((productId, idx) => {
                const product = productsList.find((p) => p.id === productId);
                if (!product) {
                  return (
                    <div
                      key={productId}
                      data-testid="linked-product-unlinked"
                      className="p-3.5 rounded-2xl border border-dashed border-[#18181B]/15 bg-[#FAF8F5]/40 flex items-center justify-between gap-3 text-xs text-[#71717A]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#18181B]/5">0{idx + 1}</span>
                        <span className="italic">Linked Product ({productId.slice(0, 12)}...) not in catalog</span>
                      </div>
                      <button
                        type="button"
                        data-testid="remove-product-btn"
                        onClick={() => handleRemoveProduct(productId)}
                        className="text-xs text-red-600 hover:text-red-800 p-1 cursor-pointer flex items-center gap-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  );
                }

                const hasImage = Boolean(product.image && product.image.trim() !== "");

                return (
                  <div
                    key={productId}
                    data-testid="linked-product-card"
                    className="p-3.5 rounded-2xl border border-[#18181B]/10 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Thumbnail */}
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-[#18181B]/10 flex items-center justify-center">
                        {hasImage ? (
                          <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-[9px] font-mono text-[#71717A]">No img</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#18181B]/5 text-[#71717A]">
                            0{idx + 1}
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-[#9A3412]">
                            {product.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#18181B] line-clamp-1">
                          {product.title}
                        </h4>
                        <span className="text-xs font-semibold text-[#18181B]">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Reorder Arrows & Remove Action */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveProduct(idx, "up")}
                        className="p-1 rounded-lg border border-[#18181B]/10 hover:bg-white text-[#71717A] disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === currentSet.linkedProductIds.length - 1}
                        onClick={() => handleMoveProduct(idx, "down")}
                        className="p-1 rounded-lg border border-[#18181B]/10 hover:bg-white text-[#71717A] disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        data-testid="remove-product-btn"
                        onClick={() => handleRemoveProduct(productId)}
                        className="p-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer ml-1"
                        title="Remove from Set"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {currentSet.linkedProductIds.length === 0 && (
                <div className="p-6 text-center text-xs text-[#71717A] rounded-2xl border border-dashed border-[#18181B]/15">
                  No products linked yet. Use the search dropdown above to add matching pieces.
                </div>
              )}
            </div>

            {/* BOTTOM ACTION: EXPLORE COLLECTION LINK & TARGET DROPDOWN */}
            <div className="pt-4 border-t border-[#18181B]/10 space-y-3">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#18181B]">
                Bottom Navigation Action
              </span>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={currentSet.exploreLink.text}
                  onChange={(e) => {
                    const updatedSets = [...data.sets];
                    updatedSets[activeSetIndex].exploreLink.text = e.target.value;
                    setData({ sets: updatedSets });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 bg-white text-xs font-semibold text-[#18181B]"
                  placeholder="e.g. Explore Bedroom Collection"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">
                  Target Category Link
                </label>
                <select
                  value={currentSet.exploreLink.href}
                  onChange={(e) => {
                    const updatedSets = [...data.sets];
                    updatedSets[activeSetIndex].exploreLink.href = e.target.value;
                    setData({ sets: updatedSets });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 bg-white text-xs font-medium text-[#18181B] cursor-pointer"
                >
                  {CATEGORY_LINKS.map((c) => (
                    <option key={c.href} value={c.href}>
                      {c.label} ({c.href})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
