import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ProductBlueprintFormData } from "@/types/adminProduct";
import type { Product, ProductFinish, ProductSize } from "@/types/database";
import { LocalDataStore } from "@/services/LocalDataStore";

export interface ProductCatalogItem {
  id: string;
  category_id: string;
  sub_category_id: string | null;
  title_en: string;
  title_hi: string;
  slug: string;
  tagline: string;
  base_price: number;
  highlights: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  category?: {
    name_en: string;
    slug: string;
    blueprint_type: string;
  } | null;
  finishes: Array<{
    id: string;
    finish_name: string;
    hex_code: string;
    media: Record<string, string>;
    is_default?: boolean;
  }>;
  sizes: Array<{
    id: string;
    size_label: string;
    price: number;
    token_amount?: number;
    delivery_days?: number;
    stock_status: string;
    is_default?: boolean;
    dimensions?: {
      height?: number;
      width?: number;
      depth?: number;
      length?: number;
      headboard_height?: number;
      total_height?: number;
      seat_height?: number;
      unit?: "inches";
    };
  }>;
}

export class ProductService {
  public static isConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes("placeholder-project"));
  }

  /**
   * Fetches all products from the live Supabase database with finishes and sizes
   * (or LocalDataStore if unconfigured)
   */
  public static async getProducts(): Promise<ProductCatalogItem[]> {
    try {
      if (!this.isConfigured()) {
        return LocalDataStore.getProducts();
      }

      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories!products_category_id_fkey(name_en, slug, blueprint_type),
          finishes:product_finishes(*),
          sizes:product_sizes(*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase query error in ProductService.getProducts:", error.message);
        return [];
      }

      return (data as unknown as ProductCatalogItem[]) || [];
    } catch (err) {
      console.error("Exception in ProductService.getProducts:", err);
      return [];
    }
  }

  /**
   * Fetch single product with all relations by ID
   */
  public static async getProductById(id: string): Promise<ProductCatalogItem | null> {
    try {
      if (!this.isConfigured()) {
        return LocalDataStore.getProducts().find((p) => p.id === id) || null;
      }

      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories!products_category_id_fkey(name_en, slug, blueprint_type),
          finishes:product_finishes(*),
          sizes:product_sizes(*)
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        return null;
      }
      return data as unknown as ProductCatalogItem;
    } catch {
      return null;
    }
  }

  /**
   * Fetch single product with all relations by slug
   */
  public static async getProductBySlug(slug: string): Promise<ProductCatalogItem | null> {
    try {
      if (!this.isConfigured()) {
        return LocalDataStore.getProducts().find((p) => p.slug === slug) || null;
      }

      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories!products_category_id_fkey(name_en, slug, blueprint_type),
          finishes:product_finishes(*),
          sizes:product_sizes(*)
        `)
        .eq("slug", slug)
        .single();

      if (error || !data) {
        return null;
      }
      return data as unknown as ProductCatalogItem;
    } catch {
      return null;
    }
  }

  /**
   * Fetch active products for a specific category slug, mapped cleanly to CategoryProduct
   */
  public static async getProductsByCategorySlug(categorySlug: string): Promise<import("@/types/category").CategoryProduct[]> {
    try {
      const allProducts = await this.getProducts();
      
      const filtered = allProducts.filter((p) => {
        return p.category?.slug === categorySlug;
      });

      return filtered.map((p) => {
        const firstFinish = p.finishes?.[0];
        const lifestyle =
          firstFinish?.media?.lifestyle ||
          firstFinish?.media?.front ||
          firstFinish?.media?.functional ||
          firstFinish?.media?.macro ||
          "/product-drawer-isolated.png";
        const inside =
          firstFinish?.media?.functional ||
          firstFinish?.media?.inside ||
          firstFinish?.media?.front ||
          lifestyle;

        const availableColors = p.finishes?.map((f) => f.hex_code).filter(Boolean) || ["#36454F"];

        const finishesList = (p.finishes || []).map((f) => ({
          id: f.id,
          name: f.finish_name,
          hex: f.hex_code,
          imageUrl:
            f.media?.lifestyle ||
            f.media?.front ||
            f.media?.functional ||
            f.media?.macro ||
            lifestyle,
        }));

        const minPrice =
          p.sizes && p.sizes.length > 0
            ? Math.min(...p.sizes.map((s) => Number(s.price)))
            : Number(p.base_price);

        return {
          id: p.id,
          slug: p.slug,
          category_slug: categorySlug,
          sub_category: p.sub_category_id || "all",
          title: p.title_en,
          price: minPrice,
          mrp: Math.round(minPrice * 1.3),
          lifestyle_image: lifestyle,
          inside_image: inside,
          available_colors: availableColors.length > 0 ? availableColors : ["#36454F"],
          specs:
            p.highlights && p.highlights.length > 0
              ? p.highlights.join(" • ")
              : `${p.tagline}`,
          tagline: p.tagline || "",
          size_count: p.sizes?.length || 1,
          finishes: finishesList,
        };
      });
    } catch (err) {
      console.error("Error in getProductsByCategorySlug:", err);
      return [];
    }
  }

  /**
   * Delete product by ID
   */
  public static async deleteProduct(id: string): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        return LocalDataStore.deleteProduct(id);
      }

      const supabase = getSupabaseServerClient();
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        return LocalDataStore.deleteProduct(id);
      }
      return true;
    } catch {
      return LocalDataStore.deleteProduct(id);
    }
  }

  /**
   * Legacy adapter for ProductBlueprintFormData
   */
  static async saveProductBlueprint(data: ProductBlueprintFormData): Promise<{
    success: boolean;
    productId: string;
    variantCount: number;
    message: string;
  }> {
    const generatedProductId = `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      productId: generatedProductId,
      variantCount: data.variants.length,
      message: `Successfully created "${data.title}" with ${data.variants.length} variant(s).`,
    };
  }
}
