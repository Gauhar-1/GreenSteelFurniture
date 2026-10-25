import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryGridBlockData, CategoryCard } from "@/types/blocks";

interface CategoryGridBlockProps {
  data: CategoryGridBlockData;
  className?: string;
}

/**
 * Individual Category Card
 * - Soft contrasting warm ivory background (bg-[#F3EFE6], never pure white)
 * - Mandatory "Pill" overlapping the image displaying design count (e.g. "120+ Designs")
 * - 44x44px min touch target
 */
function CategoryCardItem({ category }: { category: CategoryCard }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#F3EFE6] border border-[#E7E0D2] shadow-sm hover:shadow-md hover:border-[#D97706]/40 transition-all duration-200 active:scale-[0.98] min-h-[44px]"
      aria-label={`${category.title} - ${category.designCount}`}
    >
      {/* Image Container with Aspect Ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E9E3D5]">
        <Image
          src={category.imageUrl}
          alt={category.imageAlt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Subtle Dark Gradient at bottom of image for contrast */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" 
          aria-hidden="true" 
        />

        {/* CRUCIAL UX ELEMENT: Rounded Pill Overlapping the Image Proving Scale */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white bg-[#1E3A8A] shadow-md shadow-[#1E3A8A]/30 border border-white/20 tracking-wide">
            {category.designCount}
          </span>
        </div>
      </div>

      {/* Card Content Footer */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#1E3A8A] group-hover:text-[#D97706] transition-colors leading-snug line-clamp-1">
            {category.title}
          </h3>
          {category.startingPrice && (
            <p className="mt-1 text-xs text-[#1E3A8A]/75 font-medium">
              Starts <span className="font-semibold text-[#D97706]">{category.startingPrice}</span>
            </p>
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#E7E0D2]/60 flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-[#1E3A8A] group-hover:text-[#D97706] transition-colors">
            Explore Models
          </span>
          <div className="w-6 h-6 rounded-full bg-[#E5DFD1] group-hover:bg-[#D97706] group-hover:text-white text-[#1E3A8A] flex items-center justify-center transition-colors">
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * CategoryGridBlock — Mobile-First React Server Component
 * 
 * Layout:
 * - 2-column grid on mobile (grid-cols-2)
 * - 3-column grid on tablets (md:grid-cols-3)
 * - 4-column grid on desktop (lg:grid-cols-4)
 */
export function CategoryGridBlock({ data, className }: CategoryGridBlockProps) {
  const { title, subtitle, categories } = data;

  return (
    <section 
      aria-labelledby="categories-heading"
      className={cn("w-full py-8 sm:py-12 px-4 sm:px-6 max-w-6xl mx-auto bg-[#FAF9F6]", className)}
    >
      {/* Section Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-block px-2.5 py-1 mb-2 rounded-md bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs font-semibold tracking-wider uppercase">
            Browse By Space
          </div>
          <h2 
            id="categories-heading" 
            className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] tracking-tight"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1.5 text-sm sm:text-base text-[#1E3A8A]/75 max-w-xl">
              {subtitle}
            </p>
          )}
        </div>

        <span className="text-xs font-medium text-[#1E3A8A]/70 hidden sm:inline-block">
          Direct Factory Rates Across Tier-3 India
        </span>
      </div>

      {/* 2-Column Mobile Grid, Scaling to 3-4 on Desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {categories.map((category) => (
          <CategoryCardItem key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
