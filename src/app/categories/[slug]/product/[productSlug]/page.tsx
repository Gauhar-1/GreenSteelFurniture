import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/pdp/ProductDetailView";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";

export const dynamic = "force-dynamic";

interface HierarchicalProductPageProps {
  params: Promise<{
    slug: string; // category slug, e.g. "bedroom"
    productSlug: string; // product slug, e.g. "the-vault-3-door-almirah"
  }>;
}

export async function generateMetadata({
  params,
}: HierarchicalProductPageProps): Promise<Metadata> {
  const { slug: categorySlug, productSlug } = await params;

  const dbProduct = await ProductService.getProductBySlug(productSlug);
  if (!dbProduct) {
    return {
      title: "Product Not Found | Green Steel Furniture",
    };
  }

  const categoryName = dbProduct.category?.name_en || "Architectural Steel";

  return {
    title: `${dbProduct.title_en} | ${categoryName} | Green Steel Furniture`,
    description: dbProduct.tagline,
  };
}

/**
 * Hierarchical Category-First Product Detail Page (RSC)
 * 
 * Route: /categories/[slug]/product/[productSlug]
 * Viewport-Locked Luxury Showroom Configurator:
 * - Desktop: 12-column grid locked to `calc(100vh - 4.5rem)`
 * - Left 7: locked visual stage with 5-pill mode switcher
 * - Right 5: scrollable luxury spec & configuration panel
 * - Mobile: 48dvh top stage + bottom scroll sheet
 * - 100% live Supabase data binding
 */
export default async function HierarchicalProductPage({
  params,
}: HierarchicalProductPageProps) {
  const { slug: categorySlug, productSlug } = await params;

  // 1. Fetch real Supabase product and category
  const dbProduct = await ProductService.getProductBySlug(productSlug);
  if (!dbProduct) {
    notFound();
  }

  const allCategories = await CategoryService.getAllCategories();
  const dbCategory = allCategories.find((c) => c.slug === categorySlug);
  const subCategory = dbProduct.sub_category_id
    ? allCategories.find((c) => c.id === dbProduct.sub_category_id)
    : null;

  return (
    <ProductDetailView
      product={dbProduct}
      categorySlug={categorySlug}
      categoryName={dbCategory?.name_en || dbProduct.category?.name_en}
      subCategoryName={subCategory?.name_en}
    />
  );
}
