"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductBlueprintSchema,
  type ProductBlueprintFormData,
  type ProductCategory,
} from "@/types/adminProduct";
import { createProductBlueprintAction, type ActionResult } from "@/actions/adminProduct";
import { StorageService } from "@/services/StorageService";
import {
  Sparkles,
  Layers,
  Copy,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Ruler,
  Paintbrush,
  IndianRupee,
  ShieldCheck,
  Check,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

// Curated presets for quick image assignment & testing
const PRESET_IMAGES = {
  lifestyle: [
    { label: "Master Bedroom", url: "/hero-bedroom.png" },
    { label: "Navy Wardrobe Room", url: "/bento-wardrobe-navy.png" },
    { label: "Living Console", url: "/bento-tv-console.png" },
    { label: "Study Desk Set", url: "/bento-office-desk.png" },
    { label: "Tall Storage Set", url: "/bento-storage.png" },
    { label: "Executive Room", url: "/switcher-office-room.png" },
  ],
  studio: [
    { label: "Studio Drawer (3-Door)", url: "/product-drawer-isolated.png" },
    { label: "Studio Minimalist Desk", url: "/product-desk-isolated.png" },
    { label: "Studio Steel Chair", url: "/product-chair-isolated.jpg" },
  ],
  functional: [
    { label: "Inside Locker PNG", url: "/inside-wardrobe-locker.png" },
    { label: "Inside Locker JPG", url: "/inside-wardrobe-locker.jpg" },
  ],
  macro: [
    { label: "Electrostatic Powder Finish", url: "/macro-matte-steel.png" },
    { label: "Concealed 90° Steel Hinge", url: "/macro-hinge.png" },
  ],
};

const COLOR_PRESETS = [
  { name: "Matte Charcoal", hex: "#36454F" },
  { name: "Matte Navy", hex: "#1E3A5F" },
  { name: "Soft Ivory", hex: "#FDFBF7" },
  { name: "Warm Terracotta", hex: "#C25946" },
  { name: "Sage Green", hex: "#A8B5A1" },
  { name: "Deep Emerald", hex: "#1B4D3E" },
];

const numRegisterOpts = {
  setValueAs: (v: unknown) =>
    v === "" || v === null || v === undefined || isNaN(Number(v)) ? undefined : Number(v),
};

const requiredNumRegisterOpts = {
  setValueAs: (v: unknown) =>
    v === "" || v === null || v === undefined || isNaN(Number(v)) ? 0 : Number(v),
};

export function ProductBlueprintForm() {
  const [serverFeedback, setServerFeedback] = useState<ActionResult | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Initialize React Hook Form with Zod validation
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductBlueprintFormData>({
    resolver: zodResolver(ProductBlueprintSchema),
    defaultValues: {
      title: "",
      tagline: "",
      category_id: "wardrobes_storage",
      base_price: 0,
      material_gauge: "Tata 20-Gauge CRCA Steel",
      warranty_years: 10,
      dimensions: {
        height: 0,
        width: 0,
        depth: 0,
        length: undefined,
        headboard_height: undefined,
        total_height: undefined,
        seat_height: undefined,
      },
      variants: [
        {
          id: "var-initial-1",
          size_config_label: "Standard Size",
          finish_name: "Matte Charcoal",
          ui_hex_code: "#36454F",
          price: 0,
          stock_status: "in_stock",
          images: {
            lifestyle_image: "",
            studio_front_image: "",
            functional_view_image: "",
            macro_detail_image: "",
          },
        },
      ],
    },
  });

  // Flat Variant Matrix Field Array
  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "variants",
  });

  // Dynamic Category Watcher
  const selectedCategory = watch("category_id") as ProductCategory;
  const currentVariants = watch("variants");

  // Handler for Variant Duplication
  const handleDuplicateVariant = (index: number) => {
    const sourceVariant = currentVariants[index];
    if (!sourceVariant) return;

    const duplicatedItem = {
      ...sourceVariant,
      id: `var-clone-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      size_config_label: `${sourceVariant.size_config_label} (Copy)`,
    };

    insert(index + 1, duplicatedItem);

    setServerFeedback({
      success: true,
      message: `Variant #${index + 1} duplicated into #${index + 2} with all 4 media slots cloned.`,
    });
    setToastVisible(true);
  };

  // Add a blank variant
  const handleAddBlankVariant = () => {
    append({
      id: `var-new-${Date.now().toString(36)}`,
      size_config_label: "",
      finish_name: "Matte Navy",
      ui_hex_code: "#1E3A5F",
      price: watch("base_price") || 29999,
      stock_status: "in_stock",
      images: {
        lifestyle_image: "",
        studio_front_image: "",
        functional_view_image: "",
        macro_detail_image: "",
      },
    });
  };

  // Form Submit Handler connecting to Next.js Server Action
  const onSubmit = async (data: ProductBlueprintFormData) => {
    setServerFeedback(null);
    try {
      const response = await createProductBlueprintAction(data);
      setServerFeedback(response);
      setToastVisible(true);

      if (response.success) {
        // Optional smooth scroll to notification
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setServerFeedback({
        success: false,
        message: err instanceof Error ? err.message : "Failed to publish blueprint.",
      });
      setToastVisible(true);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-24 text-[#18181B]">
      {/* Toast Notification Container */}
      {toastVisible && serverFeedback && (
        <div
          role="alert"
          id="admin-form-toast"
          className={`fixed top-6 right-4 sm:right-8 z-50 max-w-md w-full p-4 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 flex items-start gap-3 ${
            serverFeedback.success
              ? "bg-[#FAF8F5]/95 border-emerald-600/30 text-[#18181B]"
              : "bg-red-50/95 border-red-500/30 text-red-950"
          }`}
        >
          {serverFeedback.success ? (
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}

          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-base mb-1">
              {serverFeedback.success ? "Blueprint Published" : "Validation / Server Notice"}
            </h4>
            <p className="opacity-90 leading-relaxed">{serverFeedback.message}</p>
            {serverFeedback.productId && (
              <p className="mt-1 font-mono text-xs text-[#9A3412]">
                Ref: {serverFeedback.productId}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setToastVisible(false)}
            className="p-1 rounded-md text-[#71717A] hover:text-[#18181B] transition-colors"
            aria-label="Close Toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Form Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B]/5 border border-[#18181B]/10 text-xs font-medium tracking-wide uppercase text-[#71717A] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#9A3412]" />
          Admin Catalog Engine
        </div>
        <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-[#18181B]">
          Product Blueprint & Variant Matrix
        </h1>
        <p className="text-sm md:text-base text-[#71717A] mt-2 max-w-2xl">
          Configure master furniture specifications and build dynamic multi-dimensional color & size
          variants using our flat JSONB schema engine.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" id="product-blueprint-form">
        {/* SECTION 1: Master Specification */}
        <div className="bg-white rounded-2xl border border-[#18181B]/10 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#18181B]/5">
            <div className="w-7 h-7 rounded-lg bg-[#9A3412]/10 text-[#9A3412] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-lg md:text-xl font-medium text-[#18181B]">
              1. Master Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="input-title" className="block text-xs font-medium tracking-wide uppercase text-[#71717A] mb-1.5">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                id="input-title"
                type="text"
                {...register("title")}
                placeholder="e.g. The Sovereign Tri-Door Wardrobe"
                className="w-full px-4 py-2.5 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B] transition-all"
              />
              {errors.title && (
                <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Tagline */}
            <div className="md:col-span-2">
              <label htmlFor="input-tagline" className="block text-xs font-medium tracking-wide uppercase text-[#71717A] mb-1.5">
                Editorial Tagline <span className="text-red-500">*</span>
              </label>
              <input
                id="input-tagline"
                type="text"
                {...register("tagline")}
                placeholder="e.g. Heavy-gauge CRCA cold-rolled steel with seamless powder coating"
                className="w-full px-4 py-2.5 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B] transition-all"
              />
              {errors.tagline && (
                <p className="text-xs text-red-600 mt-1">{errors.tagline.message}</p>
              )}
            </div>

            {/* Category Selector */}
            <div>
              <label htmlFor="select-category" className="block text-xs font-medium tracking-wide uppercase text-[#71717A] mb-1.5">
                Furniture Category <span className="text-red-500">*</span>
              </label>
              <select
                id="select-category"
                {...register("category_id")}
                className="w-full px-4 py-2.5 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B] transition-all cursor-pointer"
              >
                <option value="wardrobes_storage">Wardrobes / Storage</option>
                <option value="beds">Beds & Sleeping</option>
                <option value="seating">Seating & Lounge Chairs</option>
              </select>
              <p className="text-xs text-[#71717A] mt-1">
                Dynamically dictates required dimension parameters.
              </p>
            </div>

            {/* Base Price */}
            <div>
              <label htmlFor="input-base-price" className="block text-xs font-medium tracking-wide uppercase text-[#71717A] mb-1.5">
                Base Catalog Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]">
                  <IndianRupee className="w-4 h-4" />
                </span>
                <input
                  id="input-base-price"
                  type="number"
                  {...register("base_price", requiredNumRegisterOpts)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B] transition-all"
                />
              </div>
              {errors.base_price && (
                <p className="text-xs text-red-600 mt-1">{errors.base_price.message}</p>
              )}
            </div>

            {/* Material Gauge */}
            <div>
              <label htmlFor="input-gauge" className="block text-xs font-medium tracking-wide uppercase text-[#71717A] mb-1.5">
                Steel Specification <span className="text-red-500">*</span>
              </label>
              <input
                id="input-gauge"
                type="text"
                {...register("material_gauge")}
                placeholder="e.g. Tata 20-Gauge CRCA Steel"
                className="w-full px-4 py-2.5 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B] transition-all"
              />
              {errors.material_gauge && (
                <p className="text-xs text-red-600 mt-1">{errors.material_gauge.message}</p>
              )}
            </div>

            {/* Warranty */}
            <div>
              <label htmlFor="input-warranty" className="block text-xs font-medium tracking-wide uppercase text-[#71717A] mb-1.5">
                Warranty Coverage (Years) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <input
                  id="input-warranty"
                  type="number"
                  {...register("warranty_years", requiredNumRegisterOpts)}
                  placeholder="10"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B] transition-all"
                />
              </div>
              {errors.warranty_years && (
                <p className="text-xs text-red-600 mt-1">{errors.warranty_years.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Dynamic Category-Driven Dimensions */}
        <div className="bg-white rounded-2xl border border-[#18181B]/10 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#18181B]/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#9A3412]/10 text-[#9A3412] flex items-center justify-center">
                <Ruler className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-medium text-[#18181B]">
                  2. Category-Driven Dimensions
                </h2>
                <p className="text-xs text-[#71717A]">
                  Active Schema:{" "}
                  <span className="font-semibold text-[#18181B]">
                    {selectedCategory === "wardrobes_storage"
                      ? "Wardrobes & Storage (Height, Width, Depth)"
                      : selectedCategory === "beds"
                      ? "Beds & Sleeping (Length, Width, Headboard Height)"
                      : selectedCategory === "seating"
                      ? "Seating & Lounge (Total Height, Seat Height, Width)"
                      : selectedCategory}
                  </span>
                </p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-mono bg-[#FAF8F5] border border-[#18181B]/10 text-[#71717A]">
              Stored as JSONB
            </div>
          </div>

          {/* Conditional Rendering Based on Category */}
          {(selectedCategory === "wardrobes_storage" || (selectedCategory as string) === "wardrobes") && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#18181B]/5 text-xs text-[#71717A]">
                <strong className="text-[#18181B]">Wardrobe Spatial Rules:</strong> Standard Indian homes require vertical clearance. Specify Height, Width, and Depth in inches.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="dim-height" className="block text-xs font-medium uppercase text-[#71717A] mb-1">
                    Height (Inches) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dim-height"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 78"
                    {...register("dimensions.height", numRegisterOpts)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B]"
                  />
                  {errors.dimensions?.height && (
                    <p className="text-xs text-red-600 mt-1">{errors.dimensions.height.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dim-width" className="block text-xs font-medium uppercase text-[#71717A] mb-1">
                    Width (Inches) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dim-width"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 36"
                    {...register("dimensions.width", numRegisterOpts)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B]"
                  />
                  {errors.dimensions?.width && (
                    <p className="text-xs text-red-600 mt-1">{errors.dimensions.width.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dim-depth" className="block text-xs font-medium uppercase text-[#71717A] mb-1">
                    Depth (Inches) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dim-depth"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 22"
                    {...register("dimensions.depth", numRegisterOpts)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B]"
                  />
                  {errors.dimensions?.depth && (
                    <p className="text-xs text-red-600 mt-1">{errors.dimensions.depth.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedCategory === "beds" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#18181B]/5 text-xs text-[#71717A]">
                <strong className="text-[#18181B]">Bed Spatial Rules:</strong> Mattress alignment depends on inner platform dimensions plus headboard clearance.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="dim-length" className="block text-xs font-medium uppercase text-[#71717A] mb-1">
                    Length (Inches) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dim-length"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 78"
                    {...register("dimensions.length", numRegisterOpts)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B]"
                  />
                  {errors.dimensions?.length && (
                    <p className="text-xs text-red-600 mt-1">{errors.dimensions.length.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dim-bed-width" className="block text-xs font-medium uppercase text-[#71717A] mb-1">
                    Width (Inches) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dim-bed-width"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 72 (King) or 60 (Queen)"
                    {...register("dimensions.width", numRegisterOpts)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B]"
                  />
                  {errors.dimensions?.width && (
                    <p className="text-xs text-red-600 mt-1">{errors.dimensions.width.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dim-headboard" className="block text-xs font-medium uppercase text-[#71717A] mb-1">
                    Headboard Height (Inches) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dim-headboard"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 48"
                    {...register("dimensions.headboard_height", numRegisterOpts)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B]"
                  />
                  {errors.dimensions?.headboard_height && (
                    <p className="text-xs text-red-600 mt-1">{errors.dimensions.headboard_height.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedCategory === "seating" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#18181B]/5 text-xs text-[#71717A]">
                <strong className="text-[#18181B]">Seating Spatial Rules:</strong> Ergonomic support requires Total Height, Seat Height (standard 18&quot;), and Width.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="dim-total-height" className="block text-xs font-medium uppercase text-[#71717A] mb-1">
                    Total Height (Inches) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dim-total-height"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 33"
                    {...register("dimensions.total_height", numRegisterOpts)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B]"
                  />
                  {errors.dimensions?.total_height && (
                    <p className="text-xs text-red-600 mt-1">{errors.dimensions.total_height.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dim-seat-height" className="block text-xs font-medium uppercase text-[#71717A] mb-1">
                    Seat Height (Inches) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dim-seat-height"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 18"
                    {...register("dimensions.seat_height", numRegisterOpts)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B]"
                  />
                  {errors.dimensions?.seat_height && (
                    <p className="text-xs text-red-600 mt-1">{errors.dimensions.seat_height.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dim-chair-width" className="block text-xs font-medium uppercase text-[#71717A] mb-1">
                    Width (Inches) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dim-chair-width"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 24"
                    {...register("dimensions.width", numRegisterOpts)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B]"
                  />
                  {errors.dimensions?.width && (
                    <p className="text-xs text-red-600 mt-1">{errors.dimensions.width.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: Flat Variant Engine & 4-Slot Uploader */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#9A3412]/10 text-[#9A3412] flex items-center justify-center">
                  <Paintbrush className="w-4 h-4" />
                </div>
                <h2 className="text-xl md:text-2xl font-serif text-[#18181B]">
                  3. Flat Variant Matrix ({fields.length})
                </h2>
              </div>
              <p className="text-xs md:text-sm text-[#71717A] mt-1">
                Each variant encapsulates a size/finish pair with an independent price and up to 4 media slots (at least 1 required).
              </p>
            </div>

            <button
              type="button"
              id="btn-add-variant"
              onClick={handleAddBlankVariant}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181B] text-[#FAF8F5] text-xs font-medium tracking-wide uppercase hover:bg-[#9A3412] transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Add Variant
            </button>
          </div>

          {errors.variants?.message && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.variants.message}
            </div>
          )}

          {/* Variants List */}
          <div className="space-y-8">
            {fields.map((field, index) => {
              const variantImages = watch(`variants.${index}.images`);
              const currentHex = watch(`variants.${index}.ui_hex_code`);

              return (
                <div
                  key={field.id}
                  id={`variant-card-${index}`}
                  className="bg-white rounded-2xl border border-[#18181B]/10 p-6 md:p-8 shadow-sm transition-all"
                >
                  {/* Variant Card Top Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-[#18181B]/5">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#18181B] text-[#FAF8F5] text-xs font-mono font-semibold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-[#18181B] flex items-center gap-2">
                          {watch(`variants.${index}.size_config_label`) || `Variant #${index + 1}`}
                          <span
                            className="inline-block w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: currentHex || "#36454F" }}
                          />
                        </h3>
                        <p className="text-xs text-[#71717A]">
                          {watch(`variants.${index}.finish_name`) || "Custom Finish"} • ₹
                          {watch(`variants.${index}.price`)?.toLocaleString("en-IN") || 0}
                        </p>
                      </div>
                    </div>

                    {/* Variant Actions: Duplicate & Delete */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id={`btn-duplicate-variant-${index}`}
                        onClick={() => handleDuplicateVariant(index)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#18181B]/15 hover:border-[#9A3412] hover:text-[#9A3412] bg-[#FAF8F5] text-xs font-medium text-[#18181B] transition-colors cursor-pointer"
                        title="Duplicate Variant with all 4 uploaded media slots"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Duplicate</span>
                      </button>

                      <button
                        type="button"
                        id={`btn-delete-variant-${index}`}
                        disabled={fields.length <= 1}
                        onClick={() => remove(index)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#18181B]/15 hover:border-red-500 hover:text-red-600 bg-[#FAF8F5] text-xs font-medium text-[#18181B] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title={fields.length <= 1 ? "At least 1 variant is required" : "Delete variant"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Variant Config Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {/* Size / Config Label */}
                    <div>
                      <label htmlFor={`var-${index}-size`} className="block text-xs font-medium uppercase text-[#71717A] mb-1">
                        Size / Config Label <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`var-${index}-size`}
                        type="text"
                        placeholder="e.g. Standard 3-Door"
                        {...register(`variants.${index}.size_config_label`)}
                        className="w-full px-3.5 py-2 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B]"
                      />
                      {errors.variants?.[index]?.size_config_label && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.variants[index]?.size_config_label?.message}
                        </p>
                      )}
                    </div>

                    {/* Finish / Color Name */}
                    <div>
                      <label htmlFor={`var-${index}-finish`} className="block text-xs font-medium uppercase text-[#71717A] mb-1">
                        Finish / Color Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`var-${index}-finish`}
                        type="text"
                        placeholder="e.g. Matte Charcoal"
                        {...register(`variants.${index}.finish_name`)}
                        className="w-full px-3.5 py-2 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B]"
                      />
                      {errors.variants?.[index]?.finish_name && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.variants[index]?.finish_name?.message}
                        </p>
                      )}
                    </div>

                    {/* UI Hex Code with Swatch & Presets */}
                    <div>
                      <label htmlFor={`var-${index}-hex`} className="block text-xs font-medium uppercase text-[#71717A] mb-1">
                        UI Hex Color Code <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentHex?.startsWith("#") ? currentHex : "#36454F"}
                          onChange={(e) => setValue(`variants.${index}.ui_hex_code`, e.target.value)}
                          className="w-9 h-9 rounded-lg border border-[#18181B]/20 cursor-pointer p-0.5 bg-white shrink-0"
                          title="Pick custom hex color"
                        />
                        <input
                          id={`var-${index}-hex`}
                          type="text"
                          placeholder="#36454F"
                          {...register(`variants.${index}.ui_hex_code`)}
                          className="w-full px-3 py-2 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B] font-mono uppercase"
                        />
                      </div>

                      {/* Quick Swatch Palette Pills */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {COLOR_PRESETS.map((color) => (
                          <button
                            key={color.hex}
                            type="button"
                            onClick={() => {
                              setValue(`variants.${index}.ui_hex_code`, color.hex);
                              setValue(`variants.${index}.finish_name`, color.name);
                            }}
                            className="w-4 h-4 rounded-full border border-black/15 shadow-2xs hover:scale-125 transition-transform cursor-pointer"
                            style={{ backgroundColor: color.hex }}
                            title={`${color.name} (${color.hex})`}
                          />
                        ))}
                      </div>

                      {errors.variants?.[index]?.ui_hex_code && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.variants[index]?.ui_hex_code?.message}
                        </p>
                      )}
                    </div>

                    {/* Variant-Specific Price & Stock */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor={`var-${index}-price`} className="block text-xs font-medium uppercase text-[#71717A] mb-1">
                          Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          id={`var-${index}-price`}
                          type="number"
                          {...register(`variants.${index}.price`, requiredNumRegisterOpts)}
                          className="w-full px-3 py-2 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-sm text-[#18181B]"
                        />
                      </div>

                      <div>
                        <label htmlFor={`var-${index}-stock`} className="block text-xs font-medium uppercase text-[#71717A] mb-1">
                          Stock Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          id={`var-${index}-stock`}
                          {...register(`variants.${index}.stock_status`)}
                          className="w-full px-2 py-2 rounded-lg border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-xs text-[#18181B] cursor-pointer"
                        >
                          <option value="in_stock">In Stock</option>
                          <option value="made_to_order">Made to Order</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 4-SLOT IMAGE UPLOADER */}
                  <div className="pt-5 border-t border-[#18181B]/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-[#9A3412]" />
                        <h4 className="text-sm font-semibold tracking-wide text-[#18181B]">
                          4-Slot Media Gallery
                        </h4>
                      </div>
                      <span className="text-xs text-[#71717A]">At least 1 photo required; other 3 are optional</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* SLOT 1: Lifestyle Image */}
                      <SlotDropzone
                        slotNumber={1}
                        title="Lifestyle Context"
                        ratio="16:9 / 4:5"
                        description="Product placed in a living showroom set (Primary)"
                        currentUrl={variantImages?.lifestyle_image}
                        error={errors.variants?.[index]?.images?.lifestyle_image?.message}
                        presets={PRESET_IMAGES.lifestyle}
                        isOptional={false}
                        onSelectUrl={(url) =>
                          setValue(`variants.${index}.images.lifestyle_image`, url, {
                            shouldValidate: true,
                          })
                        }
                      />

                      {/* SLOT 2: Studio Front View */}
                      <SlotDropzone
                        slotNumber={2}
                        title="Studio Front View"
                        ratio="1:1"
                        description="Clean studio background facing front (Optional)"
                        currentUrl={variantImages?.studio_front_image}
                        error={errors.variants?.[index]?.images?.studio_front_image?.message}
                        presets={PRESET_IMAGES.studio}
                        isOptional={true}
                        onSelectUrl={(url) =>
                          setValue(`variants.${index}.images.studio_front_image`, url, {
                            shouldValidate: true,
                          })
                        }
                      />

                      {/* SLOT 3: Functional / Secondary View */}
                      <SlotDropzone
                        slotNumber={3}
                        title="Functional / Inside View"
                        ratio="1:1"
                        description="Open locker, inner drawer, or side profile (Optional)"
                        currentUrl={variantImages?.functional_view_image}
                        error={errors.variants?.[index]?.images?.functional_view_image?.message}
                        presets={PRESET_IMAGES.functional}
                        isOptional={true}
                        onSelectUrl={(url) =>
                          setValue(`variants.${index}.images.functional_view_image`, url, {
                            shouldValidate: true,
                          })
                        }
                      />

                      {/* SLOT 4: Macro Quality Detail */}
                      <SlotDropzone
                        slotNumber={4}
                        title="Macro Quality Detail"
                        ratio="1:1"
                        description="Close-up of powder coating texture, hinge, or weld (Optional)"
                        currentUrl={variantImages?.macro_detail_image}
                        error={errors.variants?.[index]?.images?.macro_detail_image?.message}
                        presets={PRESET_IMAGES.macro}
                        isOptional={true}
                        onSelectUrl={(url) =>
                          setValue(`variants.${index}.images.macro_detail_image`, url, {
                            shouldValidate: true,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Submission Bar */}
        <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-[#18181B] text-[#FAF8F5] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-[#9A3412]" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">
                Blueprint Ready for Deployment
              </p>
              <p className="text-xs text-[#FAF8F5]/60">
                {fields.length} Variant(s) configured • Schema validation enforced by Zod
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-medium uppercase tracking-wider text-[#FAF8F5] transition-colors cursor-pointer"
            >
              Reset Form
            </button>

            <button
              type="submit"
              id="btn-submit-blueprint"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#b03c15] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating & Publishing...</span>
                </>
              ) : (
                <>
                  <span>Publish Master Blueprint</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// -------------------------------------------------------------
// Dedicated 4-Slot Dropzone Component
// -------------------------------------------------------------
interface SlotDropzoneProps {
  slotNumber: number;
  title: string;
  ratio: string;
  description: string;
  currentUrl?: string;
  error?: string;
  presets: Array<{ label: string; url: string }>;
  isOptional?: boolean;
  onSelectUrl: (url: string) => void;
}

function SlotDropzone({
  slotNumber,
  title,
  ratio,
  description,
  currentUrl,
  error,
  presets,
  isOptional = false,
  onSelectUrl,
}: SlotDropzoneProps) {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const old = currentUrl;
    setIsUploading(true);
    try {
      const res = await StorageService.uploadStorefrontMedia(file, "product-blueprint");
      onSelectUrl(res.publicUrl);

      // Prune old image from storage if replaced
      if (old && old !== res.publicUrl) {
        await StorageService.deleteMediaByUrl(old);
      }
    } catch (err) {
      console.error("Storage upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleApplyCustom = () => {
    if (customInput.trim()) {
      onSelectUrl(customInput.trim());
      setIsCustomOpen(false);
      setCustomInput("");
    }
  };

  return (
    <div
      className={`relative rounded-xl border p-3 flex flex-col justify-between transition-all ${
        error
          ? "border-red-400 bg-red-50/40"
          : currentUrl
          ? "border-[#18181B]/15 bg-[#FAF8F5]"
          : "border-dashed border-[#18181B]/25 bg-[#FAF8F5]/40 hover:bg-[#FAF8F5]"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div>
        {/* Slot Header */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="text-[11px] font-bold text-[#18181B]">
            Slot {slotNumber}: {title}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#18181B]/5 text-[#71717A]">
            {ratio}
          </span>
        </div>
        <p className="text-[11px] text-[#71717A] leading-tight mb-2.5">{description}</p>

        {/* Thumbnail Preview Area */}
        <div
          onClick={() => {
            if (!currentUrl && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
          className="relative aspect-video sm:aspect-square w-full rounded-lg overflow-hidden bg-[#18181B]/5 border border-[#18181B]/10 flex items-center justify-center mb-2.5 group cursor-pointer"
        >
          {currentUrl ? (
            <>
              <Image
                src={currentUrl}
                alt={`Slot ${slotNumber} Preview`}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform group-hover:scale-105 duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="p-1.5 rounded-full bg-white text-[#18181B] hover:scale-110 transition-transform shadow-md cursor-pointer"
                  title="Replace image"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const old = currentUrl;
                    onSelectUrl("");
                    if (old) {
                      await StorageService.deleteMediaByUrl(old);
                    }
                  }}
                  className="p-1.5 rounded-full bg-white text-red-600 hover:scale-110 transition-transform shadow-md cursor-pointer"
                  title="Remove image and delete from storage"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-2 text-[#71717A]">
              {isUploading ? (
                <RefreshCw className="w-5 h-5 animate-spin text-[#9A3412]" />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-[#9A3412] mb-1 opacity-70 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    {isOptional ? "Optional Photo" : "Photo Required"}
                  </span>
                  <span className="text-[9px] text-[#71717A] mt-0.5">Click to upload</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Mock Preset Selectors & Custom Input */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase text-[#71717A]">
            Quick Presets
          </span>
          <button
            type="button"
            onClick={() => setIsCustomOpen(!isCustomOpen)}
            className="text-[10px] text-[#9A3412] underline hover:text-[#b03c15] cursor-pointer"
          >
            {isCustomOpen ? "Close" : "Custom URL"}
          </button>
        </div>

        {isCustomOpen && (
          <div className="flex gap-1 mb-1">
            <input
              type="text"
              placeholder="/custom-path.png"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="text-xs px-2 py-1 rounded border border-[#18181B]/20 bg-white flex-1 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleApplyCustom}
              className="px-2 py-1 bg-[#18181B] text-white rounded text-[11px] cursor-pointer"
            >
              Set
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {presets.map((preset) => {
            const isSelected = currentUrl === preset.url;
            return (
              <button
                key={preset.url}
                type="button"
                onClick={() => onSelectUrl(preset.url)}
                className={`text-[10px] px-2 py-1 rounded-md border transition-all truncate max-w-full cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? "bg-[#18181B] text-[#FAF8F5] border-[#18181B]"
                    : "bg-white hover:bg-[#FAF8F5] text-[#18181B] border-[#18181B]/15"
                }`}
                title={preset.url}
              >
                {isSelected && <Check className="w-2.5 h-2.5" />}
                <span className="truncate">{preset.label}</span>
              </button>
            );
          })}
        </div>

        {error && <p className="text-[11px] text-red-600 font-medium mt-1">{error}</p>}
      </div>
    </div>
  );
}
