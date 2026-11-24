import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { CategoryPlpClient } from "@/components/category/CategoryPlpClient";
import { CatalogGridSkeleton } from "@/components/catalog/CatalogGridSkeleton";
import { CategoryService } from "@/services/CategoryService";
import { ProductService } from "@/services/ProductService";

export const revalidate = 3600;

interface CategorySlugPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    sub?: string;
    subcategory?: string;
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
    alternates: {
      canonical: `/categories/${slug}`,
    },
    openGraph: {
      title: `${category.name} | Green Steel Furniture`,
      description: category.tagline,
      images: [
        {
          url: "/og-banner.jpg",
          width: 1200,
          height: 630,
          alt: "Green Steel Furniture",
          type: "image/jpeg",
        },
        {
          url: "/og-banner.png",
          width: 1080,
          height: 609,
          alt: "Green Steel Furniture",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og-banner.jpg"],
    },
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
  searchParams,
}: CategorySlugPageProps) {
  const { slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const requestedSub = sParams?.sub || sParams?.subcategory || "all";

  let category = await CategoryService.getMasterCategoryBySlug(slug);

  if (!category) {
    // Check if the slug belongs directly to a child category (has parent_id)
    const allCategories = await CategoryService.getAllCategories();
    const childCat = allCategories.find((c) => c.slug === slug);
    if (childCat && childCat.parent_id) {
      const parentCat = allCategories.find((c) => c.id === childCat.parent_id);
      if (parentCat) {
        redirect(`/categories/${parentCat.slug}?sub=${childCat.slug}`);
      }
    }
    notFound();
  }

  const categoryProducts = await ProductService.getProductsByCategorySlug(slug);

  return (
    <Suspense fallback={<CatalogGridSkeleton count={8} />}>
      <CategoryPlpClient
        key={`${slug}-${requestedSub}`}
        category={category}
        products={categoryProducts}
        initialSubCategory={requestedSub}
      />
    </Suspense>
  );
}
