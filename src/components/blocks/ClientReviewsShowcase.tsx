import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, Sparkles, Building, Home, CheckCircle2 } from "lucide-react";
import { ReviewService } from "@/services/ReviewService";
import type { ClientReviewsShowcaseBlockData } from "@/types/blocks";
import { cn } from "@/lib/utils";

interface ClientReviewsShowcaseProps {
  data: ClientReviewsShowcaseBlockData;
}

/**
 * ClientReviewsShowcase — Server Component
 * 
 * Curated Editorial Bento Showcase on the homepage landing flow.
 * Links directly to the full /reviews showcase.
 */
export async function ClientReviewsShowcase({ data }: ClientReviewsShowcaseProps) {
  const reviews = await ReviewService.getFeaturedReviews(data.limit || 5);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#FAF8F5] py-20 px-4 sm:px-8 border-b border-[#18181B]/10">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#18181B]/10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#9A3412]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Client Work & Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#18181B] tracking-tight">
              {data.title || "Crafted for Homes & Commercial Spaces"}
            </h2>
            {data.subtitle && (
              <p className="text-sm text-[#71717A] font-light leading-relaxed">
                {data.subtitle}
              </p>
            )}
          </div>

          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#18181B] hover:bg-[#9A3412] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-xs shrink-0 self-start md:self-auto group"
          >
            <span>Explore All Client Work</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl border border-[#18181B]/10 p-6 flex flex-col justify-between hover:border-[#18181B]/25 hover:shadow-md transition-all group"
            >
              <div className="space-y-4">
                {/* Header: Type Pill & Stars */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold",
                      rev.client_type === "B2B"
                        ? "bg-amber-50 text-amber-900 border border-amber-200"
                        : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    )}
                  >
                    {rev.client_type === "B2B" ? "Commercial Commission" : "Homeowner Project"}
                  </span>

                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3 h-3",
                          i < rev.rating
                            ? "fill-amber-400 text-amber-500"
                            : "text-zinc-200"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Project Title */}
                <h3 className="text-base font-serif font-bold text-[#18181B] tracking-tight group-hover:text-[#9A3412] transition-colors">
                  {rev.project_title}
                </h3>

                {/* Review Excerpt */}
                <p className="text-xs text-[#52525B] leading-relaxed italic line-clamp-4">
                  &ldquo;{rev.review_text}&rdquo;
                </p>

                {/* Photos if present */}
                {rev.media_urls && rev.media_urls.length > 0 && (
                  <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-zinc-100 border border-[#18181B]/10">
                    <Image
                      src={rev.media_urls[0]}
                      alt={rev.project_title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 90vw, 30vw"
                    />
                  </div>
                )}
              </div>

              {/* Client Footer */}
              <div className="pt-4 mt-4 border-t border-[#18181B]/10 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#18181B] flex items-center gap-1">
                    <span>{rev.client_name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </p>
                  <p className="text-[11px] text-[#71717A]">{rev.company_or_location}</p>
                </div>

                <Link
                  href="/reviews"
                  className="text-xs font-semibold text-[#9A3412] hover:underline"
                >
                  View Story →
                </Link>
              </div>
            </div>
          ))}

          {/* CTA Card in the Grid */}
          <div className="bg-[#18181B] text-[#FAF8F5] rounded-3xl p-8 flex flex-col justify-between border border-white/10 shadow-xl space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400">
                Direct Craftsmanship
              </span>
              <h3 className="text-2xl font-serif font-bold text-white tracking-tight">
                Want to Share Your Space or Commission Steel?
              </h3>
              <p className="text-xs text-[#FAF8F5]/80 font-light leading-relaxed">
                Browse our complete archive of over 500+ installed bedroom wardrobes, lockers, and living setups across the region.
              </p>
            </div>

            <Link
              href="/reviews"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#FAF8F5] text-[#18181B] text-xs font-semibold uppercase tracking-wider transition-all"
            >
              <span>See Full Client Portfolio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

