"use client";

import { ShoppingBag, ShieldCheck, MessageCircle, Phone, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TactileButton } from "@/components/ui/TactileButton";

interface StickyMobileActionBarProps {
  currentPrice: number;
  onAddToCart: () => void;
  isAdded?: boolean;
  selectedFinishName?: string;
  selectedSizeLabel?: string;
  waUrl?: string;
  callUrl?: string;
  className?: string;
}

/**
 * StickyMobileActionBar — Tactile Mobile-Only Sticky Bottom Bar
 * 
 * - Fixed container: bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md p-3
 * - iOS Safe-Area Padding: pb-[max(0.75rem,env(safe-area-inset-bottom))]
 * - Live dynamic price display
 * - TactileButton with "Add to Cart" / "Added to Cart ✓"
 * - Instant WhatsApp inquiry icon button
 * - Direct Call icon button
 */
export function StickyMobileActionBar({
  currentPrice,
  onAddToCart,
  isAdded = false,
  selectedFinishName,
  selectedSizeLabel,
  waUrl,
  callUrl,
  className,
}: StickyMobileActionBarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 flex lg:hidden flex-col gap-2 bg-white/95 backdrop-blur-md px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-[#18181B]/10 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      {/* Top summary row */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-1.5 text-[#18181B]">
          <span className="font-bold text-sm tracking-tight font-mono">
            ₹{currentPrice.toLocaleString("en-IN")}
          </span>
          {selectedFinishName && (
            <span className="text-[#71717A] text-[11px] truncate max-w-[120px]">
              • {selectedFinishName}
            </span>
          )}
          {selectedSizeLabel && (
            <span className="text-[#71717A] text-[11px] truncate max-w-[90px]">
              • {selectedSizeLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-medium text-[#71717A]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#9A3412]" />
          <span>Pay balance on delivery</span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2">
        <TactileButton
          variant="primary"
          onClick={onAddToCart}
          className="flex-1 min-h-[46px] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>Added to Cart ✓</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </TactileButton>

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Inquire on WhatsApp"
            className="w-11 h-11 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-600/20 text-emerald-700 flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
          </a>
        )}

        {callUrl && (
          <a
            href={callUrl}
            aria-label="Call directly"
            className="w-11 h-11 rounded-xl bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 border border-[#18181B]/15 text-[#18181B] flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <Phone className="w-4 h-4 text-[#9A3412]" />
          </a>
        )}
      </div>
    </div>
  );
}
