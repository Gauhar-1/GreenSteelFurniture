"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Phone,
  MessageCircle,
  ArrowUpRight,
  Navigation,
  Factory,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type SiteSettings, DEFAULT_SITE_SETTINGS } from "@/types/database";
import { useSiteSettings } from "@/context/SiteSettingsContext";

interface PremiumFooterProps {
  className?: string;
  settings?: SiteSettings;
}

/**
 * PremiumFooter — Client Component
 * 
 * Deep Espresso Luxury Showroom Footer:
 * - Hidden automatically on /admin routes
 * - Column 1: Brand title, inviting tagline, showroom studio & factory works addresses.
 * - Column 2: Minimalist quick links (including Client Work / Reviews).
 * - Column 3: Large bordered "Get Directions" button & direct WhatsApp/phone concierge.
 * - Service Districts Grid: Dynamic white-glove delivery districts list.
 */
export function PremiumFooter({ className, settings }: PremiumFooterProps) {
  const pathname = usePathname();
  const context = useSiteSettings();

  // Hide footer in admin panel
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const s = settings || context.settings || DEFAULT_SITE_SETTINGS;
  const effectiveWa = context.whatsappPhone || (s.whatsapp_number || "919876543210").replace(/[^0-9]/g, "");
  const effectiveBiz = context.businessPhone || s.phone_primary || `+${effectiveWa}`;
  const whatsappUrl = context.whatsappUrl(
    "Namaste! I am exploring Green Steel Furniture and would like to consult with your studio team."
  );

  return (
    <footer
      id="visit-store"
      aria-label="Footer and Store Information"
      className={cn(
        "w-full bg-[#18181B] text-[#FAF8F5] pt-16 sm:pt-20 pb-12 px-6 sm:px-10 lg:px-14 border-t border-white/10 scroll-mt-20",
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Studio Coordinates */}
          <div className="flex flex-col gap-4">
            <span className="font-serif text-lg tracking-[0.25em] uppercase font-semibold text-[#FAF8F5]">
              {s.brand_name || "GREEN STEEL"}
            </span>
            <p className="text-sm font-light text-[#FAF8F5]/85 leading-relaxed max-w-sm">
              {s.footer_tagline ||
                "Pure heavy-gauge steel furniture engineered for generations. Handcrafted in our Gorakhpur industrial studio."}
            </p>

            <div className="mt-2 space-y-3 text-xs text-[#FAF8F5]/70 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#FAF8F5]/90">Flagship Studio</p>
                  <p>{s.showroom_address}</p>
                </div>
              </div>

              {s.factory_address && (
                <div className="flex items-start gap-2.5">
                  <Factory className="w-4 h-4 text-[#FAF8F5]/40 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#FAF8F5]/80">Factory Works</p>
                    <p>{s.factory_address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2.5 text-[#FAF8F5]/60 pt-1">
                <Clock className="w-3.5 h-3.5 text-[#FAF8F5]/50 shrink-0" />
                <span>{s.operating_hours || "Mon–Sat, 9:30 AM – 8:00 PM"}</span>
              </div>
            </div>

            {/* Social Links */}
            {(s.social_links?.instagram || s.social_links?.facebook || s.social_links?.youtube) && (
              <div className="flex items-center gap-3 pt-2">
                {s.social_links.instagram && (
                  <a
                    href={s.social_links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-[#FAF8F5]/70 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {s.social_links.facebook && (
                  <a
                    href={s.social_links.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-[#FAF8F5]/70 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {s.social_links.youtube && (
                  <a
                    href={s.social_links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-[#FAF8F5]/70 hover:text-white transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-4 md:pl-8">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#FAF8F5]/50">
              Navigation
            </span>
            <ul className="flex flex-col gap-2.5 text-xs tracking-wider uppercase font-medium">
              <li>
                <Link
                  href="/categories"
                  className="text-[#FAF8F5]/80 hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  <span>All Collections</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/reviews"
                  className="text-[#FAF8F5]/80 hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  <span className="text-emerald-400 font-semibold">Client Work & Reviews</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/#spaces"
                  className="text-[#FAF8F5]/80 hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Spaces & Collections</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/#design-by-color"
                  className="text-[#FAF8F5]/80 hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Design by Color</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog"
                  className="text-[#FAF8F5]/80 hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Factory Direct Warranty</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/#visit-store"
                  className="text-[#FAF8F5]/80 hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Showroom Consultation</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Action & Direct Concierge */}
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#FAF8F5]/50 block mb-2">
                Plan Your Visit
              </span>
              <p className="text-xs text-[#FAF8F5]/75 leading-relaxed">
                Walk through life-sized steel bedrooms, modular walk-in wardrobes, and heavy-gauge home furnishings.
              </p>
            </div>

            {/* Large Bordered Button: Get Directions */}
            {s.google_maps_url && (
              <a
                href={s.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#FAF8F5] border border-[#FAF8F5]/30 hover:border-[#FAF8F5] hover:bg-white/5 transition-all min-h-[44px] group"
              >
                <Navigation className="w-4 h-4 text-[#FAF8F5]/70 group-hover:text-white transition-colors" />
                <span>Get Directions (Google Maps)</span>
              </a>
            )}

            {/* Direct Concierge Hotlines */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[11px] uppercase tracking-wider text-[#FAF8F5]/50">
                Direct WhatsApp Concierge:
              </span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-xs text-[#FAF8F5]/90 hover:text-white font-medium transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <span>+{effectiveWa} (Instant Reply)</span>
              </a>

              {effectiveBiz && (
                <a
                  href={`tel:${effectiveBiz.replace(/[^0-9+]/g, "")}`}
                  className="inline-flex items-center gap-2.5 text-xs text-[#FAF8F5]/75 hover:text-white font-normal transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#FAF8F5]/70 shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span>Call {effectiveBiz}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Operating & Delivery Districts Showcase */}
        {s.service_districts && s.service_districts.length > 0 && (
          <div className="py-8 border-b border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs uppercase tracking-widest font-semibold text-[#FAF8F5]/70">
                Direct White-Glove Delivery & Installation Across {s.service_districts.length} Districts
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {s.service_districts.map((district) => (
                <span
                  key={district}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#FAF8F5]/85 font-medium hover:border-emerald-400/40 hover:bg-white/10 transition-colors"
                >
                  {district}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Bar: Clean Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#FAF8F5]/40 font-normal">
          <p>© {new Date().getFullYear()} {s.brand_name || "Green Steel Furniture"}. Pure Heavy-Gauge Steel Architecture. All rights reserved.</p>
          <div className="flex items-center gap-4 sm:gap-6">
            <span>Direct Factory Pricing</span>
            <span>•</span>
            <span>Zero Termite Risk</span>
            <span>•</span>
            <span>Lifetime Craftsmanship</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
