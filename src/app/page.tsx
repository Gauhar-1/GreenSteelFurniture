import type { Metadata } from "next";
import { PageRenderer } from "@/components/PageRenderer";
import { StorefrontService } from "@/services/StorefrontService";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Green Steel Furniture — Modern Showroom Collection",
  description:
    "Architectural steel furniture designed for refined contemporary interiors. Natural finishes, seamless craftsmanship, and timeless spaces.",
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
  const blocks = await StorefrontService.getLandingPageBlocks();

  return (
    <main className="min-h-screen w-full bg-[#FAF8F5] text-[#18181B]">
      <PageRenderer blocks={blocks} />
    </main>
  );
}
