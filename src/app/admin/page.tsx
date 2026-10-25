import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  IndianRupee,
  Clock,
  Package,
  FolderTree,
  ArrowUpRight,
  Plus,
  Sparkles,
  CalendarCheck2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { BookingService } from "@/services/BookingService";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { EmptyState } from "@/components/admin/EmptyState";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard Overview | Admin Studio",
  description: "High-level metrics, total sales, pending orders, and catalog health.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, products, categories, bookings] = await Promise.all([
    BookingService.getBookingStats(),
    ProductService.getProducts(),
    CategoryService.getAllCategories(),
    BookingService.getBookings(),
  ]);

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#18181B]/10">
        <div>
          <span className="text-xs font-mono font-semibold text-[#9A3412] uppercase tracking-wider">
            Live Business Intelligence
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#18181B]">
            Studio Operations Dashboard
          </h1>
          <p className="text-xs md:text-sm text-[#71717A] mt-1">
            Real-time sales, factory manufacturing queue, and steel furniture catalog metrics.
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
        {/* Total Sales */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#18181B]/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#71717A]">
              Total Sales Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#9A3412]/10 text-[#9A3412] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#18181B]">
            ₹{stats.totalSales.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats.totalOrders} total orders processed</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#18181B]/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#71717A]">
              Pending Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#18181B]">
            {stats.pendingOrders}
          </div>
          <p className="text-[11px] text-[#71717A]">
            Awaiting token / confirmation
          </p>
        </div>

        {/* Furniture Catalog */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#18181B]/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#71717A]">
              Catalog Blueprints
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#18181B]">
            {products.length}
          </div>
          <p className="text-[11px] text-[#71717A]">
            Active master models
          </p>
        </div>

        {/* Room Categories */}
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
            Departments & sub-types
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. QUICK MANAGEMENT LAUNCHPAD                                */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/orders"
          className="p-5 rounded-2xl bg-white border border-[#18181B]/10 hover:border-[#9A3412] transition-all group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-2">
            <CalendarCheck2 className="w-5 h-5 text-[#9A3412]" />
            <ArrowUpRight className="w-4 h-4 text-[#71717A] group-hover:text-[#9A3412] transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-[#18181B] group-hover:text-[#9A3412]">
            Orders & Bookings
          </h4>
          <p className="text-xs text-[#71717A] mt-1">
            Track token advances, customer details, and shipping pipeline.
          </p>
        </Link>

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
      {/* 3. RECENT ORDERS (CARD VS TABLE PATTERN)                     */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl border border-[#18181B]/10 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-semibold text-[#9A3412] uppercase tracking-wider">
              Recent Activity
            </span>
            <h3 className="text-lg font-serif font-bold text-[#18181B]">
              Latest Customer Bookings
            </h3>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#9A3412] hover:text-[#b03c15] flex items-center gap-1"
          >
            <span>View All Orders ({bookings.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            icon={CalendarCheck2}
            title="No Orders Yet"
            description="When customers place token advance bookings on your storefront, orders will appear here automatically."
            actionLabel="Visit Storefront"
            actionHref="/"
          />
        ) : (
          <>
            {/* DESKTOP TABLE (Hidden on mobile, visible md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#18181B]/10 text-[#71717A] uppercase tracking-wider font-mono text-[10px]">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Product</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18181B]/5">
                  {recentBookings.map((b, idx) => (
                    <tr key={b.id || idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="py-3.5 font-mono font-bold text-[#18181B]">
                        {(b.id || "ORD").substring(0, 8)}...
                      </td>
                      <td className="py-3.5">
                        <div className="font-semibold text-[#18181B]">{b.customer_name}</div>
                        <div className="text-[11px] text-[#71717A]">{b.customer_phone}</div>
                      </td>
                      <td className="py-3.5">
                        <div className="font-medium text-[#18181B]">
                          {b.product?.title_en || "Custom Steel Furniture"}
                        </div>
                        <div className="text-[10px] text-[#71717A]">
                          {b.finish?.finish_name || "Standard Finish"}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="font-bold text-[#18181B]">
                          ₹{Number(b.total_amount).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-emerald-700">
                          ₹{Number(b.amount_paid).toLocaleString("en-IN")} Paid
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            b.order_status === "confirmed" && "bg-blue-50 text-blue-700 border border-blue-200",
                            b.order_status === "in_production" && "bg-amber-50 text-amber-700 border border-amber-200",
                            b.order_status === "dispatched" && "bg-purple-50 text-purple-700 border border-purple-200",
                            b.order_status === "delivered" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                            b.order_status === "pending_token" && "bg-gray-100 text-gray-700 border border-gray-200"
                          )}
                        >
                          {b.order_status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href="/admin/orders"
                          className="text-[#9A3412] hover:text-[#b03c15] font-semibold"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS (Visible on mobile, hidden on md+) */}
            <div className="block md:hidden space-y-3">
              {recentBookings.map((b, idx) => (
                <div
                  key={b.id || idx}
                  className="p-4 rounded-2xl bg-[#FAF8F5]/60 border border-[#18181B]/10 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#18181B]">
                      {(b.id || "ORD").substring(0, 8)}...
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        b.order_status === "confirmed" && "bg-blue-100 text-blue-800",
                        b.order_status === "in_production" && "bg-amber-100 text-amber-800",
                        b.order_status === "dispatched" && "bg-purple-100 text-purple-800",
                        b.order_status === "delivered" && "bg-emerald-100 text-emerald-800",
                        b.order_status === "pending_token" && "bg-gray-200 text-gray-800"
                      )}
                    >
                      {b.order_status.replace("_", " ")}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-[#18181B]">{b.customer_name}</div>
                    <div className="text-[11px] text-[#71717A]">{b.customer_phone}</div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#18181B]/10 text-xs">
                    <span className="text-[#71717A]">
                      {b.product?.title_en || "Steel Furniture"}
                    </span>
                    <span className="font-bold text-[#18181B]">
                      ₹{Number(b.total_amount).toLocaleString("en-IN")}
                    </span>
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
