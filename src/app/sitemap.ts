import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";
import { CategoryService } from "@/services/CategoryService";
import { ProductService } from "@/services/ProductService";

export const revalidate = 3600; // Revalidate sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  // Baseline static storefront routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/reviews`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  try {
    const [categories, products] = await Promise.all([
      CategoryService.getParentCategories(),
      ProductService.getProducts(),
    ]);

    // Active master category routes (/categories/[slug])
    const categoryRoutes: MetadataRoute.Sitemap = categories
      .filter((cat) => cat.is_active !== false && Boolean(cat.slug))
      .map((cat) => ({
        url: `${siteUrl}/categories/${cat.slug}`,
        lastModified: cat.created_at ? new Date(cat.created_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      }));

    // Active product routes (/categories/[categorySlug]/product/[productSlug])
    const productRoutes: MetadataRoute.Sitemap = products
      .filter((prod) => prod.is_active !== false && Boolean(prod.slug))
      .map((prod) => {
        const catSlug = prod.category?.slug || "bedroom";
        return {
          url: `${siteUrl}/categories/${catSlug}/product/${prod.slug}`,
          lastModified: prod.created_at ? new Date(prod.created_at) : now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        };
      });

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (err) {
    console.error("[sitemap.ts] Transient error querying dynamic entries, falling back to static routes:", err);
    return staticRoutes;
  }
}

