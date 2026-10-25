import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Booking } from "@/types/database";
import { LocalDataStore } from "@/services/LocalDataStore";

export interface BookingWithDetails extends Booking {
  product?: {
    title_en: string;
    slug: string;
  } | null;
  finish?: {
    finish_name: string;
    hex_code: string;
  } | null;
  size?: {
    size_label: string;
    price: number;
  } | null;
}

export interface BookingStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  inProductionCount: number;
}

export class BookingService {
  public static isConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes("placeholder-project"));
  }

  /**
   * Fetch all customer bookings from Supabase or LocalDataStore fallback
   */
  public static async getBookings(): Promise<BookingWithDetails[]> {
    try {
      if (!this.isConfigured()) {
        return LocalDataStore.getBookings();
      }

      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          product:products(title_en, slug),
          finish:product_finishes(finish_name, hex_code),
          size:product_sizes(size_label, price)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookings from Supabase:", error.message);
        return [];
      }

      return (data as unknown as BookingWithDetails[]) || [];
    } catch (err) {
      console.error("Exception in BookingService.getBookings:", err);
      return [];
    }
  }

  /**
   * Calculate high-level metrics for dashboard
   */
  public static async getBookingStats(): Promise<BookingStats> {
    const bookings = await this.getBookings();

    const totalOrders = bookings.length;
    const totalSales = bookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
    const pendingOrders = bookings.filter(
      (b) => b.order_status === "pending_token" || b.order_status === "confirmed"
    ).length;
    const inProductionCount = bookings.filter(
      (b) => b.order_status === "in_production"
    ).length;

    return {
      totalSales,
      totalOrders,
      pendingOrders,
      inProductionCount,
    };
  }

  /**
   * Update booking order status
   */
  public static async updateBookingStatus(
    id: string,
    status: Booking["order_status"]
  ): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        return LocalDataStore.updateBookingStatus(id, status);
      }

      const supabase = getSupabaseServerClient();
      const { error } = await supabase
        .from("bookings")
        .update({ order_status: status, updated_at: new Date().toISOString() })
        .eq("id", id);

      return !error;
    } catch {
      return false;
    }
  }
}
