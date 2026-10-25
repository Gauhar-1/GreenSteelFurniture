"use client";

import React, { useState, useRef, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  Check,
  ChevronDown,
  ChevronRight,
  Upload,
  ArrowUpRight,
  RefreshCw,
  Layers,
  Sparkles,
  Package,
  X,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  type Category,
  type BlueprintType,
  CategorySchema,
} from "@/types/database";
import {
  saveCategoryAction,
  deleteCategoryAction,
} from "@/actions/adminActions";
import { StorageService } from "@/services/StorageService";
import { EmptyState } from "@/components/admin/EmptyState";
import { cn } from "@/lib/utils";

interface CategoryWithChildren extends Category {
  id: string;
  children?: Category[];
}

interface CategoryManagerProps {
  initialCategories: Category[];
}

const BLUEPRINT_OPTIONS: Array<{ value: BlueprintType; label: string; description: string }> = [
  { value: "wardrobe", label: "Wardrobe / Almirah", description: "Height x Width x Depth (e.g. 3-Door, Vault Lockers)" },
  { value: "bed", label: "Bed Frame / Platform", description: "Length x Width x Headboard Height (King/Queen)" },
  { value: "seating", label: "Seating / Chair", description: "Total Height x Seat Height x Width (Chairs/Stools)" },
  { value: "table", label: "Table / Desk", description: "Length x Width x Height (Dining & Office Desks)" },
  { value: "storage", label: "Storage / Credenza", description: "Height x Width x Depth (Media TV Units & Filing)" },
];

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isPending, startTransition] = useTransition();

  // Collapsible Tree state
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    initialCategories.forEach((c) => {
      if (!c.parent_id && c.id) initial[c.id] = true;
    });
    return initial;
  });

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ success: boolean; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [nameEn, setNameEn] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [blueprintType, setBlueprintType] = useState<BlueprintType>("storage");
  const [coverImage, setCoverImage] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  // Derive Parent categories for hierarchy dropdown
  const parentCategories = categories.filter((c) => !c.parent_id);

  // Build tree structure
  const categoryTree: CategoryWithChildren[] = parentCategories.map((parent) => ({
    ...parent,
    id: parent.id || `cat-${parent.slug}`,
    children: categories.filter((c) => c.parent_id === parent.id),
  }));

  // Auto-generate slug from English Name
  const handleNameEnChange = (val: string) => {
    setNameEn(val);
    if (!editingId) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(autoSlug);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreateModal = (presetParentId?: string) => {
    setEditingId(null);
    setNameEn("");
    setNameHi("");
    setSlug("");
    setParentId(presetParentId || "");
    setBlueprintType("storage");
    setCoverImage("");
    setSubtitle("");
    setDisplayOrder(categories.length);
    setIsActive(true);
    setErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id || null);
    setNameEn(cat.name_en);
    setNameHi(cat.name_hi);
    setSlug(cat.slug);
    setParentId(cat.parent_id || "");
    setBlueprintType(cat.blueprint_type);
    setCoverImage(cat.cover_image);
    setSubtitle(cat.subtitle || "");
    setDisplayOrder(cat.display_order);
    setIsActive(cat.is_active);
    setErrors({});
    setIsFormOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const oldImage = coverImage;
    setIsUploading(true);
    try {
      const res = await StorageService.uploadStorefrontMedia(file, "categories");
      setCoverImage(res.publicUrl);

      // If replacing an existing storage image, prune previous orphan file from storage
      if (oldImage && oldImage !== res.publicUrl) {
        await StorageService.deleteMediaByUrl(oldImage);
      }

      setErrors((prev) => {
        const next = { ...prev };
        delete next.cover_image;
        return next;
      });
    } catch (err) {
      console.error("Cover image upload failed:", err);
      setToast({
        success: false,
        message: "Failed to upload image. Please try again.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveCoverImage = async () => {
    const old = coverImage;
    setCoverImage("");
    if (old) {
      await StorageService.deleteMediaByUrl(old);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!coverImage.trim()) {
      setErrors((prev) => ({
        ...prev,
        cover_image: "Cover photography is required. Please upload an image.",
      }));
      return;
    }

    const id =
      editingId ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, "0")}`);

    const payload: Category = {
      id,
      name_en: nameEn.trim(),
      name_hi: nameHi.trim(),
      slug: slug.trim(),
      parent_id: parentId ? parentId : null,
      blueprint_type: blueprintType,
      cover_image: coverImage.trim(),
      subtitle: subtitle.trim() || null,
      display_order: Number(displayOrder) || 0,
      is_active: isActive,
    };

    const validation = CategorySchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() || "form";
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      const res = await saveCategoryAction(payload);
      if (res.success) {
        setToast({
          success: true,
          message: editingId
            ? `Category "${payload.name_en}" updated successfully!`
            : `Category "${payload.name_en}" created successfully!`,
        });

        if (editingId) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingId ? payload : c))
          );
        } else {
          setCategories((prev) => [...prev, payload]);
        }
        setIsFormOpen(false);
      } else {
        setToast({
          success: false,
          message: res.message || "Failed to save category.",
        });
      }
    });
  };

  const handleDelete = (cat: Category) => {
    if (!cat.id) return;
    if (!window.confirm(`Are you sure you want to delete category "${cat.name_en}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteCategoryAction(cat.id!);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        setToast({
          success: true,
          message: `Category "${cat.name_en}" deleted successfully.`,
        });
      } else {
        setToast({
          success: false,
          message: res.message || "Failed to delete category.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toast && (
        <div
          role="alert"
          className={cn(
            "p-4 rounded-2xl border shadow-sm flex items-center justify-between gap-3",
            toast.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : "bg-red-50 border-red-200 text-red-950"
          )}
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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#18181B]/10">
        <div>
          <span className="text-xs font-mono font-semibold text-[#9A3412] uppercase tracking-wider">
            Architecture Control
          </span>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-[#18181B]">
            Categories & Room Departments
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Configure multi-tier room hierarchies, blueprint dimension rules, and live catalog navigation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCreateModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#9A3412] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* EMPTY STATE */}
      {categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No Categories Found"
          description="Your catalog database has no room categories yet. Create master departments like Bedroom or Living Room to begin adding steel furniture."
          actionLabel="Create First Category"
          onAction={() => openCreateModal()}
        />
      ) : (
        /* HIERARCHICAL TREE VIEW */
        <div className="space-y-4">
          {categoryTree.map((parent) => {
            const isExpanded = expandedParents[parent.id] ?? true;
            const hasChildren = parent.children && parent.children.length > 0;

            return (
              <div
                key={parent.id}
                className="bg-white rounded-3xl border border-[#18181B]/10 overflow-hidden shadow-2xs transition-all hover:border-[#18181B]/20"
              >
                {/* Master Parent Row */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF8F5]/40 border-b border-[#18181B]/5">
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => toggleExpand(parent.id)}
                      className="p-1 rounded-lg hover:bg-white text-[#71717A] transition-colors cursor-pointer"
                      title={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[#18181B]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#18181B]" />
                      )}
                    </button>

                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-[#18181B]/10">
                      <Image
                        src={parent.cover_image}
                        alt={parent.name_en}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-serif font-bold text-[#18181B]">
                          {parent.name_en}
                        </h3>
                        <span className="text-xs text-[#71717A] font-serif">
                          ({parent.name_hi})
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#18181B]/5 text-[#9A3412] font-semibold">
                          /{parent.slug}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#71717A]">
                        <span className="capitalize px-2 py-0.5 rounded bg-white border border-[#18181B]/10 text-[10px] font-mono">
                          Blueprint: {parent.blueprint_type}
                        </span>
                        <span>•</span>
                        <span>{parent.children?.length || 0} Sub-categories</span>
                        {parent.subtitle && (
                          <>
                            <span>•</span>
                            <span className="italic line-clamp-1">{parent.subtitle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for Master Category */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => openCreateModal(parent.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#18181B]/15 bg-white text-xs font-semibold text-[#18181B] hover:border-[#9A3412] hover:text-[#9A3412] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Sub</span>
                    </button>

                    <Link
                      href={`/categories/${parent.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-xl border border-[#18181B]/15 bg-white text-[#71717A] hover:text-[#18181B]"
                      title="View on Storefront"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => openEditModal(parent)}
                      className="p-1.5 rounded-xl border border-[#18181B]/15 bg-white text-[#71717A] hover:text-[#18181B] hover:border-[#18181B] cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(parent)}
                      className="p-1.5 rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub-Categories Tree Branch (Collapsible) */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-3 space-y-2.5">
                    {hasChildren ? (
                      <div className="divide-y divide-[#18181B]/5">
                        {parent.children!.map((child) => (
                          <div
                            key={child.id}
                            className="py-2.5 pl-4 sm:pl-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5]/50 rounded-xl transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#9A3412] shrink-0" />
                              <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#18181B]/10">
                                <Image
                                  src={child.cover_image}
                                  alt={child.name_en}
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-[#18181B]">
                                    {child.name_en}
                                  </span>
                                  <span className="text-[11px] text-[#71717A] font-serif">
                                    ({child.name_hi})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-[#71717A] font-mono">
                                  <span>/{child.slug}</span>
                                  <span>•</span>
                                  <span className="capitalize">Type: {child.blueprint_type}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                              <Link
                                href={`/categories/${child.slug}`}
                                target="_blank"
                                className="p-1.5 rounded-lg border border-[#18181B]/10 text-[#71717A] hover:text-[#18181B]"
                                title="View Storefront"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </Link>

                              <button
                                type="button"
                                onClick={() => openEditModal(child)}
                                className="p-1.5 rounded-lg border border-[#18181B]/10 text-[#71717A] hover:text-[#18181B] cursor-pointer"
                                title="Edit Sub-Category"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(child)}
                                className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Delete Sub-Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#71717A] italic pl-8 py-2">
                        No sub-categories yet under {parent.name_en}. Click &quot;Add Sub&quot; above to create one.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL / DRAWER FOR CREATE & EDIT                             */}
      {/* ============================================================ */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#18181B]/10 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#18181B]/10">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9A3412]">
                  {editingId ? "Update Record" : "New Record"}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#18181B]">
                  {editingId ? "Edit Category" : "Create New Category"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-xl hover:bg-[#FAF8F5] text-[#71717A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* English & Hindi Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#18181B] mb-1">
                    English Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => handleNameEnChange(e.target.value)}
                    placeholder="e.g. Master Bedroom"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#18181B]/15 text-xs font-semibold text-[#18181B] focus:border-[#9A3412] focus:outline-none"
                  />
                  {errors.name_en && (
                    <p className="text-[10px] text-red-600 mt-1">{errors.name_en}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#18181B] mb-1">
                    Hindi Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameHi}
                    onChange={(e) => setNameHi(e.target.value)}
                    placeholder="e.g. मास्टर बेडरूम"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#18181B]/15 text-xs font-semibold text-[#18181B] focus:border-[#9A3412] focus:outline-none"
                  />
                  {errors.name_hi && (
                    <p className="text-[10px] text-red-600 mt-1">{errors.name_hi}</p>
                  )}
                </div>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#18181B] mb-1">
                  URL Slug *
                </label>
                <div className="flex items-center rounded-xl border border-[#18181B]/15 overflow-hidden">
                  <span className="px-3 py-2 bg-[#FAF8F5] text-xs font-mono text-[#71717A] border-r border-[#18181B]/15">
                    /categories/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="master-bedroom"
                    className="w-full px-3 py-2 text-xs font-mono text-[#18181B] focus:outline-none"
                  />
                </div>
                {errors.slug && (
                  <p className="text-[10px] text-red-600 mt-1">{errors.slug}</p>
                )}
              </div>

              {/* Hierarchy: Parent Category Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#18181B] mb-1">
                  Parent Hierarchy
                </label>
                <select
                  name="parent_id"
                  id="parent_id"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#18181B]/15 bg-white text-xs font-medium text-[#18181B] focus:border-[#9A3412] focus:outline-none cursor-pointer"
                >
                  <option value="">None (Top-Level Master Department)</option>
                  {parentCategories
                    .filter((c) => c.id !== editingId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name_en} ({p.name_hi})
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-[#71717A] mt-1">
                  Leave as &quot;None&quot; for primary room departments like Bedroom or Living Room.
                </p>
              </div>

              {/* Blueprint Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#18181B] mb-1">
                  Furniture Blueprint Type *
                </label>
                <select
                  name="blueprint_type"
                  id="blueprint_type"
                  value={blueprintType}
                  onChange={(e) => setBlueprintType(e.target.value as BlueprintType)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#18181B]/15 bg-white text-xs font-medium text-[#18181B] focus:border-[#9A3412] focus:outline-none cursor-pointer"
                >
                  {BLUEPRINT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} — {opt.description}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#71717A] mt-1">
                  Controls dimension fields rendered in the 3-step Product Wizard.
                </p>
              </div>

              {/* Cover Photography Upload Zone & Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#18181B]">
                    Cover Photography <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-[#71717A]">
                    WebP / JPEG / PNG • Max 1600px
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {coverImage ? (
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#18181B]/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-[#18181B]/15 shrink-0 shadow-2xs">
                        <Image
                          src={coverImage}
                          alt="Category Cover Preview"
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#18181B] truncate">
                          Photo uploaded to Supabase
                        </p>
                        <p className="text-[10px] font-mono text-[#71717A]">
                          Ready for showroom display
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#18181B]/15 bg-white text-xs font-semibold text-[#18181B] hover:border-[#9A3412] hover:text-[#9A3412] transition-colors cursor-pointer disabled:opacity-50"
                        title="Upload a new photo to replace the current one"
                      >
                        {isUploading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>Replace</span>
                      </button>

                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={handleRemoveCoverImage}
                        className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                        title="Remove photo and delete from storage"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={cn(
                      "group p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                      errors.cover_image
                        ? "border-red-400 bg-red-50/20 hover:bg-red-50/40"
                        : "border-[#18181B]/20 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] hover:border-[#9A3412]"
                    )}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#9A3412]" />
                        <span className="text-xs font-semibold text-[#18181B]">
                          Compressing & Uploading to Storage...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-white border border-[#18181B]/10 flex items-center justify-center text-[#9A3412] mb-2 shadow-2xs group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-[#18181B]">
                          Tap to Upload Category Cover Photo
                        </span>
                        <p className="text-[11px] text-[#71717A] mt-0.5">
                          High resolution room or category showcase
                        </p>
                      </>
                    )}
                  </div>
                )}

                {errors.cover_image && (
                  <p className="text-[11px] text-red-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.cover_image}</span>
                  </p>
                )}
              </div>

              {/* Subtitle / Tagline */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#18181B] mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Architectural steel almirahs and silent platform beds."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#18181B]/15 text-xs text-[#18181B] focus:border-[#9A3412] focus:outline-none"
                />
              </div>

              {/* Display Order & Active Status */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#18181B] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#18181B]/15 text-xs font-semibold text-[#18181B] focus:border-[#9A3412] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#9A3412] border-gray-300 focus:ring-[#9A3412]"
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-[#18181B] cursor-pointer">
                    Active in Storefront
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#18181B]/10">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#18181B]/15 text-xs font-bold text-[#71717A] hover:text-[#18181B] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[#9A3412] hover:bg-[#b03c15] text-white text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? "Update Category" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
