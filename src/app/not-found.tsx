import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-24 bg-[#FAF8F5]">
      <div className="max-w-md w-full text-center space-y-6">
        <span className="text-xs font-mono font-semibold uppercase tracking-[0.25em] text-[#9A3412]">
          404 — Page Not Found
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#18181B] tracking-tight">
          Piece Not in Collection
        </h1>
        <p className="text-sm text-[#71717A] leading-relaxed">
          The furniture piece or showroom corridor you requested could not be located. Browse our active collections or return to the studio gallery.
        </p>
        <div className="pt-2 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] bg-[#18181B] hover:bg-[#18181B]/90 transition-all shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#18181B] border border-[#18181B]/15 hover:border-[#18181B] bg-white transition-all"
          >
            <span>Explore Collections</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

