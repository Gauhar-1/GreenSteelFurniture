import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { LocalDataStore } from "@/services/LocalDataStore";
import { type ClientReview, ClientReviewSchema } from "@/types/database";

export class ReviewService {
  private static isConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes("placeholder-project"));
  }

  /**
   * Fetch active reviews for public storefront & reviews showcase
   */
  public static getActiveReviews = cache(
    async (options?: {
      client_type?: "D2C" | "B2B";
      limit?: number;
    }): Promise<ClientReview[]> => {
      try {
        if (!ReviewService.isConfigured()) {
          let list = LocalDataStore.getReviews().filter((r) => r.is_active);
          if (options?.client_type) {
            list = list.filter((r) => r.client_type === options.client_type);
          }
          list.sort((a, b) => a.display_order - b.display_order);
          if (options?.limit) {
            list = list.slice(0, options.limit);
          }
          return list;
        }

        const supabase = getSupabaseServerClient();
        let query = supabase
          .from("client_reviews")
          .select(
            `
            id,
            client_type,
            client_name,
            company_or_location,
            project_title,
            review_text,
            rating,
            media_urls,
            linked_product_id,
            is_featured,
            is_active,
            display_order,
            created_at,
            updated_at,
            linked_product:products(
              id,
              title_en,
              slug,
              category:categories!products_category_id_fkey(slug)
            )
          `
          )
          .eq("is_active", true)
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false });

        if (options?.client_type) {
          query = query.eq("client_type", options.client_type);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;
        if (error || !data) {
          return LocalDataStore.getReviews().filter((r) => r.is_active);
        }

        return data.map((item) => {
          const parsed = ClientReviewSchema.safeParse(item);
          return parsed.success ? parsed.data : (item as unknown as ClientReview);
        });
      } catch {
        return LocalDataStore.getReviews().filter((r) => r.is_active);
      }
    }
  );

  /**
   * Fetch curated featured reviews for landing page / bento showcase
   */
  public static getFeaturedReviews = cache(
    async (limit = 6): Promise<ClientReview[]> => {
      try {
        if (!ReviewService.isConfigured()) {
          const list = LocalDataStore.getReviews()
            .filter((r) => r.is_active && r.is_featured)
            .sort((a, b) => a.display_order - b.display_order)
            .slice(0, limit);
          return list;
        }

        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase
          .from("client_reviews")
          .select(
            `
            id,
            client_type,
            client_name,
            company_or_location,
            project_title,
            review_text,
            rating,
            media_urls,
            linked_product_id,
            is_featured,
            is_active,
            display_order,
            created_at,
            updated_at,
            linked_product:products(
              id,
              title_en,
              slug,
              category:categories!products_category_id_fkey(slug)
            )
          `
          )
          .eq("is_active", true)
          .eq("is_featured", true)
          .order("display_order", { ascending: true })
          .limit(limit);

        if (error || !data) {
          return LocalDataStore.getReviews().filter(
            (r) => r.is_active && r.is_featured
          );
        }

        return data.map((item) => {
          const parsed = ClientReviewSchema.safeParse(item);
          return parsed.success ? parsed.data : (item as unknown as ClientReview);
        });
      } catch {
        return LocalDataStore.getReviews().filter(
          (r) => r.is_active && r.is_featured
        );
      }
    }
  );

  /**
   * Fetch all reviews (including inactive) for Admin Studio
   */
  public static async getAllAdminReviews(): Promise<ClientReview[]> {
    try {
      if (!ReviewService.isConfigured()) {
        return LocalDataStore.getReviews().sort(
          (a, b) => a.display_order - b.display_order
        );
      }

      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("client_reviews")
        .select(
          `
          id,
          client_type,
          client_name,
          company_or_location,
          project_title,
          review_text,
          rating,
          media_urls,
          linked_product_id,
          is_featured,
          is_active,
          display_order,
          created_at,
          updated_at,
          linked_product:products(
            id,
            title_en,
            slug,
            category:categories!products_category_id_fkey(slug)
          )
        `
        )
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error || !data) {
        return LocalDataStore.getReviews();
      }

      return data.map((item) => {
        const parsed = ClientReviewSchema.safeParse(item);
        return parsed.success ? parsed.data : (item as unknown as ClientReview);
      });
    } catch {
      return LocalDataStore.getReviews();
    }
  }
}

