import React from "react";

export default function OrdersLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#18181B]/10">
        <div className="space-y-1.5">
          <div className="h-3.5 w-36 bg-[#9A3412]/15 rounded animate-pulse" />
          <div className="h-8 w-60 bg-[#18181B]/15 rounded-xl animate-pulse" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#18181B]/10 p-6 md:p-8 shadow-xs space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-xl bg-[#FAF8F5]/80 border border-[#18181B]/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#18181B]/10 animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-[#18181B]/15 rounded animate-pulse" />
                <div className="h-3 w-48 bg-[#18181B]/5 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-24 bg-[#18181B]/10 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
