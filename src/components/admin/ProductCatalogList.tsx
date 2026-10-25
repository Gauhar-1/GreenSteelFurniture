"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Plus,
  ArrowUpRight,
  Trash2,
  Edit,
  Pencil,
  Search,
  Check,
  RefreshCw,
  Sparkles,
  Layers,
} from "lucide-react";
import { type ProductCatalogItem } from "@/services/ProductService";
import { EmptyState } from "@/components/admin/EmptyState";
import { AdminProductCard } from "@/components/admin/AdminProductCard";
import { cn } from "@/lib/utils";

interface ProductCatalogListProps {
  initialProducts: ProductCatalogItem[];
}

export function ProductCatalogList({ initialProducts }: ProductCatalogListProps) {
  const [products, setProducts] = useState<ProductCatalogItem[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ success: boolean; message: string } | null>(null);

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title_en.toLowerCase().includes(q) ||
      p.title_hi.toLowerCase().includes(q) ||
      p.category?.name_en.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q)
    );
  });

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    startTransition(async () => {
      // In production calls delete action
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setToast({
        success: true,
        message: `Product "${title}" removed from catalog.`,
      });
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
            Inventory & Blueprint Hub
          </span>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-[#18181B]">
            Furniture Blueprint Catalog
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Manage your master products, 4-photo finish bundles, and spatial specifications.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#9A3412] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Furniture</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#18181B]/10 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, category, or slug..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/40 text-xs text-[#18181B] focus:border-[#9A3412] focus:outline-none"
          />
        </div>

        <span className="text-xs font-mono font-semibold text-[#71717A] shrink-0">
          {products.length} Products
        </span>
      </div>

      {/* EMPTY STATE */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title={products.length === 0 ? "No Furniture Products Yet" : "No Matching Products"}
          description={
            products.length === 0
              ? "Your pure steel catalog is currently empty. Use the 3-step Product Wizard to publish your first master blueprint with finishes and smart dimensions."
              : "No products matched your search. Clear the search box to view all models."
          }
          actionLabel={products.length === 0 ? "Launch Product Wizard" : "Clear Search"}
          actionHref={products.length === 0 ? "/admin/products/new" : undefined}
          onAction={products.length > 0 ? () => setSearchQuery("") : undefined}
        />
      ) : (
        <>
          {/* ============================================================ */}
          {/* DESKTOP TABLE VIEW (Visible on md and above)                 */}
          {/* ============================================================ */}
          <div className="hidden md:block bg-white rounded-3xl border border-[#18181B]/10 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#18181B]/10 bg-[#FAF8F5]/60 text-[#71717A] uppercase tracking-wider font-mono text-[10px]">
                    <th className="py-3.5 px-4 font-semibold">Furniture Model</th>
                    <th className="py-3.5 px-4 font-semibold">Department / Blueprint</th>
                    <th className="py-3.5 px-4 font-semibold">Base Price</th>
                    <th className="py-3.5 px-4 font-semibold">Color Finishes</th>
                    <th className="py-3.5 px-4 font-semibold">Sizes</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18181B]/5">
                  {filteredProducts.map((p) => {
                    const firstFinish = p.finishes?.[0];
                    const lifestyleImage =
                      firstFinish?.media?.lifestyle ||
                      firstFinish?.media?.front ||
                      "/bento-wardrobe-navy.png";

                    return (
                      <tr key={p.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#18181B]/10">
                              <Image
                                src={lifestyleImage}
                                alt={p.title_en}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-[#18181B] line-clamp-1">
                                {p.title_en}
                              </div>
                              <div className="text-[11px] text-[#71717A] font-serif">
                                {p.title_hi}
                              </div>
                              <span className="text-[10px] font-mono text-[#9A3412]">
                                /{p.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-semibold text-[#18181B]">
                            {p.category?.name_en || "General"}
                          </div>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#18181B]/10 text-[#71717A]">
                            {p.category?.blueprint_type || "wardrobe"}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-bold text-[#18181B]">
                          ₹{Number(p.base_price).toLocaleString("en-IN")}
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            {p.finishes?.slice(0, 4).map((f) => (
                              <span
                                key={f.id}
                                title={f.finish_name}
                                className="w-4 h-4 rounded-full border border-[#18181B]/20 inline-block shadow-2xs"
                                style={{ backgroundColor: f.hex_code }}
                              />
                            ))}
                            <span className="text-[10px] text-[#71717A] ml-1 font-mono">
                              ({p.finishes?.length || 0})
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono text-xs text-[#71717A]">
                          {p.sizes?.length || 0} Size(s)
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              p.is_active
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-gray-100 text-gray-700"
                            )}
                          >
                            {p.is_active ? "Active" : "Draft"}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="p-1.5 rounded-lg border border-[#18181B]/15 hover:border-[#9A3412] bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 text-[#18181B] hover:text-[#9A3412] transition-colors"
                              title="Edit Product Blueprint"
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#9A3412]" />
                            </Link>
                            <Link
                              href={`/categories/${p.category?.slug || "bedroom"}/product/${p.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-[#18181B]/10 hover:border-[#18181B] text-[#71717A] hover:text-[#18181B]"
                              title="Live Storefront View"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(p.id, p.title_en)}
                              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============================================================ */}
          {/* MOBILE CARDS VIEW (Visible on mobile, hidden on md+)         */}
          {/* ============================================================ */}
          <div className="block md:hidden space-y-3.5">
            {filteredProducts.map((p) => (
              <AdminProductCard key={p.id} product={p} onDelete={handleDelete} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
