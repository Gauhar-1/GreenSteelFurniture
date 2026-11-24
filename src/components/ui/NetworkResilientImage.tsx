"use client";

import React, { useState, useEffect, useRef } from "react";
import Image, { type ImageProps } from "next/image";
import { Loader2, WifiOff, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NetworkResilientImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  containerClassName?: string;
  showSlowNetworkWarning?: boolean;
  slowNetworkThresholdMs?: number;
}

/**
 * NetworkResilientImage — High-Reliability Lazy Image Component
 * 
 * - Defaults to `loading="lazy"` unless `priority={true}` is specified.
 * - Skeleton Shimmer: Displays an animated placeholder while the asset is fetching.
 * - Slow-Network Detector: If download takes > 2.5s (configurable), displays an informative
 *   "Slow connection detected" badge so the user knows the site hasn't crashed.
 * - Error Recovery: On timeout or network failure, renders a friendly offline prompt with a
 *   single-click "Retry" button.
 * - Smooth Reveal: Transitions opacity from 0 to 100 on successful decode.
 */
export function NetworkResilientImage({
  src,
  alt,
  priority = false,
  className,
  containerClassName,
  showSlowNetworkWarning = true,
  slowNetworkThresholdMs = 2500,
  fill,
  sizes,
  ...restProps
}: NetworkResilientImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "slow" | "error">("loading");
  const [retryKey, setRetryKey] = useState(0);
  const slowTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setStatus("loading");

    if (showSlowNetworkWarning) {
      slowTimerRef.current = setTimeout(() => {
        setStatus((prev) => (prev === "loading" ? "slow" : prev));
      }, slowNetworkThresholdMs);
    }

    return () => {
      if (slowTimerRef.current) {
        clearTimeout(slowTimerRef.current);
      }
    };
  }, [src, retryKey, showSlowNetworkWarning, slowNetworkThresholdMs]);

  const handleLoad = () => {
    if (slowTimerRef.current) {
      clearTimeout(slowTimerRef.current);
    }
    setStatus("loaded");
  };

  const handleError = () => {
    if (slowTimerRef.current) {
      clearTimeout(slowTimerRef.current);
    }
    setStatus("error");
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus("loading");
    setRetryKey((k) => k + 1);
  };

  const isComplete = status === "loaded";
  const isSlow = status === "slow";
  const isError = status === "error";

  // Build cache-busted src on manual retry if needed
  const resolvedSrc = typeof src === "string" && retryKey > 0
    ? `${src}${src.includes("?") ? "&" : "?"}_retry=${retryKey}`
    : src;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fill ? "w-full h-full" : "inline-block",
        containerClassName
      )}
    >
      {/* 1. Shimmer Skeleton Background while Loading or Slow */}
      {!isComplete && !isError && (
        <div
          className="absolute inset-0 z-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-pulse pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* 2. Slow Network Informative Badge */}
      {isSlow && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center p-3 text-center bg-stone-100/90 backdrop-blur-xs pointer-events-none animate-in fade-in duration-300"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="w-5 h-5 text-[#9A3412] animate-spin mb-1.5 shrink-0" />
          <span className="text-xs font-semibold text-[#18181B] leading-tight">
            Slow connection detected
          </span>
          <span className="text-[10px] text-[#71717A] mt-0.5 max-w-[220px] leading-tight">
            Downloading high-res craft image...
          </span>
        </div>
      )}

      {/* 3. Graceful Error & Retry UI */}
      {isError && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center bg-[#FAF8F5] border border-[#18181B]/10 rounded-xl"
          role="alert"
        >
          <WifiOff className="w-5 h-5 sm:w-6 sm:h-6 text-[#71717A] mb-1.5" />
          <span className="text-xs font-semibold text-[#18181B] leading-tight">
            Network error loading image
          </span>
          <span className="text-[10px] text-[#71717A] mt-0.5 max-w-[200px] leading-tight">
            Please check your connection and retry.
          </span>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-2.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#18181B] text-white hover:bg-[#9A3412] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <RotateCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 4. Optimized Next.js Image */}
      {!isError && (
        <Image
          key={retryKey}
          src={resolvedSrc}
          alt={alt}
          fill={fill}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-500 ease-out",
            isComplete ? "opacity-100" : "opacity-0",
            className
          )}
          {...restProps}
        />
      )}
    </div>
  );
}

