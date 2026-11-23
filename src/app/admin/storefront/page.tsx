import React from "react";
import { Metadata } from "next";
import { StorefrontVisualEditor } from "@/components/admin/StorefrontVisualEditor";
import { CategoryService } from "@/services/CategoryService";
import { ProductService } from "@/services/ProductService";
import { ReviewService } from "@/services/ReviewService";
import { CANONICAL_SECTION_ORDER } from "@/services/StorefrontService";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { LocalDataStore } from "@/services/LocalDataStore";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Storefront Controller | Admin Studio",
  description:
    "Visual controller for Hero Hotspots, Complete the Look Room Switcher, Bento Spaces, Wall Matcher, and Craftsmanship Split.",
};

export default async function AdminStorefrontPage() {
  const [categories, products, reviews] = await Promise.all([
    CategoryService.getAllCategories(),
    ProductService.getProducts(),
    ReviewService.getAllAdminReviews(),
  ]);

  let initialSections: any[] = [];

  try {
    if (CategoryService.isConfigured()) {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("storefront_sections")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data) {
        initialSections = data.sort((a, b) => {
          const defaultA = CANONICAL_SECTION_ORDER[a.section_key] ?? 99;
          const defaultB = CANONICAL_SECTION_ORDER[b.section_key] ?? 99;
          const orderA = typeof a.display_order === "number" ? a.display_order : ((a.content?.display_order as number) ?? defaultA);
          const orderB = typeof b.display_order === "number" ? b.display_order : ((b.content?.display_order as number) ?? defaultB);
          if (orderA !== orderB) return orderA - orderB;
          return defaultA - defaultB;
        });
      }
    } else {
      initialSections = LocalDataStore.getAllStorefrontSections();
    }
  } catch (err) {
    console.error("AdminStorefrontPage: Failed loading storefront sections:", err);
  }

  return (
    <div className="space-y-6">
      <StorefrontVisualEditor
        categories={categories}
        products={products}
        initialSections={initialSections}
        initialReviews={reviews}
      />
    </div>
  );
}
