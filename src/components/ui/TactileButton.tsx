"use client";

import React, { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "outline" | "whatsapp" | "ghost";
  children: React.ReactNode;
}

export function TactileButton({
  isLoading = false,
  loadingText,
  variant = "primary",
  children,
  className,
  disabled,
  onClick,
  type = "button",
  ...props
}: TactileButtonProps) {
  const [internalPending, setInternalPending] = useState(false);
  const [, startTransition] = useTransition();

  const isLocked = isLoading || internalPending || disabled;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }

    if (onClick) {
      const result = onClick(e) as unknown;
      // If onClick returns a Promise, lock until it settles
      if (result && typeof (result as Promise<unknown>).then === "function") {
        setInternalPending(true);
        startTransition(async () => {
          try {
            await result;
          } finally {
            setInternalPending(false);
          }
        });
      }
    }
  };

  const variantStyles = {
    primary:
      "bg-[#9A3412] hover:bg-[#b03c15] text-white border-transparent shadow-md active:bg-[#832c0f]",
    secondary:
      "bg-[#18181B] hover:bg-[#27272A] text-white border-transparent shadow-md active:bg-[#09090B]",
    outline:
      "bg-white hover:bg-[#FAF8F5] text-[#18181B] border-[#18181B]/15 hover:border-[#18181B] active:bg-[#F4F1EB]",
    whatsapp:
      "bg-[#25D366] hover:bg-[#20BA5A] text-white border-transparent shadow-md active:bg-[#1DA851]",
    ghost:
      "bg-transparent hover:bg-black/5 text-[#18181B] border-transparent",
  };

  return (
    <button
      type={type}
      disabled={isLocked}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer select-none touch-manipulation",
        "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {isLocked ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{loadingText || "Processing..."}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
