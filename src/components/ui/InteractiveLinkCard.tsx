"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveLinkCardProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
  showSpinnerBadge?: boolean;
}

export function InteractiveLinkCard({
  href,
  children,
  className,
  ariaLabel,
  onClick,
  showSpinnerBadge = true,
}: InteractiveLinkCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow default handling for external links, modified clicks (Ctrl, Cmd, Shift), or right clicks
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.shiftKey ||
      href.startsWith("http://") ||
      href.startsWith("https://")
    ) {
      return;
    }

    e.preventDefault();
    onClick?.();

    // Trigger global top progress bar
    window.dispatchEvent(new Event("route-transition-start"));

    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-label={ariaLabel}
      className={cn(
        "relative block transition-all duration-200 select-none touch-manipulation",
        isPending && "scale-[0.985] opacity-85 pointer-events-none cursor-wait",
        className
      )}
    >
      {children}

      {/* Sleek Frosted-Glass Loading Overlay */}
      {isPending && showSpinnerBadge && (
        <div
          aria-live="polite"
          className="absolute inset-0 bg-[#FAF8F5]/30 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-30 transition-opacity"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 text-[#18181B] border border-[#18181B]/15 shadow-lg text-[11px] font-semibold tracking-wide">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9A3412]" />
            <span>Loading Showroom...</span>
          </div>
        </div>
      )}
    </a>
  );
}
