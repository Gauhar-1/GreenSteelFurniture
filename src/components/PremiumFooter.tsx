"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, MessageCircle, ArrowUpRight, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumFooterProps {
  className?: string;
}

/**
 * PremiumFooter — Client Component
 * 
 * Deep Espresso Luxury Showroom Footer:
 * - Hidden automatically on /admin routes
 * - Column 1: Brand title, inviting phrase, physical store address.
 * - Column 2: Minimalist quick links.
 * - Column 3: Large bordered "Get Directions" button & WhatsApp concierge.
 * - Refined typography with clean hierarchy.
 */
export function PremiumFooter({ className }: PremiumFooterProps) {
  const pathname = usePathname();

  // Hide footer in admin panel
  if (pathname?.startsWith("/admin")) {
    return null;
  }
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
          {/* Column 1: Brand & Visit */}
          <div className="flex flex-col gap-4">
            <span className="font-serif text-lg tracking-[0.25em] uppercase font-semibold text-[#FAF8F5]">
              GREEN STEEL
            </span>
            <p className="text-sm font-light text-[#FAF8F5]/85 leading-relaxed max-w-sm">
              Experience pure steel in person. Our flagship design studio welcomes homeowners, architects, and interior designers.
            </p>
            <div className="mt-2 flex items-start gap-2.5 text-xs text-[#FAF8F5]/70 leading-relaxed">
              <MapPin className="w-4 h-4 text-[#FAF8F5]/50 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#FAF8F5]/90">Gorakhpur Flagship Studio</p>
                <p>NH-28 Industrial Corridor, Showroom & Design Studio</p>
                <p>Gorakhpur, Uttar Pradesh 273001</p>
                <p className="mt-1 text-[#FAF8F5]/50">Open Daily: 10:00 AM – 8:00 PM</p>
              </div>
            </div>
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
                  <span>Store Consultation</span>
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
                Walk through our life-sized steel bedrooms, walk-in closets, and modular dining setups.
              </p>
            </div>

            {/* Large Bordered Button: Get Directions */}
            <a
              href="https://maps.google.com/?q=Gorakhpur+Uttar+Pradesh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#FAF8F5] border border-[#FAF8F5]/30 hover:border-[#FAF8F5] hover:bg-white/5 transition-all min-h-[44px] group"
            >
              <Navigation className="w-4 h-4 text-[#FAF8F5]/70 group-hover:text-white transition-colors" />
              <span>Get Directions</span>
            </a>

            {/* WhatsApp Booking Concierge */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[11px] uppercase tracking-wider text-[#FAF8F5]/50">
                Direct WhatsApp Concierge:
              </span>
              <a
                href="https://wa.me/919876543210?text=Namaste!%20I%20would%20like%20to%20book%20a%20showroom%20visit."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-xs text-[#FAF8F5]/90 hover:text-white font-medium transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <span>+91 98765 43210 (Instant Reply)</span>
              </a>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-2.5 text-xs text-[#FAF8F5]/75 hover:text-white font-normal transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#FAF8F5]/70 shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span>Call Showroom Manager</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Clean Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#FAF8F5]/40 font-normal">
          <p>© 2026 Green Steel Furniture. Pure Steel Architecture. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Gorakhpur • Varanasi • Patna • Ranchi</span>
            <span className="hidden sm:inline">•</span>
            <span>Zero Middleman Markup</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
