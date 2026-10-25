import React from "react";
import Link from "next/link";
import { LucideIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border-2 border-dashed border-[#18181B]/15 bg-white/60 backdrop-blur-xs",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#18181B]/10 flex items-center justify-center text-[#9A3412] mb-4 shadow-2xs">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-serif font-bold text-[#18181B] mb-1.5">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-[#71717A] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#18181B] hover:bg-[#9A3412] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{actionLabel}</span>
            </Link>
          ) : onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#18181B] hover:bg-[#9A3412] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{actionLabel}</span>
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
