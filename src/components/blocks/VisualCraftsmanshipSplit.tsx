import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VisualCraftsmanshipSplitBlockData } from "@/types/blocks";

interface VisualCraftsmanshipSplitProps {
  data?: VisualCraftsmanshipSplitBlockData;
  className?: string;
}

/**
 * VisualCraftsmanshipSplit — React Server Component
 * 
 * "Show, Don't Tell" Craftsmanship Section:
 * - 2-column layout with tactile close-up imagery of materials and mechanisms.
 * - Minimal, evocative captions (Warmth of Wood. Strength of Steel. / Crafted to Last Generations.)
 * - Natural photography without artificial colored overlays.
 */
export function VisualCraftsmanshipSplit({ data, className }: VisualCraftsmanshipSplitProps) {
  if (!data || (!data.left?.imageUrl && !data.right?.imageUrl)) {
    return (
      <section className={cn("w-full py-16 px-4 sm:px-8 max-w-7xl mx-auto bg-[#FAF8F5]", className)}>
        <div className="p-8 rounded-2xl border border-black/10 bg-[#EDE9E1]/50 text-[#71717A] text-center text-xs sm:text-sm font-medium">
          Visual craftsmanship content not yet configured in Admin Studio.
        </div>
      </section>
    );
  }

  const { left, right } = data;

  const visuals = [
    { ...left, key: "left" },
    { ...right, key: "right" },
  ];

  return (
    <section 
      aria-label="Materials and Craftsmanship"
      className={cn("w-full py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto bg-[#FAF8F5]", className)}
    >
      {/* 2-Column Visual Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visuals.map((item) => {
          const hasImage = Boolean(item.imageUrl && item.imageUrl.trim() !== "");

          return (
            <div
              key={item.key}
              className="group relative w-full h-[400px] sm:h-[480px] md:h-[540px] rounded-2xl overflow-hidden bg-[#EDE9E1] shadow-xs"
            >
              {/* Tactile Close-up Material Photography */}
              {hasImage && item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt || item.caption || "Craftsmanship detail"}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#27272A] to-[#18181B]" />
              )}

              {/* Subtle Natural Vignette for Text Legibility */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" 
                aria-hidden="true" 
              />

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 z-10 flex items-end justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.25em] text-white/75 font-semibold block mb-1.5">
                    Material & Detail
                  </span>
                  <p className="text-xl sm:text-2xl md:text-3xl font-light text-white tracking-tight leading-snug max-w-md">
                    {item.caption}
                  </p>
                </div>

                {item.href && (
                  <Link
                    href={item.href}
                    className="w-10 h-10 rounded-full bg-white/90 text-[#18181B] flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 shrink-0 ml-4"
                    aria-label={`Learn more about ${item.caption}`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
