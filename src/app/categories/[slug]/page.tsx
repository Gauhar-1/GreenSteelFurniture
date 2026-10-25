import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryPlpClient } from "@/components/category/CategoryPlpClient";
import { CatalogGridSkeleton } from "@/components/catalog/CatalogGridSkeleton";
import { CategoryService } from "@/services/CategoryService";
import { ProductService } from "@/services/ProductService";

export const dynamic = "force-dynamic";

interface CategorySlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategorySlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await CategoryService.getMasterCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Collection | Green Steel Furniture",
    };
  }

  return {
    title: `${category.name} | Green Steel Furniture`,
    description: category.tagline,
  };
}

/**
 * Category Specific PLP (RSC)
 * 
 * Route: /categories/[slug] (e.g. /categories/bedroom)
 * Wired to live Supabase database with Suspense skeleton boundary
 */
export default async function CategorySlugPage({
  params,
}: CategorySlugPageProps) {
  const { slug } = await params;
  const category = await CategoryService.getMasterCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = await ProductService.getProductsByCategorySlug(slug);

  return (
    <Suspense fallback={<CatalogGridSkeleton count={6} />}>
      <CategoryPlpClient
        category={category}
        products={categoryProducts}
      />
    </Suspense>
  );
}
