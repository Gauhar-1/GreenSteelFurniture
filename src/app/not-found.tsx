import Link from "next/link";
import { ArrowLeft, Compass, Star } from "lucide-react";
import { BrandLoader } from "@/components/ui/BrandLoader";

export const metadata = {
  title: "404 — Piece Not Found | Green Steel Furniture",
  description: "The requested showroom corridor or furniture piece could not be located.",
};

export default function NotFound() {
  return (
    <main className="min-h-[75dvh] flex items-center justify-center px-6 py-20 bg-[#FAF8F5]">
      <div className="max-w-md w-full text-center space-y-6">
        {/* GS Monogram Brand Mark */}
        <div className="flex justify-center">
          <div className="w-16 h-16">
            <BrandLoader variant="inline" showLabel={false} className="w-16 h-16" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#163826]">
            404 — Studio Archive
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#18181B] tracking-tight">
            This Piece or Page Could Not Be Found
          </h1>
          <p className="text-sm text-[#71717A] leading-relaxed pt-1">
            The architectural piece or showroom corridor you requested has moved or is not in our active collection. Explore our live catalog or return to the main gallery.
          </p>
        </div>

        {/* Action Links */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] bg-[#18181B] hover:bg-[#163826] transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Explore Showroom</span>
          </Link>
          <Link
            href="/categories"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#18181B] border border-[#18181B]/15 hover:border-[#18181B] bg-white transition-colors shadow-2xs"
          >
            <Compass className="w-3.5 h-3.5 text-[#163826]" />
            <span>Browse Categories</span>
          </Link>
          <Link
            href="/reviews"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#71717A] hover:text-[#18181B] border border-transparent hover:border-[#18181B]/15 transition-colors"
          >
            <Star className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Client Work</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
