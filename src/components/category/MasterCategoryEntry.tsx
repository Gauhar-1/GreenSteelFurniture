import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { InteractiveLinkCard } from "@/components/ui/InteractiveLinkCard";
import { NetworkResilientImage } from "@/components/ui/NetworkResilientImage";
import type { MasterCategory } from "@/types/category";

interface MasterCategoryEntryProps {
  categories: MasterCategory[];
  className?: string;
}

/**
 * MasterCategoryEntry — Viewport-Proportioned Architectural Bento Showroom
 * 
 * - Desktop: 2x2 Architectural Bento Grid fitted inside viewport (`calc(100vh - 5rem)`)
 * - Mobile: Vertical stack where each card is `h-[28dvh]`
 * - Zero Dead-Clicks: Wrapped in InteractiveLinkCard with instant scale & loading feedback
 * - Typographic Hierarchy: Renders title with tagline & item count
 */
export function MasterCategoryEntry({
  categories,
  className,
}: MasterCategoryEntryProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="w-full py-16 text-center text-[#71717A]">
        <p className="text-sm">No furniture collections available yet.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
        className
      )}
    >
      {categories.map((category, idx) => (
        <InteractiveLinkCard
          key={category.slug}
          href={`/categories/${category.slug}`}
          ariaLabel={`Explore ${category.name} Collection`}
          className="group relative w-full h-[260px] sm:h-[300px] lg:h-[340px] rounded-2xl overflow-hidden bg-[#18181B] shadow-sm hover:shadow-xl transition-all duration-300 border border-[#18181B]/10 block"
        >
          {/* Edge-to-edge lifestyle imagery with lazy load & slow network fallback */}
          <NetworkResilientImage
            src={category.lifestyle_image || "/hero-bedroom.png"}
            alt={category.name}
            fill
            priority={idx < 2}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Luxury dark vignette gradient for optimal typographic legibility */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 pointer-events-none transition-opacity duration-300 group-hover:from-black/90"
            aria-hidden="true"
          />

          {/* Top meta strip */}
          <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-white/95 bg-black/40 backdrop-blur-md border border-white/15">
              <span>0{idx + 1}</span>
              <span className="opacity-40">•</span>
              <span>{category.item_count} Designs</span>
            </span>

            {/* Top-Right Arrow Circle */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-white group-hover:text-[#18181B] group-hover:scale-110">
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>

          {/* Bottom Typographic Content */}
          <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-5 sm:left-5 sm:right-5 z-10 flex flex-col gap-1 sm:gap-1.5">
            {/* Title */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif text-white tracking-tight leading-tight">
                {category.name}
              </h2>
            </div>

            {/* Subtitle / Tagline */}
            <p className="text-[11px] sm:text-xs text-white/80 line-clamp-1 max-w-md font-light leading-snug">
              {category.tagline}
            </p>

            {/* Sub-departments Hint */}
            {category.sub_categories && category.sub_categories.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 pt-0.5 text-[10px] font-medium text-white/65">
                <span className="truncate">
                  {category.sub_categories
                    .filter((sc) => sc.id !== "all")
                    .map((sc) => sc.label)
                    .slice(0, 3)
                    .join("  •  ")}
                </span>
              </div>
            )}
          </div>
        </InteractiveLinkCard>
      ))}
    </div>
  );
}
