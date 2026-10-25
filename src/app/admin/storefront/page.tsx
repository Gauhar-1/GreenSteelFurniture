import React from "react";
import { Metadata } from "next";
import { StorefrontVisualEditor } from "@/components/admin/StorefrontVisualEditor";
import { CategoryService } from "@/services/CategoryService";
import { ProductService } from "@/services/ProductService";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { LocalDataStore } from "@/services/LocalDataStore";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Storefront Controller | Admin Studio",
  description:
    "Visual controller for Hero Hotspots, Complete the Look Room Switcher, Bento Spaces, Wall Matcher, and Craftsmanship Split.",
};

export default async function AdminStorefrontPage() {
  const [categories, products] = await Promise.all([
    CategoryService.getAllCategories(),
    ProductService.getProducts(),
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
          const orderA = (a.content?.display_order as number) ?? a.display_order ?? 0;
          const orderB = (b.content?.display_order as number) ?? b.display_order ?? 0;
          return orderA - orderB;
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
      />
    </div>
  );
}
