import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/pdp/ProductDetailView";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";

export const revalidate = 3600;

interface HierarchicalProductPageProps {
  params: Promise<{
    slug: string; // category slug, e.g. "bedroom"
    productSlug: string; // product slug, e.g. "the-vault-3-door-almirah"
  }>;
  searchParams?: Promise<{
    finish?: string;
    size?: string;
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
    alternates: {
      canonical: `/categories/${categorySlug}/product/${productSlug}`,
    },
    openGraph: {
      title: `${dbProduct.title_en} — Green Steel Furniture`,
      description: dbProduct.tagline,
      type: "website",
      siteName: "Green Steel Furniture",
      images: [
        {
          url: "/og-banner.png",
          width: 1200,
          height: 630,
          alt: "Green Steel Furniture",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dbProduct.title_en} — Green Steel Furniture`,
      description: dbProduct.tagline,
      images: ["/og-banner.png"],
    },
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
  searchParams,
}: HierarchicalProductPageProps) {
  const { slug: categorySlug, productSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

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

  // JSON-LD Product Schema for Google Search Rich Results
  const defaultFinish =
    dbProduct.finishes.find((f) => f.is_default) || dbProduct.finishes[0];
  const rawImage =
    defaultFinish?.media?.lifestyle ||
    defaultFinish?.media?.front ||
    "/og-banner.png";

  const prices = dbProduct.sizes
    .map((s) => Number(s.price))
    .filter((p) => !isNaN(p) && p > 0);
  const lowPrice = prices.length > 0 ? Math.min(...prices) : dbProduct.base_price;
  const highPrice = prices.length > 0 ? Math.max(...prices) : dbProduct.base_price;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: dbProduct.title_en,
    description: dbProduct.tagline,
    image: rawImage,
    brand: {
      "@type": "Brand",
      name: "Green Steel Furniture",
    },
    sku: dbProduct.slug,
    category: dbCategory?.name_en || dbProduct.category?.name_en || "Steel Furniture",
    offers: {
      "@type": prices.length > 1 ? "AggregateOffer" : "Offer",
      priceCurrency: "INR",
      ...(prices.length > 1
        ? {
            lowPrice,
            highPrice,
            offerCount: dbProduct.sizes.length,
          }
        : {
            price: lowPrice,
          }),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Green Steel Furniture",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetailView
        product={dbProduct}
        categorySlug={categorySlug}
        categoryName={dbCategory?.name_en || dbProduct.category?.name_en}
        subCategoryName={subCategory?.name_en}
        initialFinishId={resolvedSearchParams.finish}
        initialSizeId={resolvedSearchParams.size}
      />
    </>
  );
}
