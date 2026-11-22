"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Home,
  Building,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Phone,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import type { ClientReview, SiteSettings } from "@/types/database";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { cn } from "@/lib/utils";

interface ReviewsClientViewProps {
  initialReviews: ClientReview[];
  settings: SiteSettings;
}

export function ReviewsClientView({
  initialReviews,
  settings,
}: ReviewsClientViewProps) {
  const [filter, setFilter] = useState<"ALL" | "D2C" | "B2B">("ALL");
  const [lightbox, setLightbox] = useState<{
    images: string[];
    currentIndex: number;
    title: string;
  } | null>(null);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightbox) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(null);
      } else if (e.key === "ArrowLeft") {
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                currentIndex:
                  (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
              }
            : null
        );
      } else if (e.key === "ArrowRight") {
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                currentIndex: (prev.currentIndex + 1) % prev.images.length,
              }
            : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox]);

  const filtered = initialReviews.filter((r) => {
    if (filter === "ALL") return true;
    return r.client_type === filter;
  });

  const d2cCount = initialReviews.filter((r) => r.client_type === "D2C").length;
  const b2bCount = initialReviews.filter((r) => r.client_type === "B2B").length;

  const totalPhotos = initialReviews.reduce(
    (acc, curr) => acc + (curr.media_urls?.length || 0),
    0
  );

  const { businessPhone, whatsappUrl } = useSiteSettings();
  const effectivePhone = businessPhone || settings.phone_primary || "+91 98765 43210";

  const whatsappHomeownerUrl = whatsappUrl(
    "Namaste! I saw your client showcase and would like to consult on custom steel furniture for my home."
  );

  const whatsappB2bUrl = whatsappUrl(
    "Namaste! I am reaching out regarding a commercial/institutional steel furniture commission. Please connect me with your project lead."
  );

  return (
    <div className="w-full bg-[#FAF8F5] pb-24">
      {/* ============================================================ */}
      {/* 1. EDITORIAL SHOWCASE HERO                                   */}
      {/* ============================================================ */}
      <section className="pt-12 sm:pt-16 pb-12 px-4 sm:px-8 max-w-7xl mx-auto border-b border-[#18181B]/10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18181B]/5 border border-[#18181B]/10 text-xs font-mono uppercase tracking-widest text-[#9A3412]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Commissions Portfolio</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#18181B] tracking-tight leading-[1.1]">
            Crafted for Private Residences & Commercial Spaces
          </h1>

          <p className="text-sm sm:text-base font-light text-[#71717A] max-w-2xl mx-auto leading-relaxed">
            Real installations, unvarnished homeowner experiences, and institutional steel engineering across Uttar Pradesh, Bihar, and beyond.
          </p>

          {/* Verified Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-2xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-white border border-[#18181B]/10 shadow-2xs">
              <span className="block text-2xl font-serif font-bold text-[#18181B]">500+</span>
              <span className="text-[11px] text-[#71717A] font-medium uppercase tracking-wider">
                Commissions
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-[#18181B]/10 shadow-2xs">
              <span className="block text-2xl font-serif font-bold text-amber-600">4.9 / 5</span>
              <span className="text-[11px] text-[#71717A] font-medium uppercase tracking-wider">
                Average Rating
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-[#18181B]/10 shadow-2xs">
              <span className="block text-2xl font-serif font-bold text-[#18181B]">
                {settings.service_districts.length || 10}+
              </span>
              <span className="text-[11px] text-[#71717A] font-medium uppercase tracking-wider">
                Districts Served
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-[#18181B]/10 shadow-2xs">
              <span className="block text-2xl font-serif font-bold text-emerald-700">100%</span>
              <span className="text-[11px] text-[#71717A] font-medium uppercase tracking-wider">
                Termite Proof
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Segmented Filter Bar */}
        <div className="mt-12 flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-[#18181B]/10 shadow-xs">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer",
                filter === "ALL"
                  ? "bg-[#18181B] text-white shadow-xs"
                  : "text-[#71717A] hover:text-[#18181B]"
              )}
            >
              All Client Work ({initialReviews.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("D2C")}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase inline-flex items-center gap-1.5 transition-all cursor-pointer",
                filter === "D2C"
                  ? "bg-[#18181B] text-white shadow-xs"
                  : "text-[#71717A] hover:text-[#18181B]"
              )}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Residential ({d2cCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter("B2B")}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase inline-flex items-center gap-1.5 transition-all cursor-pointer",
                filter === "B2B"
                  ? "bg-[#18181B] text-white shadow-xs"
                  : "text-[#71717A] hover:text-[#18181B]"
              )}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Commercial & B2B ({b2bCount})</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. REVIEWS & CRAFTSMANSHIP GRID                              */}
      {/* ============================================================ */}
      <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-[#18181B]/10 max-w-lg mx-auto">
            <ShieldCheck className="w-10 h-10 text-[#71717A] mx-auto opacity-40" />
            <h3 className="text-base font-serif font-bold text-[#18181B]">
              No reviews in this category yet
            </h3>
            <p className="text-xs text-[#71717A]">
              We are constantly archiving commissioned installations. Switch tabs to see all projects.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((review) => (
              <article
                key={review.id}
                className="bg-white rounded-3xl border border-[#18181B]/10 p-6 flex flex-col justify-between hover:border-[#18181B]/25 hover:shadow-md transition-all group"
              >
                <div className="space-y-4">
                  {/* Top Bar: Badge & Rating */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold",
                        review.client_type === "B2B"
                          ? "bg-amber-50 text-amber-900 border border-amber-200"
                          : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                      )}
                    >
                      {review.client_type === "B2B" ? "Commercial Commission" : "Homeowner Project"}
                    </span>

                    <div className="flex items-center gap-0.5" aria-label={`${review.rating} of 5 stars`}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < review.rating
                              ? "fill-amber-400 text-amber-500"
                              : "text-zinc-200"
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Commission Title */}
                  <h3 className="text-base font-serif font-bold text-[#18181B] tracking-tight group-hover:text-[#9A3412] transition-colors">
                    {review.project_title}
                  </h3>

                  {/* Review Quote */}
                  <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed italic bg-[#FAF8F5]/60 p-4 rounded-2xl border border-[#18181B]/5">
                    &ldquo;{review.review_text}&rdquo;
                  </p>

                  {/* Photo Gallery with Lightbox Trigger */}
                  {review.media_urls && review.media_urls.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#71717A]">
                        Installation Photos ({review.media_urls.length})
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {review.media_urls.slice(0, 3).map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setLightbox({
                                images: review.media_urls,
                                currentIndex: idx,
                                title: `${review.project_title} — ${review.client_name}`,
                              })
                            }
                            className="relative aspect-4/3 rounded-xl overflow-hidden bg-zinc-100 border border-[#18181B]/10 group/img cursor-pointer"
                          >
                            <Image
                              src={url}
                              alt={`${review.project_title} photo ${idx + 1}`}
                              fill
                              className="object-cover group-hover/img:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 30vw, 15vw"
                            />
                            {idx === 2 && review.media_urls.length > 3 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                                +{review.media_urls.length - 3}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer: Client Info & Linked Product */}
                <div className="pt-5 mt-4 border-t border-[#18181B]/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#18181B] flex items-center gap-1.5">
                        <span>{review.client_name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </p>
                      <p className="text-[11px] text-[#71717A] mt-0.5">
                        {review.company_or_location}
                      </p>
                    </div>

                    {review.is_featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>Curated</span>
                      </span>
                    )}
                  </div>

                  {/* Linked Product Button */}
                  {review.linked_product && (
                    <Link
                      href={`/categories/${review.linked_product.category?.slug || "wardrobes"}/${review.linked_product.slug}`}
                      className="inline-flex items-center justify-between w-full p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#18181B] text-[#18181B] hover:text-white transition-all text-xs font-semibold group/link border border-[#18181B]/10"
                    >
                      <span className="truncate">Piece: {review.linked_product.title_en}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 3. DUAL-TRACK CONVERSION BANNER                              */}
      {/* ============================================================ */}
      <section className="pt-8 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Track 1: Residential Homeowner */}
          <div className="bg-[#18181B] text-[#FAF8F5] rounded-3xl p-8 sm:p-10 flex flex-col justify-between space-y-6 border border-white/10 shadow-xl">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
                <Home className="w-4 h-4" />
                <span>Track 01 — Residential Homeowner</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                Commissioning a Master Bedroom or Living Setup?
              </h3>
              <p className="text-xs sm:text-sm text-[#FAF8F5]/80 font-light leading-relaxed">
                Connect directly with our senior steel craftsmen. We design custom internal partitions, mirror finishes, and secret lockable jewelry lockers tailored to your room dimensions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <a
                href={whatsappHomeownerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={`tel:${effectivePhone.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/20 hover:border-white text-white text-xs font-semibold uppercase tracking-wider transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Showroom</span>
              </a>
            </div>
          </div>

          {/* Track 2: Commercial / B2B / Architect */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between space-y-6 border border-[#18181B]/15 shadow-xl">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#9A3412]">
                <Building className="w-4 h-4" />
                <span>Track 02 — Architect & Commercial B2B</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#18181B] tracking-tight">
                Architect, Builder, or Institutional Buyer?
              </h3>
              <p className="text-xs sm:text-sm text-[#71717A] font-light leading-relaxed">
                We manufacture bulk high-grade steel lockers, hospital storage, hotel wardrobe cabinetry, and hostel beds with direct factory pricing and technical CAD drawing support.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <a
                href={whatsappB2bUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#18181B] hover:bg-[#9A3412] text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Request B2B Technical Proposal</span>
              </a>

              <Link
                href="/categories"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[#18181B]/20 hover:border-[#18181B] text-[#18181B] text-xs font-semibold uppercase tracking-wider transition-all"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. HIGH-RES PHOTO LIGHTBOX MODAL                             */}
      {/* ============================================================ */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setLightbox(null)}
        >
          {/* Lightbox Header */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white pb-3 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                Craftsmanship Lightbox
              </p>
              <h4 className="text-sm font-serif font-bold text-white truncate max-w-md">
                {lightbox.title}
              </h4>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-white/70">
                {lightbox.currentIndex + 1} / {lightbox.images.length}
              </span>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Image with Prev/Next Controls */}
          <div
            className="relative w-full max-w-4xl h-[65vh] sm:h-[72vh] my-auto flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.images[lightbox.currentIndex]}
              alt={lightbox.title}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />

            {lightbox.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setLightbox((prev) =>
                      prev
                        ? {
                            ...prev,
                            currentIndex:
                              (prev.currentIndex - 1 + prev.images.length) %
                              prev.images.length,
                          }
                        : null
                    )
                  }
                  className="absolute left-2 sm:-left-12 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setLightbox((prev) =>
                      prev
                        ? {
                            ...prev,
                            currentIndex:
                              (prev.currentIndex + 1) % prev.images.length,
                          }
                        : null
                    )
                  }
                  className="absolute right-2 sm:-right-12 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Thumbnails Strip */}
          <div
            className="flex items-center gap-2 overflow-x-auto max-w-xl pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  setLightbox((prev) => (prev ? { ...prev, currentIndex: idx } : null))
                }
                className={cn(
                  "relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer",
                  idx === lightbox.currentIndex
                    ? "border-emerald-400 scale-105"
                    : "border-white/20 opacity-50 hover:opacity-100"
                )}
              >
                <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" sizes="48px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

