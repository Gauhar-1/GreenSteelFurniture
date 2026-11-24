import type { Metadata } from "next";
import { MasterCategoryEntry } from "@/components/category/MasterCategoryEntry";
import { CategoryService } from "@/services/CategoryService";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Collections & Departments | Green Steel Furniture",
  description:
    "Explore pure steel furniture collections: Bedroom, Living, Dining, and Workspace. 100% rust-proof, precision powder-coated architectural steel.",
  alternates: {
    canonical: "/categories",
  },
  openGraph: {
    title: "Collections & Departments | Green Steel Furniture",
    description:
      "Explore pure steel furniture collections: Bedroom, Living, Dining, and Workspace. 100% rust-proof, precision powder-coated architectural steel.",
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
 * Master Category Entry Page (RSC)
 * 
 * Route: /categories
 * Viewport-Locked Editorial Grid:
 * - Desktop: 2x2 Bento fitting within `calc(100vh - 5rem)`
 * - Mobile: 28dvh vertical stack with zero dead-clicks
 */
export default async function CategoriesPage() {
  const categories = await CategoryService.getAllMasterCategories();

  return (
    <div className="w-full min-h-screen flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24">
      {/* Compact Atmospheric Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 mb-6 border-b border-[#18181B]/10 shrink-0">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#9A3412]">
            Departments & Spaces
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#18181B] tracking-tight leading-tight">
            The Architectural Collections
          </h1>
        </div>
        <p className="text-xs text-[#71717A] max-w-sm hidden sm:block text-right">
          100% Rust-Proof CRCA Steel • Lifetime Structural Integrity
        </p>
      </header>

      {/* Responsive Architectural Showroom Grid */}
      <main className="w-full flex-1">
        <MasterCategoryEntry categories={categories} />
      </main>
    </div>
  );
}
