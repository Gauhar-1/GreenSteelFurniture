"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import {
  Star,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  Eye,
  EyeOff,
  Sparkles,
  Building,
  Home,
  Link as LinkIcon,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import type { ClientReview, ClientReviewFormData } from "@/types/database";
import {
  saveReviewAction,
  deleteReviewAction,
  toggleReviewFeaturedAction,
  toggleReviewActiveAction,
} from "@/actions/reviewActions";
import { StorageService } from "@/services/StorageService";
import { cn } from "@/lib/utils";

interface ReviewsManagerProps {
  initialReviews?: ClientReview[];
  products?: Array<{ id: string; title_en: string; slug: string }>;
}

export function ReviewsManager({
  initialReviews = [],
  products = [],
}: ReviewsManagerProps) {
  const [reviews, setReviews] = useState<ClientReview[]>(initialReviews);
  const [filterType, setFilterType] = useState<"ALL" | "D2C" | "B2B">("ALL");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ClientReviewFormData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ success: boolean; message: string } | null>(null);

  // Track created local object URLs to prevent memory leaks
  const createdObjectUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = createdObjectUrls.current;
    return () => {
      // Memory cleanup on unmount
      urls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
      urls.clear();
    };
  }, []);

  const showToast = (success: boolean, message: string) => {
    setToast({ success, message });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterType === "ALL") return true;
    return r.client_type === filterType;
  });

  const d2cCount = reviews.filter((r) => r.client_type === "D2C").length;
  const b2bCount = reviews.filter((r) => r.client_type === "B2B").length;

  const handleOpenNew = () => {
    setEditingReview({
      client_type: "D2C",
      client_name: "",
      company_or_location: "",
      project_title: "",
      review_text: "",
      rating: 5,
      media_urls: [],
      linked_product_id: null,
      is_featured: false,
      is_active: true,
      display_order: reviews.length,
    });
    setIsEditorOpen(true);
  };

  const handleEdit = (rev: ClientReview) => {
    setEditingReview({
      id: rev.id,
      client_type: rev.client_type,
      client_name: rev.client_name,
      company_or_location: rev.company_or_location,
      project_title: rev.project_title,
      review_text: rev.review_text,
      rating: rev.rating,
      media_urls: [...rev.media_urls],
      linked_product_id: rev.linked_product_id || null,
      is_featured: rev.is_featured,
      is_active: rev.is_active,
      display_order: rev.display_order,
    });
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingReview(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingReview) return;

    setIsUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await StorageService.uploadReviewMedia(file, editingReview.client_type);
        if (res.publicUrl) {
          if (res.publicUrl.startsWith("blob:")) {
            createdObjectUrls.current.add(res.publicUrl);
          }
          newUrls.push(res.publicUrl);
        }
      }

      setEditingReview((prev) =>
        prev
          ? {
              ...prev,
              media_urls: [...prev.media_urls, ...newUrls],
            }
          : null
      );
      showToast(true, `Uploaded ${newUrls.length} photo(s).`);
    } catch (err) {
      console.error("Upload error:", err);
      showToast(false, "Failed to upload photo(s).");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = (idx: number) => {
    if (!editingReview) return;
    const removedUrl = editingReview.media_urls[idx];
    if (removedUrl && removedUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(removedUrl);
        createdObjectUrls.current.delete(removedUrl);
      } catch {
        // ignore
      }
    }
    setEditingReview({
      ...editingReview,
      media_urls: editingReview.media_urls.filter((_, i) => i !== idx),
    });
  };

  const handleSave = () => {
    if (!editingReview) return;
    if (!editingReview.client_name.trim()) {
      showToast(false, "Client name is required.");
      return;
    }
    if (!editingReview.project_title.trim()) {
      showToast(false, "Project title is required.");
      return;
    }
    if (!editingReview.company_or_location.trim()) {
      showToast(false, "Location or company name is required.");
      return;
    }
    if (!editingReview.review_text.trim()) {
      showToast(false, "Review text is required.");
      return;
    }

    startSaveTransition(async () => {
      const res = await saveReviewAction(editingReview);
      if (res.success) {
        showToast(true, "Review saved successfully!");
        // Update local state
        const savedId = res.data?.id || editingReview.id || `temp-${Date.now()}`;
        setReviews((prev) => {
          const index = prev.findIndex((r) => r.id === savedId);
          const updated: ClientReview = {
            ...editingReview,
            id: savedId,
            linked_product: products.find((p) => p.id === editingReview.linked_product_id)
              ? {
                  id: editingReview.linked_product_id!,
                  title_en: products.find((p) => p.id === editingReview.linked_product_id)!.title_en,
                  slug: products.find((p) => p.id === editingReview.linked_product_id)!.slug,
                }
              : null,
          };
          if (index > -1) {
            const next = [...prev];
            next[index] = updated;
            return next;
          }
          return [updated, ...prev];
        });
        handleCloseEditor();
      } else {
        showToast(false, res.message || "Failed to save review.");
      }
    });
  };

  const handleDelete = async (id: string) => {
    const res = await deleteReviewAction(id);
    if (res.success) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setDeleteConfirmId(null);
      showToast(true, "Review deleted.");
    } else {
      showToast(false, res.message || "Failed to delete review.");
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    const nextVal = !current;
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_featured: nextVal } : r))
    );
    const res = await toggleReviewFeaturedAction(id, nextVal);
    if (!res.success) {
      // Revert on failure
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_featured: current } : r))
      );
      showToast(false, "Failed to update featured status.");
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const nextVal = !current;
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: nextVal } : r))
    );
    const res = await toggleReviewActiveAction(id, nextVal);
    if (!res.success) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: current } : r))
      );
      showToast(false, "Failed to update visibility.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-20 md:bottom-8 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-bottom-3",
            toast.success
              ? "bg-[#18181B] text-[#FAF8F5] border border-emerald-500/30"
              : "bg-red-950 text-red-100 border border-red-500/40"
          )}
        >
          {toast.success ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <X className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#18181B]/10 shadow-xs">
        {/* Segmented Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-xl border border-[#18181B]/10">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              filterType === "ALL"
                ? "bg-[#18181B] text-white shadow-xs"
                : "text-[#71717A] hover:text-[#18181B]"
            )}
          >
            All ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("D2C")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer",
              filterType === "D2C"
                ? "bg-[#18181B] text-white shadow-xs"
                : "text-[#71717A] hover:text-[#18181B]"
            )}
          >
            <Home className="w-3 h-3" />
            <span>Residential D2C ({d2cCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType("B2B")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer",
              filterType === "B2B"
                ? "bg-[#18181B] text-white shadow-xs"
                : "text-[#71717A] hover:text-[#18181B]"
            )}
          >
            <Building className="w-3 h-3" />
            <span>Commercial B2B ({b2bCount})</span>
          </button>
        </div>

        {/* Add Review Button */}
        <button
          type="button"
          onClick={handleOpenNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#9A3412] text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client Review</span>
        </button>
      </div>

      {/* Review List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#18181B]/10 p-12 text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-[#71717A] mx-auto opacity-50" />
          <h4 className="text-sm font-semibold text-[#18181B]">No client reviews in this view</h4>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            Click &ldquo;Add Client Review&rdquo; to showcase verified residential homeowners or commercial institutional installations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className={cn(
                "bg-white rounded-2xl border p-5 space-y-4 transition-all shadow-xs relative",
                rev.is_active ? "border-[#18181B]/10" : "border-dashed border-[#18181B]/20 opacity-70"
              )}
            >
              {/* Header: Client Type, Name & Action Icons */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold",
                        rev.client_type === "B2B"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      )}
                    >
                      {rev.client_type === "B2B" ? "Commercial B2B" : "Residential D2C"}
                    </span>

                    {rev.is_featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-[#18181B] tracking-tight">
                    {rev.client_name}
                  </h4>
                  <p className="text-xs text-[#71717A]">{rev.company_or_location}</p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(rev.id, rev.is_featured)}
                    title={rev.is_featured ? "Remove from Featured" : "Mark as Featured"}
                    className={cn(
                      "p-1.5 rounded-lg border transition-colors cursor-pointer",
                      rev.is_featured
                        ? "border-amber-300 bg-amber-50 text-amber-500"
                        : "border-[#18181B]/10 text-[#71717A] hover:bg-[#FAF8F5]"
                    )}
                  >
                    <Star
                      className={cn("w-3.5 h-3.5", rev.is_featured ? "fill-amber-400 text-amber-500" : "")}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(rev.id, rev.is_active)}
                    title={rev.is_active ? "Hide from Storefront" : "Publish to Storefront"}
                    className={cn(
                      "p-1.5 rounded-lg border transition-colors cursor-pointer",
                      rev.is_active
                        ? "border-[#18181B]/10 text-[#18181B] hover:bg-[#FAF8F5]"
                        : "border-red-200 bg-red-50 text-red-500"
                    )}
                  >
                    {rev.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEdit(rev)}
                    title="Edit Review"
                    className="p-1.5 rounded-lg border border-[#18181B]/10 text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(rev.id)}
                    title="Delete Review"
                    className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Project Title & Rating */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#18181B]/5">
                <span className="font-semibold text-[#18181B] tracking-tight">
                  {rev.project_title}
                </span>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-3 h-3",
                        i < rev.rating
                          ? "fill-amber-400 text-amber-500"
                          : "text-zinc-200"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <p className="text-xs text-[#71717A] leading-relaxed italic bg-[#FAF8F5]/80 p-3 rounded-xl border border-[#18181B]/5">
                &ldquo;{rev.review_text}&rdquo;
              </p>

              {/* Media Thumbnails */}
              {rev.media_urls && rev.media_urls.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {rev.media_urls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-[#18181B]/10 bg-zinc-100"
                    >
                      <Image
                        src={url}
                        alt={`Craftsmanship photo ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Linked Product Pill */}
              {rev.linked_product && (
                <div className="pt-2 border-t border-[#18181B]/5 flex items-center gap-1.5 text-[11px] text-[#71717A]">
                  <LinkIcon className="w-3 h-3 text-[#9A3412]" />
                  <span>Linked Piece:</span>
                  <span className="font-medium text-[#18181B]">{rev.linked_product.title_en}</span>
                </div>
              )}

              {/* Delete Confirmation Overlay */}
              {deleteConfirmId === rev.id && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4 text-center space-y-3 z-10 animate-in fade-in">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <p className="text-xs font-semibold text-[#18181B]">
                    Permanently delete review for &ldquo;{rev.client_name}&rdquo;?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(rev.id)}
                      className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Yes, Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-4 py-1.5 rounded-lg border border-[#18181B]/15 text-xs text-[#71717A] hover:bg-zinc-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Drawer Modal */}
      {isEditorOpen && editingReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-[#18181B]/15 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#18181B]/10">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#71717A]">
                  {editingReview.id ? "Edit Review" : "New Client Story"}
                </span>
                <h3 className="text-lg font-serif font-bold text-[#18181B]">
                  {editingReview.id ? "Update Client Review" : "Publish Client Showcase Review"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseEditor}
                className="p-1.5 rounded-lg hover:bg-zinc-100 text-[#71717A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client Type Toggle */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                Client Classification
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setEditingReview({ ...editingReview, client_type: "D2C" })
                  }
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                    editingReview.client_type === "D2C"
                      ? "border-[#18181B] bg-[#18181B] text-white shadow-xs"
                      : "border-[#18181B]/15 text-[#71717A] hover:bg-[#FAF8F5]"
                  )}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Residential Homeowner (D2C)</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setEditingReview({ ...editingReview, client_type: "B2B" })
                  }
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                    editingReview.client_type === "B2B"
                      ? "border-[#18181B] bg-[#18181B] text-white shadow-xs"
                      : "border-[#18181B]/15 text-[#71717A] hover:bg-[#FAF8F5]"
                  )}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Commercial / Institutional (B2B)</span>
                </button>
              </div>
            </div>

            {/* Client Name & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1">
                  {editingReview.client_type === "D2C" ? "Client / Homeowner Name" : "Organization / Rep Name"}
                </label>
                <input
                  type="text"
                  value={editingReview.client_name}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, client_name: e.target.value })
                  }
                  placeholder={editingReview.client_type === "D2C" ? "e.g. Rajesh Borah" : "e.g. Hotel Brahmaputra Regency"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 text-xs bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1">
                  {editingReview.client_type === "D2C" ? "City / Location" : "City & Sector / Branch"}
                </label>
                <input
                  type="text"
                  value={editingReview.company_or_location}
                  onChange={(e) =>
                    setEditingReview({
                      ...editingReview,
                      company_or_location: e.target.value,
                    })
                  }
                  placeholder={editingReview.client_type === "D2C" ? "e.g. Dibrugarh, Assam" : "e.g. Guwahati · Hospitality"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 text-xs bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none"
                />
              </div>
            </div>

            {/* Project Title & Star Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1">
                  Commissioned Project Title
                </label>
                <input
                  type="text"
                  value={editingReview.project_title}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, project_title: e.target.value })
                  }
                  placeholder={
                    editingReview.client_type === "D2C"
                      ? "e.g. 4-Door Matte Ivory Master Wardrobe"
                      : "e.g. 45 Custom Heavy-Duty Staff Lockers"
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 text-xs bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1">
                  Client Rating ({editingReview.rating} Stars)
                </label>
                <div className="flex items-center gap-1.5 py-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setEditingReview({ ...editingReview, rating: star })
                      }
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "w-5 h-5",
                          star <= editingReview.rating
                            ? "fill-amber-400 text-amber-500"
                            : "text-zinc-200"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Review Quote Text */}
            <div>
              <label className="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1">
                Client Review Quote
              </label>
              <textarea
                rows={3}
                value={editingReview.review_text}
                onChange={(e) =>
                  setEditingReview({ ...editingReview, review_text: e.target.value })
                }
                placeholder="The steel finish feels so premium and solid. Completely eliminated our termite worries..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 text-xs bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Product Linker */}
            <div>
              <label className="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1">
                Link to Catalog Furniture Piece (Optional)
              </label>
              <select
                value={editingReview.linked_product_id || ""}
                onChange={(e) =>
                  setEditingReview({
                    ...editingReview,
                    linked_product_id: e.target.value || null,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 text-xs bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none"
              >
                <option value="">No linked catalog piece</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Multi-Photo Uploader */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                Craftsmanship & Installation Photos ({editingReview.media_urls.length})
              </label>

              <div className="flex flex-wrap gap-2.5">
                {editingReview.media_urls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#18181B]/15 group"
                  >
                    <Image
                      src={url}
                      alt={`Photo ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors cursor-pointer"
                      title="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-[#18181B]/20 hover:border-[#9A3412] flex flex-col items-center justify-center gap-1 text-[10px] text-[#71717A] hover:text-[#9A3412] transition-colors cursor-pointer bg-[#FAF8F5]/50">
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-[#18181B]/30 border-t-[#18181B] rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload</span>
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Checkbox Toggles: Featured & Active */}
            <div className="flex items-center gap-6 pt-2 border-t border-[#18181B]/10 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#18181B]">
                <input
                  type="checkbox"
                  checked={editingReview.is_featured}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, is_featured: e.target.checked })
                  }
                  className="rounded border-[#18181B]/20 text-[#18181B] focus:ring-0"
                />
                <span>Feature in Homepage Bento Showcase</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#18181B]">
                <input
                  type="checkbox"
                  checked={editingReview.is_active}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, is_active: e.target.checked })
                  }
                  className="rounded border-[#18181B]/20 text-[#18181B] focus:ring-0"
                />
                <span>Visible on Storefront</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#18181B]/10">
              <button
                type="button"
                onClick={handleCloseEditor}
                className="px-5 py-2.5 rounded-xl border border-[#18181B]/15 text-xs font-semibold text-[#71717A] hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isUploading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#9A3412] text-white text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

