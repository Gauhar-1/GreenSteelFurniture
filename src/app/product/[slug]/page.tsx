import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProductService } from "@/services/ProductService";

export const dynamic = "force-dynamic";

interface ProductSlugPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
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
  searchParams,
}: ProductSlugPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  // Direct fetch from Supabase Service Layer
  const product = await ProductService.getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const categorySlug = product.category?.slug || "bedroom";
  const paramsObj = new URLSearchParams();
  for (const [key, val] of Object.entries(resolvedSearchParams)) {
    if (typeof val === "string") paramsObj.set(key, val);
    else if (Array.isArray(val) && val[0]) paramsObj.set(key, val[0]);
  }
  const qs = paramsObj.toString();
  redirect(`/categories/${categorySlug}/product/${product.slug}${qs ? `?${qs}` : ""}`);
}
