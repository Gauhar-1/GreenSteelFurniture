import React from "react";

export default function ProductDetailLoading() {
  return (
    <div className="w-full min-h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-4.5rem)] lg:overflow-hidden bg-[#FAF8F5] animate-pulse">
      {/* Mobile: Top Stage + Bottom Sheet */}
      <div className="block lg:hidden w-full">
        <div className="h-[46dvh] w-full bg-[#EDE9E1] p-4 flex flex-col justify-between">
          <div className="h-3 w-28 bg-[#18181B]/10 rounded-full" />
          <div className="flex justify-center gap-1.5 pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-7 w-16 bg-white/60 rounded-full" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-t-3xl -mt-4 p-5 space-y-4">
          <div className="h-6 w-3/4 bg-[#18181B]/15 rounded-xl" />
          <div className="h-4 w-1/3 bg-[#18181B]/15 rounded-lg" />
          <div className="h-10 w-full bg-[#18181B]/10 rounded-2xl" />
        </div>
      </div>

      {/* Desktop: Locked 60/40 Viewport Split */}
      <div className="hidden lg:grid lg:grid-cols-12 h-full max-w-7xl mx-auto px-6 py-4 gap-8">
        {/* Left 7 Columns: Interactive Stage */}
        <div className="col-span-7 h-full flex flex-col justify-between p-4 bg-white/60 rounded-3xl border border-[#18181B]/10">
          <div className="w-full flex-1 max-h-[68vh] rounded-2xl bg-[#EDE9E1]" />
          <div className="flex items-center justify-center gap-2 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-24 bg-[#18181B]/10 rounded-full" />
            ))}
          </div>
        </div>

        {/* Right 5 Columns: Configuration Panel */}
        <div className="col-span-5 h-full flex flex-col justify-between py-2 space-y-5">
          <div className="space-y-4">
            <div className="h-3 w-36 bg-[#18181B]/10 rounded-full" />
            <div className="h-8 w-4/5 bg-[#18181B]/15 rounded-xl" />
            <div className="h-4 w-1/2 bg-[#18181B]/10 rounded-md" />
            <div className="h-7 w-1/3 bg-[#18181B]/15 rounded-lg" />
            <div className="pt-2 flex gap-2">
              <div className="w-8 h-8 rounded-full bg-[#18181B]/15" />
              <div className="w-8 h-8 rounded-full bg-[#18181B]/15" />
              <div className="w-8 h-8 rounded-full bg-[#18181B]/15" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="h-14 rounded-2xl bg-[#18181B]/5" />
              <div className="h-14 rounded-2xl bg-[#18181B]/5" />
            </div>
          </div>
          <div className="h-12 w-full bg-[#18181B]/15 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
