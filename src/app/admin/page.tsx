import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Package,
  FolderTree,
  ArrowUpRight,
  Plus,
  Sparkles,
  CheckCircle2,
  Layers,
  Pencil,
} from "lucide-react";
import { ProductService, type ProductCatalogItem } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { StorefrontService } from "@/services/StorefrontService";
import type { Category } from "@/types/database";
import { EmptyState } from "@/components/admin/EmptyState";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard Overview | Admin Studio",
  description: "High-level catalog health, categories, and storefront blocks.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [products, categories, storefrontSections]: [
    ProductCatalogItem[],
    Category[],
    Array<{ is_active: boolean }>
  ] = await Promise.all([
    ProductService.getProducts(),
    CategoryService.getAllCategories(),
    StorefrontService.getStorefrontSections(),
  ]);

  const activeProducts = products.filter((p: ProductCatalogItem) => p.is_active);
  const activeCategories = categories.filter((c: Category) => c.is_active);
  const activeSections = storefrontSections.filter((s: { is_active: boolean }) => s.is_active);

  const recentProducts = [...products]
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#18181B]/10">
        <div>
          <span className="text-xs font-mono font-semibold text-[#9A3412] uppercase tracking-wider">
            Live Catalog Intelligence
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#18181B]">
            Studio Operations Dashboard
          </h1>
          <p className="text-xs md:text-sm text-[#71717A] mt-1">
            Real-time catalog inventory, room categories, and interactive storefront visual blocks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#9A3412] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Furniture</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 bg-white text-xs font-semibold text-[#18181B] hover:border-[#18181B] transition-colors"
          >
            <span>Storefront</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. HIGH-LEVEL KPI METRICS                                    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Catalog Models */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#18181B]/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#71717A]">
              Total Models
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#9A3412]/10 text-[#9A3412] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#18181B]">
            {products.length}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{activeProducts.length} published live</span>
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#18181B]/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#71717A]">
              Room Categories
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#18181B]">
            {categories.length}
          </div>
          <p className="text-[11px] text-[#71717A]">
            {activeCategories.length} active in navigation
          </p>
        </div>

        {/* Active Storefront Blocks */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#18181B]/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#71717A]">
              Storefront Sections
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#18181B]">
            {storefrontSections.length}
          </div>
          <p className="text-[11px] text-[#71717A]">
            {activeSections.length} active visual blocks
          </p>
        </div>

        {/* Finishes & Variants */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#18181B]/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#71717A]">
              Finish Variations
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#18181B]">
            {products.reduce((acc: number, p: ProductCatalogItem) => acc + (p.finishes?.length || 0), 0)}
          </div>
          <p className="text-[11px] text-[#71717A]">
            Coated powder-finish configurations
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. QUICK MANAGEMENT LAUNCHPAD                                */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/products"
          className="p-5 rounded-2xl bg-white border border-[#18181B]/10 hover:border-[#9A3412] transition-all group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-[#9A3412]" />
            <ArrowUpRight className="w-4 h-4 text-[#71717A] group-hover:text-[#9A3412] transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-[#18181B] group-hover:text-[#9A3412]">
            Furniture Catalog
          </h4>
          <p className="text-xs text-[#71717A] mt-1">
            Browse all products, color finishes, and spatial dimensions.
          </p>
        </Link>

        <Link
          href="/admin/categories"
          className="p-5 rounded-2xl bg-white border border-[#18181B]/10 hover:border-[#9A3412] transition-all group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-2">
            <FolderTree className="w-5 h-5 text-[#9A3412]" />
            <ArrowUpRight className="w-4 h-4 text-[#71717A] group-hover:text-[#9A3412] transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-[#18181B] group-hover:text-[#9A3412]">
            Category Manager
          </h4>
          <p className="text-xs text-[#71717A] mt-1">
            Create multi-tier rooms and configure blueprint dimension rules.
          </p>
        </Link>

        <Link
          href="/admin/storefront"
          className="p-5 rounded-2xl bg-white border border-[#18181B]/10 hover:border-[#9A3412] transition-all group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-2">
            <Sparkles className="w-5 h-5 text-[#9A3412]" />
            <ArrowUpRight className="w-4 h-4 text-[#71717A] group-hover:text-[#9A3412] transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-[#18181B] group-hover:text-[#9A3412]">
            Storefront Controller
          </h4>
          <p className="text-xs text-[#71717A] mt-1">
            Visual editor for Room Hotspots, Complete the Look, and Bento.
          </p>
        </Link>
      </div>

      {/* ============================================================ */}
      {/* 3. RECENT FURNITURE MODELS                                  */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl border border-[#18181B]/10 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-semibold text-[#9A3412] uppercase tracking-wider">
              Recent Inventory
            </span>
            <h3 className="text-lg font-serif font-bold text-[#18181B]">
              Latest Master Models
            </h3>
          </div>

          <Link
            href="/admin/products"
            className="text-xs font-bold text-[#9A3412] hover:text-[#b03c15] flex items-center gap-1"
          >
            <span>View All Models ({products.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Furniture Models Yet"
            description="Create your first heavy-gauge steel furniture master model using the 3-step wizard."
            actionLabel="Create Model"
            actionHref="/admin/products/new"
          />
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#18181B]/10 text-[#71717A] uppercase tracking-wider font-mono text-[10px]">
                    <th className="pb-3 font-semibold">Model Name</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Finishes</th>
                    <th className="pb-3 font-semibold">Base Price</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18181B]/5">
                  {recentProducts.map((p: ProductCatalogItem) => (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="py-3.5">
                        <div className="font-bold text-[#18181B]">{p.title_en}</div>
                      </td>
                      <td className="py-3.5 text-[#71717A]">
                        {p.category?.name_en || "General"}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          {p.finishes?.slice(0, 4).map((f: ProductCatalogItem["finishes"][number]) => (
                            <span
                              key={f.id}
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: f.hex_code }}
                              title={f.finish_name}
                            />
                          ))}
                          {(p.finishes?.length || 0) > 4 && (
                            <span className="text-[10px] text-[#71717A]">
                              +{p.finishes.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 font-bold text-[#18181B]">
                        ₹{Number(p.base_price).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            p.is_active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          )}
                        >
                          {p.is_active ? "Live" : "Draft"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="text-[#9A3412] hover:text-[#b03c15] font-semibold inline-flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="block md:hidden space-y-3">
              {recentProducts.map((p: ProductCatalogItem) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-[#FAF8F5]/60 border border-[#18181B]/10 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#18181B] truncate">{p.title_en}</span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        p.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-700"
                      )}
                    >
                      {p.is_active ? "Live" : "Draft"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#71717A]">
                    <span>{p.category?.name_en || "General"}</span>
                    <span className="font-bold text-[#18181B]">
                      ₹{Number(p.base_price).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#18181B]/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      {p.finishes?.slice(0, 3).map((f: ProductCatalogItem["finishes"][number]) => (
                        <span
                          key={f.id}
                          className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: f.hex_code }}
                        />
                      ))}
                    </div>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-[#9A3412] font-semibold"
                    >
                      Edit Blueprint
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
