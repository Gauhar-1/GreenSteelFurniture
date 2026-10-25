import { getSupabaseServerClient } from "@/lib/supabase/server";
import { type Category } from "@/types/database";
import { type MasterCategory, type SubCategory } from "@/types/category";
import { LocalDataStore } from "@/services/LocalDataStore";

export interface CategoryWithChildren extends Category {
  children?: Category[];
}

export class CategoryService {
  /**
   * Check if live Supabase is configured
   */
  public static isConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes("placeholder-project"));
  }

  /**
   * Fetch all active categories from Supabase (or LocalDataStore if unconfigured)
   */
  public static async getAllCategories(): Promise<Category[]> {
    try {
      if (!this.isConfigured()) {
        return LocalDataStore.getCategories();
      }

      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Supabase query error in CategoryService.getAllCategories:", error.message);
        return [];
      }

      return (data as Category[]) || [];
    } catch (err) {
      console.error("Exception fetching categories:", err);
      return [];
    }
  }

  /**
   * Fetch master parent categories (where parent_id is null or empty)
   */
  public static async getParentCategories(): Promise<Category[]> {
    try {
      const all = await this.getAllCategories();
      return all.filter((c) => !c.parent_id);
    } catch (err) {
      console.error("Exception fetching parent categories:", err);
      return [];
    }
  }

  /**
   * Fetch hierarchical category tree (Parent Departments -> Subcategories)
   */
  public static async getCategoryHierarchy(): Promise<CategoryWithChildren[]> {
    const all = await this.getAllCategories();
    if (!all || all.length === 0) return [];

    const parents = all.filter((c) => !c.parent_id);
    const children = all.filter((c) => Boolean(c.parent_id));

    return parents.map((parent) => ({
      ...parent,
      children: children.filter(
        (child) => Boolean(parent.id) && child.parent_id === parent.id
      ),
    }));
  }

  /**
   * Fetch single category by ID
   */
  public static async getCategoryById(id: string): Promise<Category | null> {
    try {
      if (!this.isConfigured()) {
        return LocalDataStore.getCategories().find((c) => c.id === id) || null;
      }

      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        return null;
      }
      return data as Category;
    } catch {
      return null;
    }
  }

  /**
   * Fetch single MasterCategory by slug with mapped subcategories and live product count
   */
  public static async getMasterCategoryBySlug(slug: string): Promise<MasterCategory | null> {
    try {
      const allCategories = await this.getAllCategories();
      const parent = allCategories.find((c) => c.slug === slug);
      if (!parent) return null;

      const subCategories: SubCategory[] = allCategories
        .filter((c) => Boolean(parent.id) && c.parent_id === parent.id)
        .map((s) => ({
          id: s.id || s.slug,
          label: s.name_en,
        }));

      const { ProductService } = await import("@/services/ProductService");
      const products = await ProductService.getProductsByCategorySlug(slug);

      return {
        slug: parent.slug,
        name: parent.name_en,
        name_hi: parent.name_hi,
        tagline: parent.subtitle || "Architectural pure steel furniture engineered for modern Indian living.",
        lifestyle_image: parent.cover_image || "/hero-bedroom.png",
        item_count: products.length,
        sub_categories:
          subCategories.length > 0
            ? [{ id: "all", label: `All ${parent.name_en}` }, ...subCategories]
            : [{ id: "all", label: `All ${parent.name_en}` }],
      };
    } catch (err) {
      console.error("Error in getMasterCategoryBySlug:", err);
      return null;
    }
  }

  /**
   * Fetch all parent categories formatted as MasterCategory for /categories
   */
  public static async getAllMasterCategories(): Promise<MasterCategory[]> {
    try {
      const parents = await this.getParentCategories();
      const allCategories = await this.getAllCategories();
      const { ProductService } = await import("@/services/ProductService");
      const allProducts = await ProductService.getProducts();

      return parents.map((parent) => {
        const subCategories: SubCategory[] = allCategories
          .filter((c) => Boolean(parent.id) && c.parent_id === parent.id)
          .map((s) => ({
            id: s.id || s.slug,
            label: s.name_en,
          }));

        const productCount = allProducts.filter(
          (p) => p.category?.slug === parent.slug
        ).length;

        return {
          slug: parent.slug,
          name: parent.name_en,
          name_hi: parent.name_hi,
          tagline: parent.subtitle || "Precision engineered pure steel furniture.",
          lifestyle_image: parent.cover_image || "/hero-bedroom.png",
          item_count: productCount,
          sub_categories:
            subCategories.length > 0
              ? [{ id: "all", label: `All ${parent.name_en}` }, ...subCategories]
              : [{ id: "all", label: `All ${parent.name_en}` }],
        };
      });
    } catch (err) {
      console.error("Error in getAllMasterCategories:", err);
      return [];
    }
  }
}
