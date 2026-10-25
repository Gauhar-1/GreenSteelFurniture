"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, ArrowUpRight, Trash2 } from "lucide-react";
import { type ProductCatalogItem } from "@/services/ProductService";
import { cn } from "@/lib/utils";

interface AdminProductCardProps {
  product: ProductCatalogItem;
  onDelete?: (id: string, title: string) => void;
}

export function AdminProductCard({ product, onDelete }: AdminProductCardProps) {
  const firstFinish = product.finishes?.[0];
  const lifestyleImage =
    firstFinish?.media?.lifestyle ||
    firstFinish?.media?.front ||
    "/bento-wardrobe-navy.png";

  return (
    <div className="bg-white rounded-2xl border border-[#18181B]/10 p-4 space-y-3.5 shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex items-start gap-3">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#18181B]/10">
          <Image
            src={lifestyleImage}
            alt={product.title_en}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[10px] font-mono text-[#9A3412] uppercase tracking-wider truncate">
              {product.category?.name_en || "General"}
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0",
                product.is_active
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-100 text-gray-700"
              )}
            >
              {product.is_active ? "Active" : "Draft"}
            </span>
          </div>

          <h4 className="text-xs font-bold text-[#18181B] truncate">
            {product.title_en}
          </h4>

          {product.title_hi && (
            <p className="text-[11px] text-[#71717A] truncate font-serif">
              {product.title_hi}
            </p>
          )}

          <div className="text-xs font-bold text-[#18181B] mt-1 font-mono">
            ₹{Number(product.base_price).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Swatches & Actions Row */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#18181B]/10 text-xs">
        <div className="flex items-center gap-1.5">
          {product.finishes?.slice(0, 3).map((f) => (
            <span
              key={f.id}
              title={f.finish_name}
              className="w-3.5 h-3.5 rounded-full border border-[#18181B]/20 inline-block shadow-2xs"
              style={{ backgroundColor: f.hex_code }}
            />
          ))}
          <span className="text-[10px] font-mono text-[#71717A]">
            {product.finishes?.length || 0} finish(es)
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Secondary-styled Edit Button */}
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#18181B]/15 hover:border-[#9A3412] bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 text-[#18181B] hover:text-[#9A3412] text-[11px] font-semibold transition-colors cursor-pointer"
            title="Edit Product Blueprint"
          >
            <Pencil className="w-3 h-3 text-[#9A3412]" />
            <span>Edit</span>
          </Link>

          {/* Storefront View */}
          <Link
            href={`/categories/${product.category?.slug || "bedroom"}/product/${product.slug}`}
            target="_blank"
            className="p-1.5 rounded-xl border border-[#18181B]/10 hover:border-[#18181B] text-[#71717A] hover:text-[#18181B] transition-colors"
            title="View Live Storefront"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {/* Delete Button */}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(product.id, product.title_en)}
              className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete Product"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
