"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Layers,
  Palette,
  Ruler,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  IndianRupee,
  Check,
  ChevronRight,
  ChevronLeft,
  Copy,
  FolderPlus,
  X,
  Link as LinkIcon,
  AlertTriangle,
} from "lucide-react";
import {
  type BlueprintType,
  type ProductWizardFormData,
  type ProductFinish,
  type ProductSize,
  type Category,
} from "@/types/database";
import { type ProductCatalogItem } from "@/services/ProductService";
import { saveProductWizardAction } from "@/actions/adminActions";
import { StorageService } from "@/services/StorageService";

// Standard curated durable furniture finish swatches for convenience
const COLOR_PRESETS = [
  { name: "Matte Charcoal", hex: "#36454F" },
  { name: "Matte Navy", hex: "#1E3A5F" },
  { name: "Soft Ivory", hex: "#FDFBF7" },
  { name: "Warm Terracotta", hex: "#C25946" },
  { name: "Sage Green", hex: "#A8B5A1" },
  { name: "Deep Emerald", hex: "#1B4D3E" },
];

interface ProductWizardProps {
  categories: Category[];
  initialData?: ProductCatalogItem | null;
}

export function ProductWizard({ categories, initialData }: ProductWizardProps) {
  const safeCategories = categories || [];
  // Derive real parent departments (parent_id is null/empty)
  const parentCategories = safeCategories.filter((c) => !c.parent_id);
  const effectiveParents = parentCategories.length > 0 ? parentCategories : safeCategories;
  const initialParent = effectiveParents[0];
  const initialSubs = initialParent?.id
    ? safeCategories.filter((c) => c.parent_id === initialParent.id)
    : [];
  const initialSub = initialSubs[0] || null;
  const initialBlueprint: BlueprintType =
    initialSub?.blueprint_type || initialParent?.blueprint_type || "wardrobe";

  // Check if any subcategories exist across the entire catalog
  const totalSubCategoriesCount = safeCategories.filter((c) => Boolean(c.parent_id)).length;

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedFinishIndex, setSelectedFinishIndex] = useState(0);
  const [highlightInput, setHighlightInput] = useState("");

  const isEditing = Boolean(initialData?.id);

  // Initial Form State — Prefill with initialData when editing
  const [formData, setFormData] = useState<ProductWizardFormData>(() => {
    if (initialData) {
      const matchedCategory = safeCategories.find((c) => c.id === initialData.category_id);
      const matchedSub = initialData.sub_category_id
        ? safeCategories.find((c) => c.id === initialData.sub_category_id)
        : null;
      const detectedBlueprint: BlueprintType =
        matchedSub?.blueprint_type ||
        matchedCategory?.blueprint_type ||
        (initialData.category?.blueprint_type as BlueprintType) ||
        "wardrobe";

      const mappedFinishes: ProductFinish[] =
        initialData.finishes && initialData.finishes.length > 0
          ? initialData.finishes.map((f, i) => ({
              id: f.id,
              finish_name: f.finish_name,
              hex_code: f.hex_code,
              is_default: f.is_default !== undefined ? f.is_default : i === 0,
              media: {
                lifestyle: f.media?.lifestyle || "",
                front: f.media?.front || "",
                functional: f.media?.functional || "",
                macro: f.media?.macro || "",
              },
            }))
          : [
              {
                finish_name: "Matte Charcoal",
                hex_code: "#36454F",
                is_default: true,
                media: { lifestyle: "", front: "", functional: "", macro: "" },
              },
            ];

      const mappedSizes: ProductSize[] =
        initialData.sizes && initialData.sizes.length > 0
          ? initialData.sizes.map((s, i) => ({
              id: s.id,
              size_label: s.size_label,
              price: Number(s.price),
              token_amount: s.token_amount || 999,
              delivery_days: s.delivery_days || 7,
              stock_status: (s.stock_status as "in_stock" | "made_to_order") || "in_stock",
              is_default: s.is_default !== undefined ? s.is_default : i === 0,
              dimensions: {
                height: s.dimensions?.height || 0,
                width: s.dimensions?.width || 0,
                depth: s.dimensions?.depth || 0,
                length: s.dimensions?.length,
                headboard_height: s.dimensions?.headboard_height,
                total_height: s.dimensions?.total_height,
                seat_height: s.dimensions?.seat_height,
                unit: "inches" as const,
              },
            }))
          : [
              {
                size_label: "Standard Size",
                price: Number(initialData.base_price) || 0,
                token_amount: 999,
                delivery_days: 7,
                stock_status: "in_stock" as const,
                is_default: true,
                dimensions: { height: 0, width: 0, depth: 0, unit: "inches" as const },
              },
            ];

      return {
        id: initialData.id,
        category_id: initialData.category_id,
        sub_category_id: initialData.sub_category_id || null,
        blueprint_type: detectedBlueprint,
        title_en: initialData.title_en,
        title_hi: initialData.title_hi,
        slug: initialData.slug,
        tagline: initialData.tagline,
        base_price: Number(initialData.base_price),
        highlights: initialData.highlights || [],
        is_featured: initialData.is_featured || false,
        finishes: mappedFinishes,
        sizes: mappedSizes,
      };
    }

    return {
      category_id: initialParent?.id || "",
      sub_category_id: initialSub?.id || null,
      blueprint_type: initialBlueprint,
      title_en: "",
      title_hi: "",
      slug: "",
      tagline: "",
      base_price: 0,
      highlights: [],
      is_featured: false,
      finishes: [
        {
          finish_name: "Matte Charcoal",
          hex_code: "#36454F",
          is_default: true,
          media: {
            lifestyle: "",
            front: "",
            functional: "",
            macro: "",
          },
        },
      ],
      sizes: [
        {
          size_label: "Standard Size",
          price: 0,
          token_amount: 999,
          delivery_days: 7,
          stock_status: "in_stock",
          is_default: true,
          dimensions: {
            height: 0,
            width: 0,
            depth: 0,
            unit: "inches",
          },
        },
      ],
    };
  });

  // Clear specific field error helper
  const clearFieldError = (...keys: string[]) => {
    setFieldErrors((prev) => {
      const copy = { ...prev };
      let changed = false;
      for (const k of keys) {
        if (copy[k]) {
          delete copy[k];
          changed = true;
        }
      }
      return changed ? copy : prev;
    });
  };

  // Auto-generate slug when title changes (only auto-sync if not editing existing slug)
  const handleTitleChange = (val: string) => {
    if (isEditing) {
      setFormData((prev) => ({ ...prev, title_en: val }));
      clearFieldError("title_en");
    } else {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormData((prev) => ({ ...prev, title_en: val, slug }));
      clearFieldError("title_en", "slug");
    }
  };

  // Switch parent category
  const handleParentSelect = (parentId: string) => {
    const parentCat = categories.find((c) => c.id === parentId);
    if (!parentCat) return;

    // Find real subcategories belonging to this parent
    const subs = categories.filter((c) => c.parent_id === parentId);
    const firstSub = subs[0] || null;
    const detectedBlueprint = firstSub?.blueprint_type || parentCat.blueprint_type || "wardrobe";

    setFormData((prev) => ({
      ...prev,
      category_id: parentId,
      sub_category_id: firstSub?.id || null,
      blueprint_type: detectedBlueprint,
    }));
    clearFieldError("category_id", "sub_category_id");
  };

  // Switch sub-category
  const handleSubCategorySelect = (subId: string) => {
    const sub = categories.find((c) => c.id === subId);
    if (!sub) return;

    setFormData((prev) => ({
      ...prev,
      sub_category_id: subId,
      blueprint_type: sub.blueprint_type,
    }));
    clearFieldError("sub_category_id");
  };

  // Add Product Highlight
  const handleAddHighlight = () => {
    const trimmed = highlightInput.trim();
    if (!trimmed) return;
    if (formData.highlights.includes(trimmed)) {
      setHighlightInput("");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, trimmed],
    }));
    setHighlightInput("");
  };

  // Remove Product Highlight
  const handleRemoveHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  // Add Finish (Clean, empty media)
  const handleAddFinish = () => {
    const newFinish: ProductFinish = {
      finish_name: `Finish ${formData.finishes.length + 1}`,
      hex_code: "#1E3A5F",
      is_default: false,
      media: {
        lifestyle: "",
        front: "",
        functional: "",
        macro: "",
      },
    };
    setFormData((prev) => ({
      ...prev,
      finishes: [...prev.finishes, newFinish],
    }));
    setSelectedFinishIndex(formData.finishes.length);
  };

  // Duplicate Finish
  const handleDuplicateFinish = (idx: number) => {
    const source = formData.finishes[idx];
    if (!source) return;

    const copy: ProductFinish = {
      ...source,
      finish_name: `${source.finish_name} (Copy)`,
      is_default: false,
      media: { ...source.media },
    };

    setFormData((prev) => ({
      ...prev,
      finishes: [...prev.finishes, copy],
    }));
    setSelectedFinishIndex(formData.finishes.length);
  };

  // Add Size Variant (Clean 0 dimensions)
  const handleAddSize = () => {
    const baseDimensions = formData.sizes[0]?.dimensions || {
      height: 0,
      width: 0,
      depth: 0,
      unit: "inches" as const,
    };

    const newSize: ProductSize = {
      size_label: `Variant ${formData.sizes.length + 1}`,
      price: formData.base_price > 0 ? formData.base_price : 0,
      token_amount: 999,
      delivery_days: 7,
      stock_status: "in_stock",
      is_default: false,
      dimensions: {
        ...baseDimensions,
      },
    };
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, newSize],
    }));
  };

  // Dynamic slot 3 label based on blueprint_type
  const getSlot3Label = (blueprint: BlueprintType) => {
    switch (blueprint) {
      case "wardrobe":
        return "Inside Locker View";
      case "bed":
        return "Storage / Under-Bed View";
      case "seating":
        return "Side Profile View";
      case "table":
        return "Under-Frame / Joinery View";
      case "storage":
        return "Open Shelving / Drawer View";
      default:
        return "Functional View";
    }
  };

  // Helper to determine if a step has active field errors
  const stepHasErrors = (step: 1 | 2 | 3): boolean => {
    const errorKeys = Object.keys(fieldErrors);
    if (step === 1) {
      return errorKeys.some((k) =>
        ["category_id", "sub_category_id", "title_en", "title_hi", "slug", "tagline", "base_price"].includes(k)
      );
    }
    if (step === 2) {
      return errorKeys.some((k) => k.startsWith("finishes"));
    }
    if (step === 3) {
      return errorKeys.some((k) => k.startsWith("sizes"));
    }
    return false;
  };

  // Comprehensive Client-Side Validator
  const validateForm = (): {
    isValid: boolean;
    errors: Record<string, string>;
    firstStep: 1 | 2 | 3;
    firstFinishIndex?: number;
  } => {
    const errors: Record<string, string> = {};
    let firstStep: 1 | 2 | 3 = 1;
    let firstFinishIndex: number | undefined = undefined;

    // STEP 1 VALIDATIONS
    if (!formData.category_id || formData.category_id.trim() === "") {
      errors["category_id"] = "Please select a Room Department.";
    }

    if (!formData.title_en || formData.title_en.trim().length < 3) {
      errors["title_en"] = "Showroom Title (EN) must be at least 3 characters.";
    }

    if (!formData.title_hi || formData.title_hi.trim().length < 3) {
      errors["title_hi"] = "Hindi / Hinglish Title must be at least 3 characters.";
    }

    if (!formData.slug || formData.slug.trim().length < 2) {
      errors["slug"] = "URL Slug must be at least 2 characters.";
    }

    if (!formData.tagline || formData.tagline.trim().length < 4) {
      errors["tagline"] = "Editorial Tagline must be at least 4 characters.";
    }

    if (!formData.base_price || formData.base_price <= 0 || isNaN(formData.base_price)) {
      errors["base_price"] = "Base catalog price must be greater than ₹0.";
    }

    // STEP 2 VALIDATIONS (Finishes & 4 Photos)
    formData.finishes.forEach((f, idx) => {
      const finishPrefix = `finishes.${idx}`;
      if (!f.finish_name || f.finish_name.trim().length === 0) {
        errors[`${finishPrefix}.finish_name`] = `Finish #${idx + 1} name is required.`;
      }

      if (!f.hex_code || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(f.hex_code)) {
        errors[`${finishPrefix}.hex_code`] = `Finish #${idx + 1} hex color is invalid (e.g. #36454F).`;
      }

      // Only 1 image is mandatory; the other three are optional
      const hasAnyPhoto = Boolean(
        f.media.lifestyle?.trim() ||
        f.media.front?.trim() ||
        f.media.functional?.trim() ||
        f.media.macro?.trim()
      );

      if (!hasAnyPhoto) {
        errors[`${finishPrefix}.media.lifestyle`] = `At least one photo (Primary Lifestyle Shot) is required for finish "${f.finish_name}".`;
        if (firstFinishIndex === undefined) {
          firstFinishIndex = idx;
        }
      }
    });

    // STEP 3 VALIDATIONS (Sizes & Pricing)
    formData.sizes.forEach((s, idx) => {
      const sizePrefix = `sizes.${idx}`;
      if (!s.size_label || s.size_label.trim().length === 0) {
        errors[`${sizePrefix}.size_label`] = `Size variant #${idx + 1} must have a label (e.g. Standard 3-Door).`;
      }
      if (!s.price || s.price <= 0 || isNaN(s.price)) {
        errors[`${sizePrefix}.price`] = `Size "${s.size_label || `#${idx + 1}`}" price must be greater than ₹0.`;
      }
      if (!s.token_amount || s.token_amount <= 0 || isNaN(s.token_amount)) {
        errors[`${sizePrefix}.token_amount`] = `Token advance must be greater than ₹0.`;
      }
    });

    // Determine earliest failing step
    const keys = Object.keys(errors);
    if (keys.some((k) => ["category_id", "title_en", "title_hi", "slug", "tagline", "base_price"].includes(k))) {
      firstStep = 1;
    } else if (keys.some((k) => k.startsWith("finishes"))) {
      firstStep = 2;
    } else if (keys.some((k) => k.startsWith("sizes"))) {
      firstStep = 3;
    }

    return {
      isValid: keys.length === 0,
      errors,
      firstStep,
      firstFinishIndex,
    };
  };

  // Submit Handler
  const handleSubmit = async () => {
    setFeedback(null);

    // Run client-side preflight check
    const validation = validateForm();
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFeedback({
        success: false,
        message: "Please correct the specific highlighted errors below before publishing.",
      });
      setActiveStep(validation.firstStep);
      if (validation.firstStep === 2 && validation.firstFinishIndex !== undefined) {
        setSelectedFinishIndex(validation.firstFinishIndex);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveProductWizardAction(formData);
      setFeedback(res);

      if (!res.success) {
        if (res.errors) {
          // If server returned structured field errors
          const stringErrors: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.errors)) {
            if (typeof v === "string") stringErrors[k] = v;
            else if (Array.isArray(v) && v.length > 0) stringErrors[k] = v[0];
          }
          setFieldErrors(stringErrors);

          // Auto-navigate to step with error
          const keys = Object.keys(stringErrors);
          if (keys.some((k) => ["category_id", "title_en", "title_hi", "slug", "tagline", "base_price"].includes(k))) {
            setActiveStep(1);
          } else if (keys.some((k) => k.startsWith("finishes"))) {
            setActiveStep(2);
          } else if (keys.some((k) => k.startsWith("sizes"))) {
            setActiveStep(3);
          }
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setFieldErrors({});
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setFeedback({
        success: false,
        message: err instanceof Error ? `Server Error: ${err.message}` : "Failed to publish product to Supabase.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Jump to specific error field from error summary list
  const jumpToErrorField = (errorKey: string) => {
    if (errorKey.startsWith("finishes.")) {
      const parts = errorKey.split(".");
      const finishIdx = parseInt(parts[1], 10);
      if (!isNaN(finishIdx)) {
        setSelectedFinishIndex(finishIdx);
      }
      setActiveStep(2);
    } else if (errorKey.startsWith("sizes.")) {
      setActiveStep(3);
    } else {
      setActiveStep(1);
    }
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  // Current active finish for slot photo editing
  const currentFinish = formData.finishes[selectedFinishIndex] || formData.finishes[0];
  const primarySize = formData.sizes[0];

  // Lookups for real category names
  const activeParentCat = categories.find((c) => c.id === formData.category_id);
  const activeSubCat = formData.sub_category_id
    ? categories.find((c) => c.id === formData.sub_category_id)
    : null;

  // Real subcategories for currently selected parent
  const currentSubCategories = formData.category_id
    ? categories.filter((c) => c.parent_id === formData.category_id)
    : [];

  // If no categories exist in the database, instruct admin to create them first
  if (!categories || categories.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto py-8">
        <div className="bg-white rounded-3xl border border-[#18181B]/10 p-8 md:p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#9A3412]/10 text-[#9A3412] flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold text-[#9A3412] uppercase tracking-wider">
              Setup Required Before Creating Furniture
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#18181B]">
              No Room Categories Found in Database
            </h2>
            <p className="text-sm text-[#71717A] max-w-lg mx-auto">
              Every steel furniture model must belong to a verified Room Category (e.g., Bedroom, Living Room)
              and Subcategory (e.g., Wardrobes, Beds, Desks) to configure its dimensional blueprint engine and customer showroom navigation.
            </p>
          </div>

          {/* Step-by-Step Guidance */}
          <div className="bg-[#FAF8F5] rounded-2xl p-6 text-left border border-[#18181B]/10 space-y-4 max-w-xl mx-auto">
            <div className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-full bg-[#18181B] text-[#FAF8F5] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div>
                <p className="text-xs font-bold text-[#18181B]">Create Room Departments</p>
                <p className="text-xs text-[#71717A]">
                  Go to <strong className="text-[#18181B]">Categories & Rooms</strong> and add your major departments (e.g. &quot;Bedroom&quot;, &quot;Living Room&quot;, &quot;Workspace&quot;).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-full bg-[#18181B] text-[#FAF8F5] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div>
                <p className="text-xs font-bold text-[#18181B]">Add Subcategories & Select Blueprint Engines</p>
                <p className="text-xs text-[#71717A]">
                  Add subcategories under each room (e.g. &quot;Wardrobes & Vaults&quot; with &apos;wardrobe&apos; blueprint, &quot;Steel Beds&quot; with &apos;bed&apos; blueprint).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-full bg-[#9A3412] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <div>
                <p className="text-xs font-bold text-[#18181B]">Return Here to Publish Real Furniture</p>
                <p className="text-xs text-[#71717A]">
                  Once created, return to this wizard to upload your 4-photo studio blueprints, color swatches, and steel gauge specs.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/admin/categories"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#9A3412] hover:bg-[#b03c15] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Categories & Rooms</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admin/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-[#18181B]/15 hover:bg-[#FAF8F5] text-[#18181B] text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Back to Product Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Toast Feedback / Detailed Error Alert */}
      {feedback && (
        <div
          role="alert"
          className={`mb-6 p-5 rounded-2xl border shadow-md transition-all ${
            feedback.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : "bg-red-50 border-red-200 text-red-950"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {feedback.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-sm font-bold">
                  {feedback.success ? "Success" : "Cannot Publish Product — Please Fix the Issues Below"}
                </h4>
                <p className="text-xs mt-0.5 opacity-90">{feedback.message}</p>
              </div>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs uppercase font-semibold text-[#71717A] hover:text-[#18181B] cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          {/* Interactive list of specific field errors */}
          {!feedback.success && Object.keys(fieldErrors).length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-red-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-900 block mb-1.5">
                Exact Field Errors ({Object.keys(fieldErrors).length}):
              </span>
              <ul className="space-y-1.5">
                {Object.entries(fieldErrors).map(([key, msg]) => (
                  <li
                    key={key}
                    onClick={() => jumpToErrorField(key)}
                    className="text-xs text-red-800 flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-red-100/70 transition-colors cursor-pointer group"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                      <span>{msg}</span>
                    </span>
                    <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider group-hover:underline flex items-center gap-0.5 shrink-0">
                      <span>Jump to field</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Top Header & Stepper */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#18181B]/10">
        <div>
          {isEditing && (
            <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#FAF8F5] border border-[#18181B]/15 text-xs text-[#18181B]">
              <span className="w-2 h-2 rounded-full bg-[#9A3412]" />
              <span>Editing: <strong>{formData.title_en || initialData?.title_en}</strong></span>
              <span className="font-mono text-[10px] text-[#71717A]">({formData.slug})</span>
            </div>
          )}
          <div>
            <span className="text-xs font-mono font-semibold text-[#9A3412] uppercase tracking-wider">
              Step {activeStep} of 3
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#18181B]">
            {activeStep === 1 && "1. Basics & Real Room Placement"}
            {activeStep === 2 && "2. Color Finishes & Product Photos"}
            {activeStep === 3 && "3. Sizes & Smart Dimensions"}
          </h1>
          <p className="text-xs md:text-sm text-[#71717A] mt-1">
            {activeStep === 1 && "Select verified room departments, subcategories, titles, and base price."}
            {activeStep === 2 && "Configure color swatches and upload product photos (1 mandatory Lifestyle Shot, 3 optional)."}
            {activeStep === 3 && "Specify modular size labels and live spatial dimensions."}
          </p>
        </div>

        {/* Wizard Step Selector Pills with Error Badges */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#18181B]/10 shadow-xs self-start md:self-auto">
          {[
            { step: 1, label: "Basics", icon: Layers },
            { step: 2, label: "Finishes & Photos", icon: Palette },
            { step: 3, label: "Sizes & Dimensions", icon: Ruler },
          ].map((s) => {
            const Icon = s.icon;
            const active = activeStep === s.step;
            const hasError = stepHasErrors(s.step as 1 | 2 | 3);

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(s.step as 1 | 2 | 3)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                  active
                    ? "bg-[#18181B] text-[#FAF8F5] shadow-xs"
                    : hasError
                    ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                    : "text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF8F5]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.step}</span>
                {hasError && (
                  <span
                    title="This step contains required fields with errors"
                    className="w-2 h-2 rounded-full bg-red-500 shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ============================================================ */}
        {/* WIZARD FORM COLUMN (7 cols on Desktop)                      */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: BASICS & ROOM PLACEMENT */}
          {activeStep === 1 && (
            <div className="bg-white rounded-3xl border border-[#18181B]/10 p-6 md:p-8 shadow-xs space-y-6">
              {/* Recommendation Banner if entire catalog has 0 subcategories */}
              {totalSubCategoriesCount === 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">No Subcategories Created Yet</p>
                      <p className="text-amber-800 text-[11px] mt-0.5">
                        We recommend adding subcategories under your rooms (e.g. Wardrobes, Beds, Dining Tables) to configure specific blueprint clearance dimensions.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/admin/categories"
                    className="inline-flex items-center gap-1 font-bold text-amber-900 underline hover:text-[#9A3412] shrink-0"
                  >
                    <span>Create Subcategories</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Room Category Visual Pill Selector (Real Categories from DB) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A]">
                    Room Department <span className="text-red-500">*</span>
                  </label>
                  <Link
                    href="/admin/categories"
                    className="text-[11px] font-semibold text-[#9A3412] hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Manage Categories</span>
                  </Link>
                </div>

                <div
                  className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 p-1 rounded-2xl ${
                    fieldErrors["category_id"] ? "ring-2 ring-red-500/30 bg-red-50/20" : ""
                  }`}
                >
                  {effectiveParents.map((room) => {
                    const isSelected = formData.category_id === room.id;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => handleParentSelect(room.id || "")}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#18181B] text-white border-[#18181B] shadow-xs"
                            : "bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] border-[#18181B]/10 text-[#18181B]"
                        }`}
                      >
                        <span className="block text-xs font-bold truncate">{room.name_en}</span>
                        <span
                          className={`block text-[10px] mt-0.5 truncate ${
                            isSelected ? "text-white/70" : "text-[#71717A]"
                          }`}
                        >
                          {room.blueprint_type ? `Spec: ${room.blueprint_type}` : "Standard"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {fieldErrors["category_id"] && (
                  <p className="text-xs font-semibold text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors["category_id"]}</span>
                  </p>
                )}
              </div>

              {/* Real Subcategories under Selected Room */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A]">
                    Sub-Category (Sets Dynamic Blueprint Engine)
                  </label>
                  <Link
                    href="/admin/categories"
                    className="text-[11px] font-semibold text-[#9A3412] hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Subcategory</span>
                  </Link>
                </div>

                {currentSubCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentSubCategories.map((sub) => {
                      const isSelected = formData.sub_category_id === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSubCategorySelect(sub.id || "")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-[#9A3412] text-white border-[#9A3412] shadow-xs"
                              : "bg-white hover:bg-[#FAF8F5] border-[#18181B]/15 text-[#18181B]"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{sub.name_en}</span>
                          <span className="text-[10px] opacity-75">({sub.blueprint_type})</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#18181B]/15 flex items-center justify-between gap-3 text-xs text-[#71717A]">
                    <span>
                      No subcategories created under <strong>{activeParentCat?.name_en || "this department"}</strong>.
                    </span>
                    <Link
                      href="/admin/categories"
                      className="text-xs font-bold text-[#9A3412] hover:underline shrink-0"
                    >
                      + Create in Categories & Rooms &rarr;
                    </Link>
                  </div>
                )}
              </div>

              {/* Title & Hinglish Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                    Showroom Title (EN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Modern Steel Almirah"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      fieldErrors["title_en"]
                        ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20 text-red-950 focus:outline-none"
                        : "border-[#18181B]/15 bg-[#FAF8F5]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-[#18181B]"
                    }`}
                  />
                  {fieldErrors["title_en"] && (
                    <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors["title_en"]}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                    Hinglish / Hindi Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title_hi}
                    onChange={(e) => {
                      setFormData({ ...formData, title_hi: e.target.value });
                      clearFieldError("title_hi");
                    }}
                    placeholder="e.g. मॉडर्न स्टील अलमारी"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      fieldErrors["title_hi"]
                        ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20 text-red-950 focus:outline-none"
                        : "border-[#18181B]/15 bg-[#FAF8F5]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-[#18181B]"
                    }`}
                  />
                  {fieldErrors["title_hi"] && (
                    <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors["title_hi"]}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Editorial Tagline */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                  Editorial Tagline (5-7 Words) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => {
                    setFormData({ ...formData, tagline: e.target.value });
                    clearFieldError("tagline");
                  }}
                  placeholder="e.g. Tata 20-Gauge cold-rolled steel with electrostatic matte finish"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    fieldErrors["tagline"]
                      ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20 text-red-950 focus:outline-none"
                      : "border-[#18181B]/15 bg-[#FAF8F5]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-[#18181B]"
                  }`}
                />
                {fieldErrors["tagline"] && (
                  <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors["tagline"]}</span>
                  </p>
                )}
              </div>

              {/* Price & Auto-generated Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                    Base Catalog Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                    <input
                      type="number"
                      min={0}
                      value={formData.base_price > 0 ? formData.base_price : ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const val = raw === "" ? 0 : Number(raw);
                        setFormData((prev) => ({
                          ...prev,
                          base_price: isNaN(val) ? 0 : val,
                          sizes: prev.sizes.map((s, idx) =>
                            idx === 0 && (s.price === 0 || s.price === prev.base_price || prev.sizes.length === 1)
                              ? { ...s, price: isNaN(val) ? 0 : val }
                              : s
                          ),
                        }));
                        clearFieldError("base_price");
                      }}
                      placeholder="0"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        fieldErrors["base_price"]
                          ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20 text-red-950 focus:outline-none"
                          : "border-[#18181B]/15 bg-[#FAF8F5]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-[#18181B]"
                      }`}
                    />
                  </div>
                  {fieldErrors["base_price"] && (
                    <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors["base_price"]}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                    URL Slug (Auto Generated)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => {
                      setFormData({ ...formData, slug: e.target.value });
                      clearFieldError("slug");
                    }}
                    placeholder="e.g. modern-steel-almirah"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all ${
                      fieldErrors["slug"]
                        ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20 text-red-950 focus:outline-none"
                        : "border-[#18181B]/15 bg-[#FAF8F5]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-[#71717A]"
                    }`}
                  />
                  {fieldErrors["slug"] && (
                    <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors["slug"]}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Product Key Highlights (Interactive Tag Manager) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                  Product Key Highlights (Tags)
                </label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={highlightInput}
                    onChange={(e) => setHighlightInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    placeholder="e.g. 20-Gauge CRCA Steel, Concealed Safe Locker, 10-Yr Warranty"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A3412] text-xs font-medium text-[#18181B]"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-4 py-2 rounded-xl bg-[#18181B] text-white hover:bg-[#9A3412] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {formData.highlights.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#18181B]/15 text-xs text-[#18181B]"
                      >
                        <span>{h}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(i)}
                          className="hover:text-red-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#71717A]">
                    No highlights added. Type a feature above and press &apos;Add&apos; or hit Enter.
                  </p>
                )}
              </div>

              {/* Featured in Storefront Flag */}
              <div className="pt-2 border-t border-[#18181B]/10 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-[#18181B]">
                    Feature on Storefront Homepage
                  </span>
                  <span className="block text-[11px] text-[#71717A]">
                    Displays this model in hero carousels and top recommendations.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 accent-[#9A3412] cursor-pointer"
                />
              </div>

              {/* Next Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#18181B] hover:bg-[#9A3412] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <span>Continue to 4-Photo Blueprint</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FINISHES & 4-PHOTO BLUEPRINT */}
          {activeStep === 2 && (
            <div className="bg-white rounded-3xl border border-[#18181B]/10 p-6 md:p-8 shadow-xs space-y-6">
              {/* Finish Selector Pills + Add Button */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A]">
                    Product Color Finishes ({formData.finishes.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFinish}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181B] text-[#FAF8F5] text-xs font-semibold hover:bg-[#9A3412] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Color</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.finishes.map((f, idx) => {
                    const isSelected = selectedFinishIndex === idx;
                    const finishHasErrors = Object.keys(fieldErrors).some((k) =>
                      k.startsWith(`finishes.${idx}`)
                    );

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedFinishIndex(idx)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition-all cursor-pointer relative ${
                          isSelected
                            ? "bg-[#18181B] text-white border-[#18181B] shadow-xs"
                            : finishHasErrors
                            ? "bg-red-50 text-red-900 border-red-300 hover:bg-red-100"
                            : "bg-[#FAF8F5] text-[#18181B] border-[#18181B]/15 hover:border-[#18181B]"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: f.hex_code }}
                        />
                        <span>{f.finish_name}</span>
                        {finishHasErrors && (
                          <span
                            title="This finish has missing photos or errors"
                            className="w-2 h-2 rounded-full bg-red-500 shrink-0"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Finish Configuration Card */}
              {currentFinish && (
                <div className="p-5 rounded-2xl bg-[#FAF8F5]/60 border border-[#18181B]/10 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#18181B]/10">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={currentFinish.hex_code}
                        onChange={(e) => {
                          const updated = [...formData.finishes];
                          updated[selectedFinishIndex].hex_code = e.target.value;
                          setFormData({ ...formData, finishes: updated });
                          clearFieldError(`finishes.${selectedFinishIndex}.hex_code`);
                        }}
                        className="w-9 h-9 rounded-xl border border-[#18181B]/20 cursor-pointer bg-white p-0.5"
                      />
                      <input
                        type="text"
                        value={currentFinish.finish_name}
                        onChange={(e) => {
                          const updated = [...formData.finishes];
                          updated[selectedFinishIndex].finish_name = e.target.value;
                          setFormData({ ...formData, finishes: updated });
                          clearFieldError(`finishes.${selectedFinishIndex}.finish_name`);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all ${
                          fieldErrors[`finishes.${selectedFinishIndex}.finish_name`]
                            ? "border-red-500 bg-red-50/30 text-red-950 focus:outline-none"
                            : "border-[#18181B]/15 bg-white text-[#18181B] focus:outline-none"
                        }`}
                        placeholder="Finish Name"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDuplicateFinish(selectedFinishIndex)}
                        className="p-2 rounded-xl bg-white border border-[#18181B]/15 hover:border-[#9A3412] text-xs font-medium text-[#18181B] flex items-center gap-1.5 cursor-pointer"
                        title="Duplicate this finish"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Duplicate</span>
                      </button>

                      {formData.finishes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.finishes.filter(
                              (_, i) => i !== selectedFinishIndex
                            );
                            setFormData({ ...formData, finishes: updated });
                            setSelectedFinishIndex(0);
                          }}
                          className="p-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Swatch Quick Color Helpers */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase text-[#71717A]">
                      Color Presets:
                    </span>
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => {
                          const updated = [...formData.finishes];
                          updated[selectedFinishIndex].finish_name = color.name;
                          updated[selectedFinishIndex].hex_code = color.hex;
                          setFormData({ ...formData, finishes: updated });
                          clearFieldError(`finishes.${selectedFinishIndex}.hex_code`);
                        }}
                        className="px-2.5 py-1 rounded-full border border-black/10 bg-white text-xs flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* 2X2 VISUAL PHOTO GRID (1 Mandatory, 3 Optional) */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                          Photo Studio Blueprint <span className="text-red-500">*</span>
                        </h4>
                        <p className="text-[11px] text-[#71717A]">
                          1 image is mandatory (Slot 1); additional 3 angles are optional.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#18181B]/5 text-[#71717A]">
                        1 Required • 3 Optional
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Slot 1: Room Lifestyle Shot (Mandatory) */}
                      <PhotoSlotBox
                        slotIndex={1}
                        title="Room Lifestyle Shot"
                        badge="Mandatory"
                        aspectRatio="16:9 / 4:5"
                        currentUrl={currentFinish.media.lifestyle}
                        errorMessage={fieldErrors[`finishes.${selectedFinishIndex}.media.lifestyle`]}
                        onImageSelected={(url) => {
                          const updated = [...formData.finishes];
                          updated[selectedFinishIndex].media.lifestyle = url;
                          setFormData({ ...formData, finishes: updated });
                          clearFieldError(
                            `finishes.${selectedFinishIndex}.media.lifestyle`,
                            `finishes.${selectedFinishIndex}.media.front`,
                            `finishes.${selectedFinishIndex}.media.functional`,
                            `finishes.${selectedFinishIndex}.media.macro`
                          );
                        }}
                        productSlug={formData.slug || "new-product"}
                        finishName={currentFinish.finish_name}
                        slotName="lifestyle"
                      />

                      {/* Slot 2: Studio Front View (Optional) */}
                      <PhotoSlotBox
                        slotIndex={2}
                        title="Studio Front View"
                        badge="Optional"
                        aspectRatio="1:1"
                        currentUrl={currentFinish.media.front}
                        onImageSelected={(url) => {
                          const updated = [...formData.finishes];
                          updated[selectedFinishIndex].media.front = url;
                          setFormData({ ...formData, finishes: updated });
                          clearFieldError(
                            `finishes.${selectedFinishIndex}.media.lifestyle`,
                            `finishes.${selectedFinishIndex}.media.front`,
                            `finishes.${selectedFinishIndex}.media.functional`,
                            `finishes.${selectedFinishIndex}.media.macro`
                          );
                        }}
                        productSlug={formData.slug || "new-product"}
                        finishName={currentFinish.finish_name}
                        slotName="front"
                      />

                      {/* Slot 3: Dynamic Functional View (Optional) */}
                      <PhotoSlotBox
                        slotIndex={3}
                        title={getSlot3Label(formData.blueprint_type)}
                        badge="Optional"
                        aspectRatio="1:1"
                        currentUrl={currentFinish.media.functional}
                        onImageSelected={(url) => {
                          const updated = [...formData.finishes];
                          updated[selectedFinishIndex].media.functional = url;
                          setFormData({ ...formData, finishes: updated });
                          clearFieldError(
                            `finishes.${selectedFinishIndex}.media.lifestyle`,
                            `finishes.${selectedFinishIndex}.media.front`,
                            `finishes.${selectedFinishIndex}.media.functional`,
                            `finishes.${selectedFinishIndex}.media.macro`
                          );
                        }}
                        productSlug={formData.slug || "new-product"}
                        finishName={currentFinish.finish_name}
                        slotName="functional"
                      />

                      {/* Slot 4: Macro Steel & Hinge Detail (Optional) */}
                      <PhotoSlotBox
                        slotIndex={4}
                        title="Close-up Steel & Hinge Detail"
                        badge="Optional"
                        aspectRatio="1:1"
                        currentUrl={currentFinish.media.macro}
                        onImageSelected={(url) => {
                          const updated = [...formData.finishes];
                          updated[selectedFinishIndex].media.macro = url;
                          setFormData({ ...formData, finishes: updated });
                          clearFieldError(
                            `finishes.${selectedFinishIndex}.media.lifestyle`,
                            `finishes.${selectedFinishIndex}.media.front`,
                            `finishes.${selectedFinishIndex}.media.functional`,
                            `finishes.${selectedFinishIndex}.media.macro`
                          );
                        }}
                        productSlug={formData.slug || "new-product"}
                        finishName={currentFinish.finish_name}
                        slotName="macro"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl border border-[#18181B]/15 hover:bg-[#FAF8F5] text-xs font-semibold text-[#18181B] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Basics</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#18181B] hover:bg-[#9A3412] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <span>Continue to Sizes & Dimensions</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SIZES & SMART DIMENSIONS */}
          {activeStep === 3 && (
            <div className="bg-white rounded-3xl border border-[#18181B]/10 p-6 md:p-8 shadow-xs space-y-6">
              {/* Size Configuration List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#71717A]">
                    Available Sizes & Pricing ({formData.sizes.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181B] text-[#FAF8F5] text-xs font-semibold hover:bg-[#9A3412] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Size Variant</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.sizes.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#FAF8F5]/60 border border-[#18181B]/10 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex-1 max-w-sm">
                          <input
                            type="text"
                            value={s.size_label}
                            onChange={(e) => {
                              const updated = [...formData.sizes];
                              updated[idx].size_label = e.target.value;
                              setFormData({ ...formData, sizes: updated });
                              clearFieldError(`sizes.${idx}.size_label`);
                            }}
                            className={`w-full px-3 py-1.5 rounded-xl border text-sm font-bold transition-all ${
                              fieldErrors[`sizes.${idx}.size_label`]
                                ? "border-red-500 bg-red-50/20 text-red-950 focus:outline-none"
                                : "border-[#18181B]/15 bg-white text-[#18181B]"
                            }`}
                            placeholder="e.g. Standard 3-Door (78&quot; x 36&quot;)"
                          />
                          {fieldErrors[`sizes.${idx}.size_label`] && (
                            <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{fieldErrors[`sizes.${idx}.size_label`]}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div>
                            <div className="relative">
                              <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                              <input
                                type="number"
                                min={0}
                                value={s.price > 0 ? s.price : ""}
                                onChange={(e) => {
                                  const updated = [...formData.sizes];
                                  updated[idx].price = Number(e.target.value) || 0;
                                  setFormData({ ...formData, sizes: updated });
                                  clearFieldError(`sizes.${idx}.price`);
                                }}
                                placeholder="Price"
                                className={`w-28 pl-7 pr-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                                  fieldErrors[`sizes.${idx}.price`]
                                    ? "border-red-500 bg-red-50/20 text-red-950 focus:outline-none"
                                    : "border-[#18181B]/15 bg-white text-[#18181B]"
                                }`}
                              />
                            </div>
                            {fieldErrors[`sizes.${idx}.price`] && (
                              <p className="text-[10px] font-semibold text-red-600 mt-0.5">
                                {fieldErrors[`sizes.${idx}.price`]}
                              </p>
                            )}
                          </div>

                          <select
                            value={s.stock_status}
                            onChange={(e) => {
                              const updated = [...formData.sizes];
                              updated[idx].stock_status = e.target.value as "in_stock" | "made_to_order";
                              setFormData({ ...formData, sizes: updated });
                            }}
                            className="px-2.5 py-1.5 rounded-xl border border-[#18181B]/15 bg-white text-xs font-medium cursor-pointer"
                          >
                            <option value="in_stock">In Stock</option>
                            <option value="made_to_order">Made to Order</option>
                          </select>

                          {formData.sizes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.sizes.filter((_, i) => i !== idx);
                                setFormData({ ...formData, sizes: updated });
                              }}
                              className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 3 Specific Dimension Inputs driven by blueprint_type */}
                      <div className="pt-2 border-t border-[#18181B]/10">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-[#71717A] mb-2">
                          Spatial Dimensions (Inches)
                        </span>
                        <div className="grid grid-cols-3 gap-3">
                          {/* Dimension 1 */}
                          <div>
                            <label className="block text-[10px] font-semibold text-[#71717A] mb-1">
                              {formData.blueprint_type === "bed"
                                ? "Length (L)"
                                : formData.blueprint_type === "seating"
                                ? "Total Height (TH)"
                                : "Height (H)"}
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={
                                formData.blueprint_type === "bed"
                                  ? s.dimensions.length ?? 0
                                  : formData.blueprint_type === "seating"
                                  ? s.dimensions.total_height ?? 0
                                  : s.dimensions.height ?? 0
                              }
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                const updated = [...formData.sizes];
                                if (formData.blueprint_type === "bed") {
                                  updated[idx].dimensions.length = val;
                                } else if (formData.blueprint_type === "seating") {
                                  updated[idx].dimensions.total_height = val;
                                } else {
                                  updated[idx].dimensions.height = val;
                                }
                                setFormData({ ...formData, sizes: updated });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[#18181B]/15 bg-white text-xs font-mono font-semibold"
                            />
                          </div>

                          {/* Dimension 2 */}
                          <div>
                            <label className="block text-[10px] font-semibold text-[#71717A] mb-1">
                              {formData.blueprint_type === "seating"
                                ? "Seat Height (SH)"
                                : "Width (W)"}
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={
                                formData.blueprint_type === "seating"
                                  ? s.dimensions.seat_height ?? 0
                                  : s.dimensions.width ?? 0
                              }
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                const updated = [...formData.sizes];
                                if (formData.blueprint_type === "seating") {
                                  updated[idx].dimensions.seat_height = val;
                                } else {
                                  updated[idx].dimensions.width = val;
                                }
                                setFormData({ ...formData, sizes: updated });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[#18181B]/15 bg-white text-xs font-mono font-semibold"
                            />
                          </div>

                          {/* Dimension 3 */}
                          <div>
                            <label className="block text-[10px] font-semibold text-[#71717A] mb-1">
                              {formData.blueprint_type === "bed"
                                ? "Headboard (HH)"
                                : formData.blueprint_type === "seating"
                                ? "Chair Width (W)"
                                : "Depth (D)"}
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={
                                formData.blueprint_type === "bed"
                                  ? s.dimensions.headboard_height ?? 0
                                  : formData.blueprint_type === "seating"
                                  ? s.dimensions.width ?? 0
                                  : s.dimensions.depth ?? 0
                              }
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                const updated = [...formData.sizes];
                                if (formData.blueprint_type === "bed") {
                                  updated[idx].dimensions.headboard_height = val;
                                } else if (formData.blueprint_type === "seating") {
                                  updated[idx].dimensions.width = val;
                                } else {
                                  updated[idx].dimensions.depth = val;
                                }
                                setFormData({ ...formData, sizes: updated });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[#18181B]/15 bg-white text-xs font-mono font-semibold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LIVE TACTILE SVG BLUEPRINT DIAGRAM */}
              <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#18181B]/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                    Live Structural Clearance Diagram
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#18181B]/5 text-[#71717A]">
                    {formData.blueprint_type.toUpperCase()} SPEC
                  </span>
                </div>

                <div className="w-full h-44 bg-white rounded-2xl border border-[#18181B]/10 flex items-center justify-center p-4 relative overflow-hidden">
                  <svg viewBox="0 0 320 160" className="w-full h-full max-h-40">
                    <rect
                      x="70"
                      y="30"
                      width="180"
                      height="100"
                      rx="6"
                      fill="#FAF8F5"
                      stroke="#18181B"
                      strokeWidth="2"
                    />
                    <line
                      x1="160"
                      y1="30"
                      x2="160"
                      y2="130"
                      stroke="#18181B"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                    {/* Dimension Callout Arrows */}
                    <line x1="45" y1="30" x2="45" y2="130" stroke="#9A3412" strokeWidth="1.5" />
                    <text x="35" y="85" fill="#9A3412" fontSize="11" fontWeight="bold" textAnchor="end">
                      {primarySize?.dimensions?.height || primarySize?.dimensions?.length
                        ? `${primarySize?.dimensions?.height || primarySize?.dimensions?.length}&quot;`
                        : `--&quot;`}
                    </text>
                    {/* Width */}
                    <line x1="70" y1="145" x2="250" y2="145" stroke="#9A3412" strokeWidth="1.5" />
                    <text x="160" y="157" fill="#9A3412" fontSize="11" fontWeight="bold" textAnchor="middle">
                      {primarySize?.dimensions?.width ? `${primarySize?.dimensions?.width}&quot; W` : `--&quot; W`}
                    </text>
                    {/* Depth */}
                    <line x1="265" y1="40" x2="285" y2="25" stroke="#71717A" strokeWidth="1.5" />
                    <text x="290" y="30" fill="#71717A" fontSize="10" fontWeight="bold">
                      {primarySize?.dimensions?.depth ? `${primarySize?.dimensions?.depth}&quot; D` : `--&quot; D`}
                    </text>
                  </svg>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl border border-[#18181B]/15 hover:bg-[#FAF8F5] text-xs font-semibold text-[#18181B] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Finishes</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#9A3412] hover:bg-[#b03c15] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isEditing ? "Updating in Supabase..." : "Publishing to Supabase..."}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isEditing ? "Update Furniture Blueprint" : "Publish Master Furniture"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* LIVE STOREFRONT CARD PREVIEW (Sticky Right Column)           */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#9A3412]" />
              Live Storefront Preview
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Customer View
            </span>
          </div>

          {/* Luxury Customer Furniture Card */}
          <div className="bg-white rounded-3xl border border-[#18181B]/10 overflow-hidden shadow-md group">
            {/* Card Image Area */}
            <div className="relative aspect-4/3 w-full bg-[#FAF8F5] overflow-hidden flex items-center justify-center">
              {currentFinish?.media?.lifestyle ||
              currentFinish?.media?.front ||
              currentFinish?.media?.functional ||
              currentFinish?.media?.macro ? (
                <Image
                  src={
                    currentFinish.media.lifestyle ||
                    currentFinish.media.front ||
                    currentFinish.media.functional ||
                    currentFinish.media.macro
                  }
                  alt={formData.title_en || "Product preview"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#71717A] p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#18181B]/5 flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6 text-[#9A3412]/50" />
                  </div>
                  <span className="text-xs font-semibold text-[#18181B]">
                    No Photo Uploaded
                  </span>
                  <span className="text-[11px] text-[#71717A] mt-0.5">
                    Upload at least 1 photo in Step 2 to preview customer card
                  </span>
                </div>
              )}

              <div className="absolute top-3 left-3 bg-[#18181B]/80 backdrop-blur-md text-[#FAF8F5] text-[10px] font-mono px-2.5 py-1 rounded-full uppercase tracking-wider">
                {formData.blueprint_type.toUpperCase()} • TATA 20-GAUGE
              </div>

              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-[#18181B] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                ₹{(primarySize?.price || formData.base_price || 0).toLocaleString("en-IN")}
              </div>
            </div>

            {/* Card Details */}
            <div className="p-5 space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-[#9A3412] uppercase tracking-wider">
                  {activeSubCat
                    ? `${activeParentCat?.name_en || ""} • ${activeSubCat.name_en}`
                    : activeParentCat?.name_en || "Room Department"}
                </p>
                <h3 className="text-base font-serif font-bold text-[#18181B] leading-snug">
                  {formData.title_en || "Untitled Furniture Blueprint"}
                </h3>
                <p className="text-xs text-[#71717A] line-clamp-1 mt-0.5">
                  {formData.tagline || "Tata heavy-gauge steel engineered for lifetime durability"}
                </p>
              </div>

              {/* Finish Swatches */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#18181B]/5">
                <span className="text-[11px] text-[#71717A]">Finish:</span>
                <div className="flex items-center gap-1.5">
                  {formData.finishes.map((f, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedFinishIndex(i)}
                      className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                        selectedFinishIndex === i
                          ? "ring-2 ring-[#9A3412] scale-110"
                          : "border-black/20"
                      }`}
                      style={{ backgroundColor: f.hex_code }}
                      title={f.finish_name}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-[#18181B] ml-1">
                  {currentFinish?.finish_name}
                </span>
              </div>

              {/* Dimensions Chip */}
              <div className="flex items-center justify-between text-xs text-[#71717A] pt-1 font-mono">
                <span>
                  {primarySize?.dimensions?.height || primarySize?.dimensions?.length || 0}&quot; ×{" "}
                  {primarySize?.dimensions?.width || 0}&quot; ×{" "}
                  {primarySize?.dimensions?.depth || 0}&quot;
                </span>
                <span className="text-emerald-700 font-semibold font-sans">
                  Token: ₹{primarySize?.token_amount || 999}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// TACTILE PHOTO SLOT BOX (With in-place field error styling)
// ----------------------------------------------------------------------------
interface PhotoSlotBoxProps {
  slotIndex: number;
  title: string;
  aspectRatio: string;
  badge?: "Mandatory" | "Optional";
  currentUrl?: string;
  errorMessage?: string;
  onImageSelected: (url: string) => void;
  productSlug: string;
  finishName: string;
  slotName: string;
}

function PhotoSlotBox({
  slotIndex,
  title,
  aspectRatio,
  badge,
  currentUrl,
  errorMessage,
  onImageSelected,
  productSlug,
  finishName,
  slotName,
}: PhotoSlotBoxProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const oldUrl = currentUrl;
    setIsUploading(true);
    try {
      const result = await StorageService.uploadProductMedia(file, {
        productSlug,
        finishName,
        slotName,
      });
      onImageSelected(result.publicUrl);

      // Prune previous image from storage if replaced
      if (oldUrl && oldUrl !== result.publicUrl) {
        await StorageService.deleteMediaByUrl(oldUrl);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleApplyUrl = () => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    onImageSelected(trimmed);
    setManualUrl("");
    setShowUrlInput(false);
  };

  return (
    <div
      className={`p-3.5 rounded-2xl bg-white border transition-all space-y-2.5 ${
        errorMessage ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/10" : "border-[#18181B]/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#18181B]">
            Slot {slotIndex}: {title}
          </span>
          {badge && (
            <span
              className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                badge === "Mandatory"
                  ? "bg-amber-100 text-amber-900 font-bold"
                  : "bg-[#18181B]/5 text-[#71717A]"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[#71717A]">
          {aspectRatio}
        </span>
      </div>

      {/* Thumbnail or Upload Drop Area */}
      <div
        onClick={() => {
          if (!currentUrl) {
            fileInputRef.current?.click();
          }
        }}
        className={`relative aspect-video sm:aspect-square w-full rounded-xl overflow-hidden flex items-center justify-center cursor-pointer group transition-colors ${
          currentUrl
            ? "bg-[#FAF8F5]"
            : errorMessage
            ? "bg-red-50/40 border-2 border-dashed border-red-400 hover:border-red-500"
            : "bg-[#FAF8F5] border border-dashed border-[#18181B]/20 hover:border-[#9A3412]"
        }`}
      >
        {currentUrl ? (
          <>
            <Image
              src={currentUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, 20vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-semibold gap-2 p-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  const old = currentUrl;
                  onImageSelected("");
                  if (old) {
                    await StorageService.deleteMediaByUrl(old);
                  }
                }}
                className="px-2 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 backdrop-blur-sm text-white flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-[#71717A] p-2 text-center">
            {isUploading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-[#9A3412]" />
            ) : (
              <>
                <Upload
                  className={`w-5 h-5 mb-1 ${errorMessage ? "text-red-500" : "text-[#9A3412]"}`}
                />
                <span
                  className={`text-[10px] font-semibold uppercase ${
                    errorMessage ? "text-red-700 font-bold" : ""
                  }`}
                >
                  {errorMessage ? "Upload Required Photo" : "Tap to Upload Photo"}
                </span>
                <span className="text-[9px] text-[#71717A] mt-0.5">JPEG, PNG or WebP</span>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* In-place Error Message */}
      {errorMessage && (
        <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      )}

      {/* URL Paste Option Toggle (Optional) */}
      <div className="pt-1">
        {!showUrlInput ? (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="text-[10px] text-[#71717A] hover:text-[#9A3412] inline-flex items-center gap-1 font-semibold cursor-pointer"
          >
            <LinkIcon className="w-3 h-3" />
            <span>Or paste image URL</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 pt-1">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-2.5 py-1 rounded-lg border border-[#18181B]/15 bg-white text-[11px] text-[#18181B] focus:outline-none focus:ring-1 focus:ring-[#9A3412]"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-2 py-1 rounded-lg bg-[#18181B] text-white text-[10px] font-bold cursor-pointer"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="p-1 text-[#71717A] hover:text-[#18181B] cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
