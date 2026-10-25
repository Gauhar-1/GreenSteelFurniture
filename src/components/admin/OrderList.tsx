"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  CalendarCheck2,
  Phone,
  MapPin,
  IndianRupee,
  ShieldCheck,
  Clock,
  Check,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { type Booking } from "@/types/database";
import { type BookingWithDetails } from "@/services/BookingService";
import { updateBookingStatusAction } from "@/actions/adminActions";
import { EmptyState } from "@/components/admin/EmptyState";
import { cn } from "@/lib/utils";

interface OrderListProps {
  initialBookings: BookingWithDetails[];
}

const STATUS_FILTERS = [
  { label: "All Orders", value: "all" },
  { label: "Pending Token", value: "pending_token" },
  { label: "Confirmed", value: "confirmed" },
  { label: "In Production", value: "in_production" },
  { label: "Dispatched", value: "dispatched" },
  { label: "Delivered", value: "delivered" },
];

export function OrderList({ initialBookings }: OrderListProps) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>(initialBookings);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ success: boolean; message: string } | null>(null);

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (activeFilter !== "all" && b.order_status !== activeFilter) {
      return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.customer_name.toLowerCase().includes(q) ||
      b.customer_phone.includes(q) ||
      b.city_district.toLowerCase().includes(q) ||
      (b.id || "").toLowerCase().includes(q)
    );
  });

  const handleStatusChange = (id: string, newStatus: Booking["order_status"]) => {
    startTransition(async () => {
      const res = await updateBookingStatusAction(id, newStatus);
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, order_status: newStatus } : b))
        );
        setToast({
          success: true,
          message: `Order status updated to "${newStatus.replace("_", " ")}"!`,
        });
      } else {
        setToast({
          success: false,
          message: res.message || "Failed to update order status.",
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
            Fulfillment Engine
          </span>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-[#18181B]">
            Customer Bookings & Orders
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Real-time ₹999 token advances, factory manufacturing queue, and dispatch logistics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            {bookings.length} Total Orders
          </span>
        </div>
      </div>

      {/* Search & Status Filter Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#18181B]/10 shadow-2xs">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {STATUS_FILTERS.map((f) => {
            const active = activeFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                  active
                    ? "bg-[#18181B] text-white shadow-2xs"
                    : "text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF8F5]"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, city..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/40 text-xs text-[#18181B] focus:border-[#9A3412] focus:outline-none"
          />
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2}
          title={bookings.length === 0 ? "No Customer Orders Yet" : "No Orders Match Filter"}
          description={
            bookings.length === 0
              ? "When customers place token advance orders on your storefront, they will be listed here with delivery logistics."
              : "Try adjusting your search query or status filter to locate relevant customer orders."
          }
          actionLabel={bookings.length === 0 ? "Visit Storefront" : "Reset Filter"}
          actionHref={bookings.length === 0 ? "/" : undefined}
          onAction={bookings.length > 0 ? () => { setActiveFilter("all"); setSearchQuery(""); } : undefined}
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
                    <th className="py-3.5 px-4 font-semibold">Order / Date</th>
                    <th className="py-3.5 px-4 font-semibold">Customer</th>
                    <th className="py-3.5 px-4 font-semibold">Destination</th>
                    <th className="py-3.5 px-4 font-semibold">Furniture Piece</th>
                    <th className="py-3.5 px-4 font-semibold">Amount Details</th>
                    <th className="py-3.5 px-4 font-semibold">Status / Pipeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18181B]/5">
                  {filteredBookings.map((b, idx) => (
                    <tr key={b.id || idx} className="hover:bg-[#FAF8F5]/50 transition-colors">
                      <td className="py-4 px-4 font-mono">
                        <div className="font-bold text-[#18181B]">{(b.id || "ORD").substring(0, 8)}...</div>
                        <div className="text-[10px] text-[#71717A]">
                          {b.created_at ? new Date(b.created_at).toLocaleDateString() : "Recent"}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-[#18181B]">{b.customer_name}</div>
                        <div className="text-[11px] text-[#71717A] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#9A3412]" />
                          <span>{b.customer_phone}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-[#18181B]">{b.city_district}</div>
                        <div className="text-[10px] text-[#71717A] flex items-center gap-1 font-mono">
                          <MapPin className="w-3 h-3 text-[#71717A]" />
                          <span>PIN {b.pincode}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-[#18181B]">
                          {b.product?.title_en || "Architectural Steel Model"}
                        </div>
                        <div className="text-[11px] text-[#71717A]">
                          {b.finish?.finish_name || "Matte Finish"} • {b.size?.size_label || "Standard"}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-[#18181B]">
                          ₹{Number(b.total_amount).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          ₹{Number(b.amount_paid).toLocaleString("en-IN")} token paid
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={b.order_status}
                          disabled={isPending}
                          onChange={(e) =>
                            b.id &&
                            handleStatusChange(
                              b.id,
                              e.target.value as Booking["order_status"]
                            )
                          }
                          className={cn(
                            "px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border cursor-pointer focus:outline-none",
                            b.order_status === "confirmed" && "bg-blue-50 text-blue-800 border-blue-200",
                            b.order_status === "in_production" && "bg-amber-50 text-amber-800 border-amber-200",
                            b.order_status === "dispatched" && "bg-purple-50 text-purple-800 border-purple-200",
                            b.order_status === "delivered" && "bg-emerald-50 text-emerald-800 border-emerald-200",
                            b.order_status === "pending_token" && "bg-gray-100 text-gray-800 border-gray-200",
                            b.order_status === "cancelled" && "bg-red-50 text-red-800 border-red-200"
                          )}
                        >
                          <option value="pending_token">Pending Token</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in_production">In Production</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============================================================ */}
          {/* MOBILE CARD VIEW (The "Card vs. Table" Pattern)              */}
          {/* ============================================================ */}
          <div className="block md:hidden space-y-3.5">
            {filteredBookings.map((b, idx) => (
              <div
                key={b.id || idx}
                className="bg-white rounded-2xl border border-[#18181B]/10 p-4 space-y-3 shadow-2xs hover:border-[#18181B]/20 transition-all"
              >
                {/* Header: ID + Status Dropdown */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#18181B]/5">
                  <span className="font-mono text-xs font-bold text-[#18181B]">
                    #{(b.id || "ORD").substring(0, 8)}
                  </span>

                  <select
                    value={b.order_status}
                    disabled={isPending}
                    onChange={(e) =>
                      b.id &&
                      handleStatusChange(
                        b.id,
                        e.target.value as Booking["order_status"]
                      )
                    }
                    className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border cursor-pointer",
                      b.order_status === "confirmed" && "bg-blue-50 text-blue-800 border-blue-200",
                      b.order_status === "in_production" && "bg-amber-50 text-amber-800 border-amber-200",
                      b.order_status === "dispatched" && "bg-purple-50 text-purple-800 border-purple-200",
                      b.order_status === "delivered" && "bg-emerald-50 text-emerald-800 border-emerald-200",
                      b.order_status === "pending_token" && "bg-gray-100 text-gray-800 border-gray-200"
                    )}
                  >
                    <option value="pending_token">Pending Token</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_production">In Production</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Customer Details */}
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-bold text-[#18181B]">{b.customer_name}</div>
                  <div className="flex items-center gap-2 text-xs text-[#71717A]">
                    <Phone className="w-3.5 h-3.5 text-[#9A3412]" />
                    <span>{b.customer_phone}</span>
                    <span>•</span>
                    <span className="line-clamp-1">{b.city_district}</span>
                  </div>
                </div>

                {/* Product & Price */}
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#18181B]/5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#18181B]">
                      {b.product?.title_en || "Pure Steel Furniture"}
                    </div>
                    <div className="text-[10px] text-[#71717A]">
                      {b.finish?.finish_name || "Charcoal"} • PIN {b.pincode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#18181B]">
                      ₹{Number(b.total_amount).toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold">
                      ₹{Number(b.amount_paid).toLocaleString("en-IN")} advance
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
