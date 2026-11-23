import type { Metadata } from "next";
import { PageRenderer } from "@/components/PageRenderer";
import { StorefrontService } from "@/services/StorefrontService";
import { SiteSettingsService } from "@/services/SiteSettingsService";
import { getSiteUrl } from "@/lib/siteUrl";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Green Steel Furniture — Modern Showroom Collection",
  description:
    "Architectural steel furniture designed for refined contemporary interiors. Natural finishes, seamless craftsmanship, and timeless spaces.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Green Steel Furniture — Pure Steel. Perfected for Home.",
    description:
      "Architectural steel furniture designed for refined contemporary interiors. Natural finishes, seamless craftsmanship, and timeless spaces.",
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
    images: ["/og-banner.png"],
  },
};

/**
 * Editorial Showroom Landing Page (Server Component)
 * Fully wired to live Supabase categories, products, and dynamic sections
 */
export default async function HomePage() {
  const [blocks, settings] = await Promise.all([
    StorefrontService.getLandingPageBlocks(),
    SiteSettingsService.getSiteSettings(),
  ]);

  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    name: settings.brand_name || "Green Steel Furniture",
    url: siteUrl,
    image: `${siteUrl}/og-banner.png`,
    telephone: settings.phone_primary,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.showroom_address,
      addressLocality: "Gorakhpur",
      addressRegion: "Uttar Pradesh",
      postalCode: "273001",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "26.7606",
      longitude: "83.3732",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:30",
        closes: "20:00",
      },
    ],
    priceRange: "₹₹₹",
    areaServed: (settings.service_districts || []).map((district) => ({
      "@type": "City",
      name: district,
    })),
  };

  return (
    <main className="min-h-screen w-full bg-[#FAF8F5] text-[#18181B]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <PageRenderer blocks={blocks} />
    </main>
  );
}
