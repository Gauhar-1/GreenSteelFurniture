import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProductService } from "@/services/ProductService";

export const dynamic = "force-dynamic";

interface ProductSlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await ProductService.getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Green Steel Furniture",
    };
  }

  return {
    title: `${product.title_en} | Green Steel Furniture`,
    description: product.tagline,
  };
}

/**
 * Direct Product Slug Route Handler
 * Route: /product/[slug]
 * 
 * Redirects seamlessly to the canonical category-first product route:
 * /categories/[categorySlug]/product/[productSlug]
 */
export default async function DirectProductSlugPage({
  params,
}: ProductSlugPageProps) {
  const { slug } = await params;

  // Direct fetch from Supabase Service Layer
  const product = await ProductService.getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const categorySlug = product.category?.slug || "bedroom";
  redirect(`/categories/${categorySlug}/product/${product.slug}`);
}
