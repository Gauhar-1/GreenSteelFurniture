import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AsymmetricSpacesBentoBlockData, BentoSpaceCard } from "@/types/blocks";

interface AsymmetricSpacesBentoProps {
  data: AsymmetricSpacesBentoBlockData;
  className?: string;
}

function getGridSpanClasses(gridSpan: BentoSpaceCard["gridSpan"]) {
  switch (gridSpan) {
    case "master_bedroom":
      return "md:col-span-7 md:row-span-2 min-h-[380px] md:min-h-[600px]";
    case "living_hall":
      return "md:col-span-5 min-h-[260px] md:min-h-[290px]";
    case "dining_space":
      return "md:col-span-5 min-h-[260px] md:min-h-[290px]";
    case "study_office":
      return "md:col-span-6 min-h-[260px] md:min-h-[320px]";
    case "storage_almirah":
      return "md:col-span-6 min-h-[260px] md:min-h-[320px]";
    default:
      return "md:col-span-6 min-h-[260px]";
  }
}

/**
 * AsymmetricSpacesBento — React Server Component
 * 
 * Architectural "Shop by Space" Bento Grid:
 * - Zero clutter: no pill badges, no footers below the photo.
 * - 100% full-bleed image cards with smooth zoom on hover.
 * - Text overlay positioned in bottom-left inside the photo.
 */
export function AsymmetricSpacesBento({ data, className }: AsymmetricSpacesBentoProps) {
  const { title, cards = [] } = data;

  if (!cards || cards.length === 0) {
    return (
      <section className={cn("w-full py-16 px-4 sm:px-8 max-w-7xl mx-auto bg-[#FAF8F5]", className)}>
        <div className="p-8 rounded-2xl border border-black/10 bg-[#EDE9E1]/50 text-[#71717A] text-center text-xs sm:text-sm font-medium">
          Space collection cards not yet configured in Admin Studio.
        </div>
      </section>
    );
  }

  return (
    <section 
      id="spaces"
      aria-label="Shop by Space"
      className={cn("w-full py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto bg-[#FAF8F5] scroll-mt-20", className)}
    >
      {/* Clean Minimal Section Heading (No sub-paragraphs, no factory tags) */}
      <div className="mb-8 sm:mb-12 text-left">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#18181B] tracking-tight">
          {title || "Designed for Every Space"}
        </h2>
      </div>

      {/* Architectural Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
        {cards.map((card) => {
          const spanClass = getGridSpanClasses(card.gridSpan);
          const hasImage = Boolean(card.imageUrl && card.imageUrl.trim() !== "");

          return (
            <Link
              key={card.id}
              href={card.href || "/categories"}
              className={cn(
                "group relative w-full overflow-hidden rounded-2xl bg-[#EDE9E1] shadow-xs active:scale-[0.99] transition-all duration-300 block",
                spanClass
              )}
            >
              {/* Natural High-Res Photography with Smooth Scale on Hover */}
              {hasImage ? (
                <Image
                  src={card.imageUrl}
                  alt={card.imageAlt || card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#27272A] to-[#18181B]" />
              )}

              {/* Subtle Dark Vignette in Bottom Half for Crisp Legibility */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" 
                aria-hidden="true" 
              />

              {/* Bottom-Left Minimal Typography */}
              <div className="absolute bottom-6 left-6 z-10 text-left pr-6 transition-transform duration-300 group-hover:-translate-y-1">
                <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight leading-snug">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 font-normal mt-1 tracking-wide">
                  {card.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
