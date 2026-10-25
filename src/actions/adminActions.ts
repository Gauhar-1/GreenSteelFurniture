"use server";

import { revalidatePath } from "next/cache";
import {
  ProductWizardFormSchema,
  type ProductWizardFormData,
  CategorySchema,
  type Category,
  StorefrontSectionSchema,
  type StorefrontSection,
  type Booking,
} from "@/types/database";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";
import { LocalDataStore } from "@/services/LocalDataStore";
import { verifyAdminSession } from "@/actions/authActions";

export interface ServerActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string | string[] | undefined>;
}

/**
 * Checks if live Supabase database connection is configured
 */
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes("placeholder-project"));
}

/**
 * Server Action: Save Product with Finishes and Sizes (3-Step Wizard)
 * Inserts or updates master product, product_finishes, and product_sizes.
 */
export async function saveProductWizardAction(
  rawInput: ProductWizardFormData
): Promise<ServerActionResult<{ productId: string; slug: string }>> {
  try {
    // Verify admin session server-side
    const { authorized } = await verifyAdminSession();
    if (!authorized) {
      return {
        success: false,
        message: "Unauthorized: Administrator privileges are required to perform this action.",
      };
    }

    // 1. Boundary validation via Zod
    const validated = ProductWizardFormSchema.parse(rawInput);

    let activeProductId = validated.id;

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();

      if (validated.id) {
        // Execute an explicit UPDATE on the existing product record
        const { data: updatedProduct, error: updateError } = await supabase
          .from("products")
          .update({
            category_id: validated.category_id,
            sub_category_id: validated.sub_category_id || null,
            title_en: validated.title_en,
            title_hi: validated.title_hi,
            slug: validated.slug,
            tagline: validated.tagline,
            base_price: validated.base_price,
            highlights: validated.highlights,
            is_featured: validated.is_featured,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", validated.id)
          .select("id")
          .single();

        if (updateError) {
          throw new Error(`Product database update failed: ${updateError.message}`);
        }
        activeProductId = updatedProduct.id;
      } else {
        // Execute an explicit INSERT for a new product blueprint
        const { data: insertedProduct, error: insertError } = await supabase
          .from("products")
          .insert({
            category_id: validated.category_id,
            sub_category_id: validated.sub_category_id || null,
            title_en: validated.title_en,
            title_hi: validated.title_hi,
            slug: validated.slug,
            tagline: validated.tagline,
            base_price: validated.base_price,
            highlights: validated.highlights,
            is_featured: validated.is_featured,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (insertError) {
          throw new Error(`Product database insert failed: ${insertError.message}`);
        }
        activeProductId = insertedProduct.id;
      }

      // Clean existing finishes and sizes for idempotency (e.g. if re-publishing under same slug)
      await supabase.from("product_finishes").delete().eq("product_id", activeProductId);
      await supabase.from("product_sizes").delete().eq("product_id", activeProductId);

      // Upsert Finishes
      if (validated.finishes.length > 0) {
        const finishesPayload = validated.finishes.map((f, idx) => ({
          product_id: activeProductId,
          finish_name: f.finish_name,
          hex_code: f.hex_code,
          media: f.media,
          is_default: idx === 0,
        }));

        const { error: finishError } = await supabase
          .from("product_finishes")
          .insert(finishesPayload);

        if (finishError) {
          throw new Error(`Finish database write failed: ${finishError.message}`);
        }
      }

      // Upsert Sizes
      if (validated.sizes.length > 0) {
        const sizesPayload = validated.sizes.map((s, idx) => {
          const resolvedPrice =
            idx === 0 && (s.price <= 0 || validated.sizes.length === 1)
              ? validated.base_price
              : (s.price > 0 ? s.price : validated.base_price);

          return {
            product_id: activeProductId,
            size_label: s.size_label,
            price: resolvedPrice,
            token_amount: s.token_amount || 999,
            dimensions: s.dimensions,
            stock_status: s.stock_status,
            delivery_days: s.delivery_days || 7,
            is_default: idx === 0,
          };
        });

        const { error: sizeError } = await supabase
          .from("product_sizes")
          .insert(sizesPayload);

        if (sizeError) {
          throw new Error(`Size database write failed: ${sizeError.message}`);
        }
      }
    } else {
      const fallbackId = activeProductId || `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      activeProductId = fallbackId;
      LocalDataStore.saveProduct(validated, fallbackId);
    }

    // Instant Next.js Cache Revalidation across customer-facing routes
    revalidatePath("/", "layout");
    revalidatePath("/categories");
    revalidatePath(`/categories/${validated.slug}`);
    revalidatePath(`/categories/[slug]/product/${validated.slug}`, "page");
    revalidatePath("/admin/products");

    const actionVerb = validated.id ? "updated" : "published";

    return {
      success: true,
      message: `Product "${validated.title_en}" ${actionVerb} successfully with ${validated.finishes.length} finish(es) and ${validated.sizes.length} size(s).`,
      data: { productId: activeProductId || "", slug: validated.slug },
    };
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      const zodErr = error as import("zod").ZodError;
      const fieldErrors: Record<string, string[]> = {};
      const bulletPoints: string[] = [];

      for (const issue of zodErr.issues) {
        const fieldKey = issue.path.join(".");
        const label = formatZodIssueLabel(issue.path);
        fieldErrors[fieldKey] = [issue.message];
        bulletPoints.push(`${label}: ${issue.message}`);
      }

      return {
        success: false,
        message:
          bulletPoints.length === 1
            ? bulletPoints[0]
            : `Validation Error: ${bulletPoints.slice(0, 3).join(" • ")}${bulletPoints.length > 3 ? ` (and ${bulletPoints.length - 3} more)` : ""}`,
        errors: fieldErrors,
      };
    }

    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes("products_slug_key") || msg.includes("duplicate key value")) {
        return {
          success: false,
          message:
            "Database Conflict: A product with this URL slug already exists. Please customize the slug or change the title.",
          errors: { slug: ["This URL slug is already taken. Please choose a unique slug."] },
        };
      }
      if (msg.includes("foreign key") && msg.includes("category_id")) {
        return {
          success: false,
          message:
            "Database Error: The selected Room Category was not found. Please re-select a room category.",
          errors: { category_id: ["Selected category does not exist in the database."] },
        };
      }
      if (msg.includes("valid_media_slots")) {
        return {
          success: false,
          message:
            "Database Error: At least one photo is required for each color finish.",
          errors: { finishes: ["At least one photo is required for each color finish."] },
        };
      }
      return {
        success: false,
        message: `Database / Server Error: ${msg}`,
      };
    }

    return {
      success: false,
      message: "An unexpected server error occurred while publishing the furniture blueprint.",
    };
  }
}

/**
 * Maps Zod error paths to human-friendly field names for the admin UI
 */
function formatZodIssueLabel(path: (string | number)[]): string {
  if (path.length === 0) return "General";
  const [first, second, third, fourth] = path;

  if (first === "title_en") return "Showroom Title (EN)";
  if (first === "title_hi") return "Hindi / Hinglish Title";
  if (first === "slug") return "URL Slug";
  if (first === "tagline") return "Editorial Tagline";
  if (first === "base_price") return "Base Catalog Price";
  if (first === "category_id") return "Room Department";
  if (first === "sub_category_id") return "Sub-Category";
  if (first === "blueprint_type") return "Blueprint Engine Spec";
  if (first === "highlights") return "Product Highlights";

  if (first === "finishes" && typeof second === "number") {
    const finishNum = second + 1;
    if (third === "finish_name") return `Finish #${finishNum} Name`;
    if (third === "hex_code") return `Finish #${finishNum} Hex Color`;
    if (third === "media") {
      if (fourth === "lifestyle") return `Finish #${finishNum} Room Lifestyle Photo`;
      if (fourth === "front") return `Finish #${finishNum} Studio Front Photo`;
      if (fourth === "functional") return `Finish #${finishNum} Functional View Photo`;
      if (fourth === "macro") return `Finish #${finishNum} Macro Detail Photo`;
      return `Finish #${finishNum} 4-Photo Blueprint`;
    }
    return `Finish #${finishNum}`;
  }

  if (first === "sizes" && typeof second === "number") {
    const sizeNum = second + 1;
    if (third === "size_label") return `Size #${sizeNum} Label`;
    if (third === "price") return `Size #${sizeNum} Price`;
    if (third === "token_amount") return `Size #${sizeNum} Token Advance`;
    if (third === "dimensions") {
      if (fourth) return `Size #${sizeNum} Dimension (${String(fourth)})`;
      return `Size #${sizeNum} Dimensions`;
    }
    return `Size #${sizeNum}`;
  }

  return path.join(" > ");
}

/**
 * Server Action: Save Storefront Section (Hotspots, Bento, Wall Matcher, Lookbook, Craftsmanship)
 */
export async function saveStorefrontSectionAction(
  sectionKey: string,
  content: Record<string, unknown>,
  title_en = "Editorial Section",
  title_hi = "संपादकीय अनुभाग",
  isActive = true,
  displayOrder = 0
): Promise<ServerActionResult<{ sectionKey: string }>> {
  try {
    const { authorized } = await verifyAdminSession();
    if (!authorized) {
      return {
        success: false,
        message: "Unauthorized: Administrator privileges are required to update storefront sections.",
      };
    }

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.from("storefront_sections").upsert(
        {
          section_key: sectionKey,
          title_en,
          title_hi,
          content: {
            ...content,
            display_order: displayOrder,
          },
          is_active: isActive,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "section_key" }
      );

      if (error) throw new Error(error.message);
    } else {
      LocalDataStore.saveStorefrontSection(sectionKey, {
        content: {
          ...content,
          display_order: displayOrder,
        },
        title_en,
        title_hi,
        is_active: isActive,
      });
    }

    // Instantly invalidate landing page and lookbook cache
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/#spaces");
    revalidatePath("/#design-by-color");
    revalidatePath("/admin/storefront");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Section "${sectionKey}" saved and live cache revalidated.`,
      data: { sectionKey },
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to update storefront section.",
    };
  }
}

/**
 * Server Action: Toggle Storefront Section Active Status
 */
export async function toggleStorefrontSectionActiveAction(
  sectionKey: string,
  isActive: boolean
): Promise<ServerActionResult<{ sectionKey: string; isActive: boolean }>> {
  try {
    const { authorized } = await verifyAdminSession();
    if (!authorized) {
      return {
        success: false,
        message: "Unauthorized: Administrator privileges are required.",
      };
    }

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase
        .from("storefront_sections")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("section_key", sectionKey);

      if (error) throw new Error(error.message);
    } else {
      const existing = LocalDataStore.getStorefrontSection(sectionKey) as any;
      if (existing) {
        LocalDataStore.saveStorefrontSection(sectionKey, {
          ...existing,
          is_active: isActive,
        });
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/storefront");

    return {
      success: true,
      message: `Section visibility updated to ${isActive ? "Active" : "Disabled"}.`,
      data: { sectionKey, isActive },
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to toggle section visibility.",
    };
  }
}

/**
 * Server Action: Reorder Storefront Sections
 */
export async function reorderStorefrontSectionsAction(
  orders: Array<{ sectionKey: string; displayOrder: number }>
): Promise<ServerActionResult<{ count: number }>> {
  try {
    const { authorized } = await verifyAdminSession();
    if (!authorized) {
      return {
        success: false,
        message: "Unauthorized: Administrator privileges are required.",
      };
    }

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      for (const item of orders) {
        const { data: existing } = await supabase
          .from("storefront_sections")
          .select("content")
          .eq("section_key", item.sectionKey)
          .single();

        const currentContent = (existing?.content as Record<string, unknown>) || {};
        await supabase
          .from("storefront_sections")
          .update({
            content: { ...currentContent, display_order: item.displayOrder },
            updated_at: new Date().toISOString(),
          })
          .eq("section_key", item.sectionKey);
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/storefront");

    return {
      success: true,
      message: "Section display order revalidated.",
      data: { count: orders.length },
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to reorder sections.",
    };
  }
}

/**
 * Server Action: Save Category
 */
export async function saveCategoryAction(
  data: Category
): Promise<ServerActionResult<Category>> {
  try {
    const { authorized } = await verifyAdminSession();
    if (!authorized) {
      return {
        success: false,
        message: "Unauthorized: Administrator privileges are required to save categories.",
      };
    }

    const validated = CategorySchema.parse(data);

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.from("categories").upsert({
        ...validated,
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
    } else {
      LocalDataStore.saveCategory(validated);
    }

    revalidatePath("/categories");
    revalidatePath(`/categories/${validated.slug}`);
    revalidatePath("/admin/categories");

    return {
      success: true,
      message: `Category "${validated.name_en}" saved successfully.`,
      data: validated,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save category.",
    };
  }
}

/**
 * Server Action: Delete Category
 */
export async function deleteCategoryAction(
  id: string
): Promise<ServerActionResult<{ id: string }>> {
  try {
    const { authorized } = await verifyAdminSession();
    if (!authorized) {
      return {
        success: false,
        message: "Unauthorized: Administrator privileges are required to delete categories.",
      };
    }

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data: cat } = await supabase
        .from("categories")
        .select("cover_image")
        .eq("id", id)
        .single();

      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw new Error(error.message);

      // Clean up orphaned cover photo from S3 storage
      if (cat?.cover_image) {
        await deleteStorageMediaAction(cat.cover_image);
      }
    } else {
      LocalDataStore.deleteCategory(id);
    }

    revalidatePath("/categories");
    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category deleted successfully.",
      data: { id },
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to delete category.",
    };
  }
}

/**
 * Server Action: Update Booking Status
 */
export async function updateBookingStatusAction(
  id: string,
  status: "pending_token" | "confirmed" | "in_production" | "dispatched" | "delivered" | "cancelled"
): Promise<ServerActionResult<{ id: string; status: string }>> {
  try {
    const { authorized } = await verifyAdminSession();
    if (!authorized) {
      return {
        success: false,
        message: "Unauthorized: Administrator privileges are required to update booking status.",
      };
    }

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase
        .from("bookings")
        .update({ order_status: status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      LocalDataStore.updateBookingStatus(id, status);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/bookings");

    return {
      success: true,
      message: `Order status updated to "${status}".`,
      data: { id, status },
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to update order status.",
    };
  }
}

/**
 * Server Action: Delete an orphaned media file from Supabase Storage by URL
 */
export async function deleteStorageMediaAction(
  url: string,
  bucket = "furniture-media"
): Promise<{ success: boolean; message?: string }> {
  try {
    const { authorized } = await verifyAdminSession();
    if (!authorized) {
      return { success: false, message: "Unauthorized" };
    }

    if (!url || typeof url !== "string") {
      return { success: true };
    }

    // Skip local assets and data URLs
    if (url.startsWith("/") || url.startsWith("data:") || url.startsWith("blob:")) {
      return { success: true };
    }

    const marker = `/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) {
      return { success: true };
    }

    const filePath = decodeURIComponent(url.substring(idx + marker.length).split("?")[0].split("#")[0]);
    if (!filePath) {
      return { success: true };
    }

    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      await supabase.storage.from(bucket).remove([filePath]);
    }

    return { success: true };
  } catch (err) {
    console.warn("[deleteStorageMediaAction] Warning removing media:", err);
    return { success: true };
  }
}

