"use server";

import { revalidatePath } from "next/cache";
import {
  ClientReviewFormSchema,
  type ClientReviewFormData,
  type ClientReview,
} from "@/types/database";
import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";
import { LocalDataStore } from "@/services/LocalDataStore";
import { verifyAdminSession } from "@/actions/authActions";
import type { ServerActionResult } from "@/actions/adminActions";
import { sanitizeErrorMessage } from "@/lib/errorSanitizer";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes("placeholder-project"));
}

/**
 * Server Action: Save or Update a Client Review
 */
export async function saveReviewAction(
  rawInput: ClientReviewFormData
): Promise<ServerActionResult<{ id: string }>> {
  try {
    const { authorized } = await verifyAdminSession();
    if (!authorized) {
      return {
        success: false,
        message: "Unauthorized: Administrator privileges are required.",
      };
    }

    const validated = ClientReviewFormSchema.parse(rawInput);

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();

      const payload = {
        client_type: validated.client_type,
        client_name: validated.client_name,
        company_or_location: validated.company_or_location,
        project_title: validated.project_title,
        review_text: validated.review_text,
        rating: validated.rating,
        media_urls: validated.media_urls,
        linked_product_id: validated.linked_product_id || null,
        is_featured: validated.is_featured,
        is_active: validated.is_active,
        display_order: validated.display_order,
        updated_at: new Date().toISOString(),
      };

      if (validated.id) {
        const { error } = await supabase
          .from("client_reviews")
          .update(payload)
          .eq("id", validated.id);

        if (error) {
          console.error("[saveReviewAction] Supabase update error:", error);
          return { success: false, message: sanitizeErrorMessage(error.message, "Failed to update review. Please try again.") };
        }
      } else {
        const { data, error } = await supabase
          .from("client_reviews")
          .insert(payload)
          .select("id")
          .single();

        if (error || !data) {
          console.error("[saveReviewAction] Supabase insert error:", error);
          return { success: false, message: sanitizeErrorMessage(error?.message, "Failed to create review. Please try again.") };
        }
        validated.id = data.id;
      }
    } else {
      const reviewId = validated.id || `local-review-${Date.now()}`;
      const localReview: ClientReview = {
        ...validated,
        id: reviewId,
        linked_product_id: validated.linked_product_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      LocalDataStore.saveReview(localReview);
      validated.id = reviewId;
    }

    revalidatePath("/");
    revalidatePath("/reviews");
    revalidatePath("/admin/storefront");

    return {
      success: true,
      message: "Client review saved successfully.",
      data: { id: validated.id! },
    };
  } catch (err: unknown) {
    console.error("[saveReviewAction] Exception:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Internal error saving client review.",
    };
  }
}

/**
 * Server Action: Delete a Client Review
 */
export async function deleteReviewAction(
  id: string
): Promise<ServerActionResult<void>> {
  try {
    const { authorized } = await verifyAdminSession();
    if (!authorized) {
      return {
        success: false,
        message: "Unauthorized: Administrator privileges are required.",
      };
    }

    if (!id) {
      return { success: false, message: "Review ID is required." };
    }

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase
        .from("client_reviews")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("[deleteReviewAction] Supabase error:", error);
        return { success: false, message: sanitizeErrorMessage(error.message, "Failed to delete review. Please try again.") };
      }
    } else {
      LocalDataStore.deleteReview(id);
    }

    revalidatePath("/");
    revalidatePath("/reviews");
    revalidatePath("/admin/storefront");

    return {
      success: true,
      message: "Client review deleted.",
    };
  } catch (err: unknown) {
    console.error("[deleteReviewAction] Exception:", err);
    return {
      success: false,
      message: sanitizeErrorMessage(err, "Internal error deleting review."),
    };
  }
}

/**
 * Server Action: Quick Toggle Featured Status
 */
export async function toggleReviewFeaturedAction(
  id: string,
  isFeatured: boolean
): Promise<ServerActionResult<void>> {
  try {
    const { authorized } = await verifyAdminSession();
    if (!authorized) {
      return { success: false, message: "Unauthorized" };
    }

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase
        .from("client_reviews")
        .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("[toggleReviewFeaturedAction] Supabase error:", error);
        return { success: false, message: sanitizeErrorMessage(error.message, "Failed to update featured status.") };
      }
    } else {
      const reviews = LocalDataStore.getReviews();
      const target = reviews.find((r) => r.id === id);
      if (target) {
        target.is_featured = isFeatured;
        LocalDataStore.saveReview(target);
      }
    }

    revalidatePath("/");
    revalidatePath("/reviews");
    revalidatePath("/admin/storefront");

    return { success: true, message: "Featured status updated." };
  } catch (err: unknown) {
    return {
      success: false,
      message: sanitizeErrorMessage(err, "Failed to toggle featured status."),
    };
  }
}

/**
 * Server Action: Quick Toggle Active Status
 */
export async function toggleReviewActiveAction(
  id: string,
  isActive: boolean
): Promise<ServerActionResult<void>> {
  try {
    const { authorized } = await verifyAdminSession();
    if (!authorized) {
      return { success: false, message: "Unauthorized" };
    }

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase
        .from("client_reviews")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("[toggleReviewActiveAction] Supabase error:", error);
        return { success: false, message: sanitizeErrorMessage(error.message, "Failed to update visibility status.") };
      }
    } else {
      const reviews = LocalDataStore.getReviews();
      const target = reviews.find((r) => r.id === id);
      if (target) {
        target.is_active = isActive;
        LocalDataStore.saveReview(target);
      }
    }

    revalidatePath("/");
    revalidatePath("/reviews");
    revalidatePath("/admin/storefront");

    return { success: true, message: "Visibility status updated." };
  } catch (err: unknown) {
    return {
      success: false,
      message: sanitizeErrorMessage(err, "Failed to toggle active status."),
    };
  }
}

