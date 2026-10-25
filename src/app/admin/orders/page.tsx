import React from "react";
import { Metadata } from "next";
import { BookingService } from "@/services/BookingService";
import { OrderList } from "@/components/admin/OrderList";

export const metadata: Metadata = {
  title: "Customer Orders & Bookings | Admin Studio",
  description: "Monitor customer token advance orders, production statuses, and deliveries.",
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const bookings = await BookingService.getBookings();

  return (
    <div className="space-y-6">
      <OrderList initialBookings={bookings} />
    </div>
  );
}
