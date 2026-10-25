"use client";

import { ArrowRight, ShieldCheck, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TactileButton } from "@/components/ui/TactileButton";

interface StickyMobileActionBarProps {
  currentPrice: number;
  tokenAmount?: number;
  onBookNow: () => void;
  selectedFinishName?: string;
  selectedSizeLabel?: string;
  waUrl?: string;
  className?: string;
}

/**
 * StickyMobileActionBar — Tactile Mobile-Only Sticky Bottom Bar
 * 
 * - Fixed container: bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md p-3 border-t border-[#18181B]/10
 * - Live dynamic price display
 * - TactileButton with "Reserve for ₹{tokenAmount} Token"
 * - Instant WhatsApp inquiry icon button
 */
export function StickyMobileActionBar({
  currentPrice,
  tokenAmount = 500,
  onBookNow,
  selectedFinishName,
  selectedSizeLabel,
  waUrl,
  className,
}: StickyMobileActionBarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 flex lg:hidden flex-col gap-2 bg-white/95 backdrop-blur-md p-3 border-t border-[#18181B]/10 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      {/* Top summary row */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-1.5 text-[#18181B]">
          <span className="font-bold text-sm tracking-tight">
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
          <span>Pay rest at delivery</span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2">
        <TactileButton
          variant="primary"
          onClick={onBookNow}
          className="flex-1 min-h-[46px] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md"
        >
          <span>Reserve for ₹{tokenAmount} Token</span>
          <ArrowRight className="w-4 h-4" />
        </TactileButton>

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ask on WhatsApp"
            className="w-11 h-11 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-600/20 text-emerald-700 flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
          </a>
        )}
      </div>
    </div>
  );
}
